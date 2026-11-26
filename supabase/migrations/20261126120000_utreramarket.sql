begin;

create table public.utreramarket_escaparates (
    comercio_id bigint primary key references public.comercios_utrera(id) on delete cascade,
    activo boolean not null default false,
    destacado boolean not null default false,
    categoria text check (categoria is null or char_length(btrim(categoria)) between 1 and 70),
    imagen_url text,
    web_url text,
    modalidad text not null default 'external' check (modalidad in ('external', 'embed')),
    url_autorizada text,
    url_compatible text,
    promocion text check (char_length(promocion) <= 160),
    enlaces jsonb not null default '[]'::jsonb check (
        case when jsonb_typeof(enlaces) = 'array' then jsonb_array_length(enlaces) <= 10 else false end
    )
);

create table public.utreramarket_campana (
    id smallint primary key default 1 check (id = 1),
    activa boolean not null default false,
    titulo text not null check (char_length(btrim(titulo)) between 1 and 100),
    descripcion text check (char_length(descripcion) <= 400),
    patrocinador text check (char_length(patrocinador) <= 100)
);

alter table public.utreramarket_escaparates enable row level security;
alter table public.utreramarket_campana enable row level security;

revoke all on public.utreramarket_escaparates, public.utreramarket_campana from public, anon, authenticated;
grant select on public.utreramarket_escaparates, public.utreramarket_campana to anon, authenticated;
grant insert, update on public.utreramarket_escaparates, public.utreramarket_campana to authenticated;

create policy escaparates_publicados on public.utreramarket_escaparates
    for select to anon, authenticated using (activo);
create policy escaparates_admin_select on public.utreramarket_escaparates
    for select to authenticated using ((select public.es_admin_comercios_utrera()));
create policy escaparates_admin_insert on public.utreramarket_escaparates
    for insert to authenticated with check ((select public.es_admin_comercios_utrera()));
create policy escaparates_admin_update on public.utreramarket_escaparates
    for update to authenticated using ((select public.es_admin_comercios_utrera()))
    with check ((select public.es_admin_comercios_utrera()));

create policy campana_publicada on public.utreramarket_campana
    for select to anon, authenticated using (activa);
create policy campana_admin_select on public.utreramarket_campana
    for select to authenticated using ((select public.es_admin_comercios_utrera()));
create policy campana_admin_insert on public.utreramarket_campana
    for insert to authenticated with check ((select public.es_admin_comercios_utrera()));
create policy campana_admin_update on public.utreramarket_campana
    for update to authenticated using ((select public.es_admin_comercios_utrera()))
    with check ((select public.es_admin_comercios_utrera()));

commit;
