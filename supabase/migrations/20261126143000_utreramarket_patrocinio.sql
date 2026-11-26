begin;

alter table public.utreramarket_campana add column imagen text
    check (imagen is null or (length(imagen) <= 1000000 and imagen ~ '^data:image/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$'));

create table public.utreramarket_patrocinio (
    id smallint primary key default 1 check (id = 1),
    activo boolean not null default false,
    nombre text not null default '' check (char_length(nombre) <= 100),
    eslogan text check (char_length(eslogan) <= 160),
    imagen text check (imagen is null or (length(imagen) <= 1000000 and imagen ~ '^data:image/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$')),
    web_url text check (web_url is null or (length(web_url) <= 2048 and web_url like 'https://%')),
    check (not activo or char_length(btrim(nombre)) > 0)
);

insert into public.utreramarket_patrocinio (id, activo, nombre)
select 1, activa, btrim(patrocinador)
from public.utreramarket_campana where nullif(btrim(patrocinador), '') is not null;

alter table public.utreramarket_patrocinio enable row level security;
revoke all on public.utreramarket_patrocinio from public, anon, authenticated;
grant select on public.utreramarket_patrocinio to anon, authenticated;
grant insert, update on public.utreramarket_patrocinio to authenticated;

create policy patrocinio_publicado on public.utreramarket_patrocinio
    for select to anon, authenticated using (activo);
create policy patrocinio_admin_select on public.utreramarket_patrocinio
    for select to authenticated using ((select public.es_admin_comercios_utrera()));
create policy patrocinio_admin_insert on public.utreramarket_patrocinio
    for insert to authenticated with check ((select public.es_admin_comercios_utrera()));
create policy patrocinio_admin_update on public.utreramarket_patrocinio
    for update to authenticated using ((select public.es_admin_comercios_utrera()))
    with check ((select public.es_admin_comercios_utrera()));

commit;
