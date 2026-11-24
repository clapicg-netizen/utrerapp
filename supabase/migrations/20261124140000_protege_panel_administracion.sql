begin;

drop policy "Permitir gestión total de anuncios" on public.anuncios;
create policy anuncios_lectura_publica on public.anuncios
    for select to anon, authenticated using (true);
create policy anuncios_insert_admin on public.anuncios
    for insert to authenticated with check ((select public.es_admin_comercios_utrera()));
create policy anuncios_update_admin on public.anuncios
    for update to authenticated using ((select public.es_admin_comercios_utrera()))
    with check ((select public.es_admin_comercios_utrera()));
create policy anuncios_delete_admin on public.anuncios
    for delete to authenticated using ((select public.es_admin_comercios_utrera()));

create policy comercios_utrera_delete_admin on public.comercios_utrera
    for delete to authenticated using ((select public.es_admin_comercios_utrera()));

commit;
