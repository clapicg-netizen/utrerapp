begin;

create table public.admin_comercios_utrera (
    user_id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);
alter table public.admin_comercios_utrera enable row level security;
revoke all on public.admin_comercios_utrera from public, anon, authenticated;
grant select on public.admin_comercios_utrera to authenticated;
create policy admin_comercios_propia_membership
    on public.admin_comercios_utrera for select to authenticated
    using (user_id = (select auth.uid()));

create function public.es_admin_comercios_utrera()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
    select exists (
        select 1 from public.admin_comercios_utrera
        where user_id = (select auth.uid())
    );
$$;
revoke all on function public.es_admin_comercios_utrera() from public, anon, authenticated;
grant execute on function public.es_admin_comercios_utrera() to authenticated;

-- Preserve public reads and require an administrator for writes across the guide and its catalogues.
alter table public.comercios_utrera enable row level security;
create policy guia_comercios_lectura_publica
    on public.comercios_utrera for select to anon, authenticated using (true);

do $$
declare
    tabla text;
begin
    foreach tabla in array array['comercios_utrera', 'comercios', 'especial1_items', 'especial2_items']
    loop
        execute format('alter table public.%I enable row level security', tabla);
        execute format('revoke insert, update, delete, truncate on public.%I from public, anon, authenticated', tabla);
        execute format('grant insert, update on public.%I to authenticated', tabla);
        execute format('create policy gestor_comercios_insert on public.%I for insert to authenticated with check (true)', tabla);
        execute format('create policy gestor_comercios_update on public.%I for update to authenticated using (true) with check (true)', tabla);
        execute format('create policy gestor_comercios_insert_guard on public.%I as restrictive for insert to authenticated with check ((select public.es_admin_comercios_utrera()))', tabla);
        execute format('create policy gestor_comercios_update_guard on public.%I as restrictive for update to authenticated using ((select public.es_admin_comercios_utrera())) with check ((select public.es_admin_comercios_utrera()))', tabla);
    end loop;
end
$$;

-- Restrictive policies override the previous permissive policy for writes in this
-- bucket. Other buckets and public reads are unaffected.
create policy gestor_media_insert_anon_guard on storage.objects
    as restrictive for insert to anon with check (bucket_id <> 'comercios');
create policy gestor_media_insert_auth_guard on storage.objects
    as restrictive for insert to authenticated with check (
        bucket_id <> 'comercios' or (
            (select public.es_admin_comercios_utrera())
            and (storage.foldername(name))[1] = 'gestor'
            and (storage.foldername(name))[2] = (select auth.uid())::text
        )
    );
create policy gestor_media_insert on storage.objects
    for insert to authenticated with check (bucket_id = 'comercios');
create policy gestor_media_update_guard on storage.objects
    as restrictive for update to anon, authenticated
    using (bucket_id <> 'comercios') with check (bucket_id <> 'comercios');
create policy gestor_media_delete_guard on storage.objects
    as restrictive for delete to anon, authenticated using (bucket_id <> 'comercios');

commit;
