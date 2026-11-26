begin;

create table public.utreramarket_promociones (
    comercio_id bigint primary key references public.comercios_utrera(id) on delete cascade,
    activa boolean not null default false,
    titulo text not null default '' check (char_length(titulo) <= 160),
    descripcion text check (char_length(descripcion) <= 400),
    imagen text check (imagen is null or (length(imagen) <= 1000000 and imagen ~ '^data:image/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$')),
    precio_habitual numeric check (precio_habitual between 0 and 9999999 and scale(precio_habitual) <= 2),
    precio_oferta numeric check (precio_oferta between 0 and 9999999 and scale(precio_oferta) <= 2),
    finaliza date,
    web_url text check (web_url is null or (length(web_url) <= 2048 and web_url like 'https://%')),
    check (not activa or char_length(btrim(titulo)) > 0)
);

insert into public.utreramarket_promociones (comercio_id, activa, titulo)
select comercio_id, true, btrim(promocion)
from public.utreramarket_escaparates
where nullif(btrim(promocion), '') is not null;

alter table public.utreramarket_promociones enable row level security;
revoke all on public.utreramarket_promociones from public, anon, authenticated;
grant select on public.utreramarket_promociones to anon, authenticated;
grant insert, update on public.utreramarket_promociones to authenticated;

create policy promociones_publicadas on public.utreramarket_promociones
    for select to anon, authenticated using (
        activa and (finaliza is null or finaliza >= (now() at time zone 'Europe/Madrid')::date)
        and exists (
            select 1 from public.utreramarket_escaparates as escaparate
            where escaparate.comercio_id = utreramarket_promociones.comercio_id and escaparate.activo
        )
    );
create policy promociones_admin_select on public.utreramarket_promociones
    for select to authenticated using ((select public.es_admin_comercios_utrera()));
create policy promociones_admin_insert on public.utreramarket_promociones
    for insert to authenticated with check ((select public.es_admin_comercios_utrera()));
create policy promociones_admin_update on public.utreramarket_promociones
    for update to authenticated using ((select public.es_admin_comercios_utrera()))
    with check ((select public.es_admin_comercios_utrera()));

commit;
