-- Validar exclusivamente en utrerapp-pruebas hasta aprobar una promoción independiente.
begin;

create table public.programacion_cultural (
    id uuid primary key default gen_random_uuid(),
    seccion text not null default 'teatro' check (seccion in ('teatro','eventos_culturales')),
    titulo text not null check (length(btrim(titulo)) between 1 and 200),
    categoria text not null check (categoria in ('Teatro','Música','Humor','Infantil','Danza','Otras')),
    descripcion text not null default '',
    lugar text not null check (length(btrim(lugar)) > 0),
    direccion text not null default '',
    cartel_ruta text,
    estado text not null default 'borrador' check (estado in ('borrador','publicado','retirado')),
    check (cartel_ruta is null or cartel_ruta ~ ('^' || seccion || '/' || id::text || '/[0-9a-f-]{36}$'))
);

create table public.programacion_cultural_funciones (
    id uuid primary key default gen_random_uuid(),
    espectaculo_id uuid not null references public.programacion_cultural(id) on delete cascade,
    fecha date,
    hora time,
    fin time check (fin is null or (hora is not null and fin > hora)),
    precio_centimos integer check (precio_centimos >= 0),
    compra_url text check (compra_url ~ '^https://(www\.)?giglon\.com/(evento/[A-Za-z0-9_-]+/?|todos\?idEvent=[A-Za-z0-9_-]+)$'),
    estado_venta text not null default 'normal' check (estado_venta in ('normal','agotado','cancelado','cambio')),
    fuente text check (fuente in ('manual','giglon','ayuntamiento')),
    referencia_externa text,
    verificado_en timestamptz,
    unique (espectaculo_id, fecha, hora) deferrable initially immediate,
    unique (fuente, referencia_externa)
);

create index programacion_cultural_fecha_idx on public.programacion_cultural_funciones(fecha, hora);

revoke all on public.programacion_cultural, public.programacion_cultural_funciones from anon, authenticated;
grant select on public.programacion_cultural, public.programacion_cultural_funciones to anon, authenticated;
grant insert, update, delete on public.programacion_cultural, public.programacion_cultural_funciones to authenticated;

alter table public.programacion_cultural enable row level security;
alter table public.programacion_cultural_funciones enable row level security;

create policy cultura_lectura_publicada on public.programacion_cultural
    for select to anon, authenticated using (seccion = 'teatro' and estado = 'publicado');
create policy cultura_funcion_lectura_publicada on public.programacion_cultural_funciones
    for select to anon, authenticated using (fecha is not null and exists (
        select 1 from public.programacion_cultural e where e.id = espectaculo_id and e.seccion = 'teatro' and e.estado = 'publicado'
    ));

create policy cultura_personal_autorizado on public.programacion_cultural
    for all to authenticated
    using (seccion = 'teatro' and (select auth.jwt() -> 'app_metadata' ->> 'cultural_editor') = 'true')
    with check (seccion = 'teatro' and (select auth.jwt() -> 'app_metadata' ->> 'cultural_editor') = 'true');
create policy cultura_funcion_personal_autorizado on public.programacion_cultural_funciones
    for all to authenticated
    using ((select auth.jwt() -> 'app_metadata' ->> 'cultural_editor') = 'true' and exists (
        select 1 from public.programacion_cultural e where e.id = espectaculo_id and e.seccion = 'teatro'
    ))
    with check ((select auth.jwt() -> 'app_metadata' ->> 'cultural_editor') = 'true' and exists (
        select 1 from public.programacion_cultural e where e.id = espectaculo_id and e.seccion = 'teatro'
    ));

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('carteles-cultura','carteles-cultura',false,750000,array['image/png','image/jpeg','image/webp']);

create policy cultura_carteles_publicados on storage.objects
    for select to anon, authenticated
    using (bucket_id = 'carteles-cultura' and exists (
        select 1 from public.programacion_cultural e
        where e.seccion = 'teatro' and e.estado = 'publicado' and e.cartel_ruta = name
    ));

create policy cultura_carteles_editor on storage.objects
    for all to authenticated
    using (bucket_id = 'carteles-cultura' and name like 'teatro/%' and (select auth.jwt() -> 'app_metadata' ->> 'cultural_editor') = 'true')
    with check (bucket_id = 'carteles-cultura' and name like 'teatro/%' and (select auth.jwt() -> 'app_metadata' ->> 'cultural_editor') = 'true');

create function public.guardar_programacion_teatro(ficha jsonb, funciones jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
declare
    registro uuid := (ficha->>'id')::uuid;
begin
    if coalesce(auth.jwt()->'app_metadata'->>'cultural_editor','') <> 'true' then
        raise insufficient_privilege using message = 'Edición cultural no autorizada';
    end if;
    if jsonb_array_length(funciones) < 1 or (ficha->>'estado' = 'publicado' and exists (
        select 1 from jsonb_array_elements(funciones) f where f->>'fecha' is null
    )) then raise exception 'Confirma una fecha para cada función publicada'; end if;

    insert into public.programacion_cultural (id,titulo,categoria,descripcion,lugar,direccion,cartel_ruta,estado)
    values (registro,ficha->>'titulo',ficha->>'categoria',ficha->>'descripcion',ficha->>'lugar',ficha->>'direccion',ficha->>'cartel_ruta',ficha->>'estado')
    on conflict (id) do update set titulo=excluded.titulo,categoria=excluded.categoria,descripcion=excluded.descripcion,
        lugar=excluded.lugar,direccion=excluded.direccion,cartel_ruta=excluded.cartel_ruta,estado=excluded.estado;

    -- Reemplazo atómico que conserva los identificadores de los pases existentes.
    set constraints all deferred;
    delete from public.programacion_cultural_funciones f where f.espectaculo_id = registro and not exists (
        select 1 from jsonb_array_elements(funciones) entrada where (entrada->>'id')::uuid=f.id
    );
    insert into public.programacion_cultural_funciones (id,espectaculo_id,fecha,hora,fin,precio_centimos,compra_url,estado_venta)
    select f.id,registro,f.fecha,f.hora,f.fin,f.precio_centimos,f.compra_url,f.estado_venta
    from jsonb_to_recordset(funciones) f(id uuid,fecha date,hora time,fin time,precio_centimos integer,compra_url text,estado_venta text)
    on conflict (id) do update set fecha=excluded.fecha,hora=excluded.hora,fin=excluded.fin,
        precio_centimos=excluded.precio_centimos,compra_url=excluded.compra_url,estado_venta=excluded.estado_venta
    where programacion_cultural_funciones.espectaculo_id=registro;
    if (select count(*) from public.programacion_cultural_funciones where espectaculo_id=registro) <> jsonb_array_length(funciones) then
        raise exception 'No se pudieron guardar todas las funciones';
    end if;
end;
$$;
revoke all on function public.guardar_programacion_teatro(jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.guardar_programacion_teatro(jsonb,jsonb) to authenticated;
commit;
