begin;

-- Anuncios: lectura pública y gestión administrativa.
drop policy "Permitir gestión total de anuncios" on public.anuncios;

create policy anuncios_lectura_publica on public.anuncios
    for select to anon, authenticated
    using (true);

create policy anuncios_insert_admin on public.anuncios
    for insert to authenticated
    with check ((select public.es_admin_comercios_utrera()));

create policy anuncios_update_admin on public.anuncios
    for update to authenticated
    using ((select public.es_admin_comercios_utrera()))
    with check ((select public.es_admin_comercios_utrera()));

create policy anuncios_delete_admin on public.anuncios
    for delete to authenticated
    using ((select public.es_admin_comercios_utrera()));

-- Guía comercial: conservar la lectura y los controles restrictivos.
drop policy gestor_comercios_insert on public.comercios_utrera;
drop policy gestor_comercios_update on public.comercios_utrera;

create policy gestor_comercios_insert on public.comercios_utrera
    for insert to authenticated
    with check ((select public.es_admin_comercios_utrera()));

create policy gestor_comercios_update on public.comercios_utrera
    for update to authenticated
    using ((select public.es_admin_comercios_utrera()))
    with check ((select public.es_admin_comercios_utrera()));

-- PostgreSQL exige el privilegio de tabla y la política RLS.
create policy comercios_utrera_delete_admin on public.comercios_utrera
    for delete to authenticated
    using ((select public.es_admin_comercios_utrera()));

grant delete on table public.comercios_utrera to authenticated;

-- Tabla comercios: conservar la lectura pública y limitar las escrituras.
drop policy "Permitir gestión total de comercios" on public.comercios;
drop policy gestor_comercios_insert on public.comercios;
drop policy gestor_comercios_update on public.comercios;

create policy comercios_lectura_publica on public.comercios
    for select to anon, authenticated
    using (true);

create policy gestor_comercios_insert on public.comercios
    for insert to authenticated
    with check ((select public.es_admin_comercios_utrera()));

create policy gestor_comercios_update on public.comercios
    for update to authenticated
    using ((select public.es_admin_comercios_utrera()))
    with check ((select public.es_admin_comercios_utrera()));

commit;
