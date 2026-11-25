-- PROPUESTA. Revisar y probar con roles antes de mover a migrations/.
begin;

create table public.programacion_cultural (
    id uuid primary key default gen_random_uuid(),
    titulo text not null check (length(btrim(titulo)) between 1 and 200),
    categoria text not null check (categoria in ('Teatro','Música','Humor','Infantil','Danza','Otras')),
    descripcion text not null default '',
    lugar text not null check (length(btrim(lugar)) > 0),
    direccion text not null,
    cartel_ruta text,
    cartel_autorizado boolean not null default false,
    check (cartel_ruta is null or cartel_autorizado),
    estado text not null default 'borrador' check (estado in ('borrador','publicado','retirado'))
);

create table public.programacion_cultural_funciones (
    id uuid primary key default gen_random_uuid(),
    espectaculo_id uuid not null references public.programacion_cultural(id) on delete cascade,
    inicio timestamptz not null,
    fin timestamptz check (fin is null or fin > inicio),
    precio_centimos integer check (precio_centimos >= 0),
    compra_url text check (compra_url ~ '^https://(www\.)?giglon\.com/(evento/[A-Za-z0-9_-]+/?|todos\?idEvent=[A-Za-z0-9_-]+)$'),
    estado_venta text not null default 'normal' check (estado_venta in ('normal','agotado','cancelado','cambio')),
    fuente text check (fuente in ('manual','giglon','ayuntamiento')),
    referencia_externa text,
    verificado_en timestamptz,
    unique (espectaculo_id, inicio),
    unique (fuente, referencia_externa)
);

create index programacion_cultural_inicio_idx on public.programacion_cultural_funciones(inicio);

revoke all on public.programacion_cultural, public.programacion_cultural_funciones from anon, authenticated;
grant select on public.programacion_cultural, public.programacion_cultural_funciones to anon, authenticated;
grant insert, update, delete on public.programacion_cultural, public.programacion_cultural_funciones to authenticated;

alter table public.programacion_cultural enable row level security;
alter table public.programacion_cultural_funciones enable row level security;

create policy cultura_lectura_publicada on public.programacion_cultural
    for select to anon, authenticated using (estado = 'publicado');
create policy cultura_funcion_lectura_publicada on public.programacion_cultural_funciones
    for select to anon, authenticated using (
        exists (select 1 from public.programacion_cultural e where e.id = espectaculo_id and e.estado = 'publicado')
    );

create policy cultura_personal_autorizado on public.programacion_cultural
    for all to authenticated
    using ((select auth.jwt() -> 'app_metadata' ->> 'cultural_editor') = 'true')
    with check ((select auth.jwt() -> 'app_metadata' ->> 'cultural_editor') = 'true');
create policy cultura_funcion_personal_autorizado on public.programacion_cultural_funciones
    for all to authenticated
    using ((select auth.jwt() -> 'app_metadata' ->> 'cultural_editor') = 'true')
    with check ((select auth.jwt() -> 'app_metadata' ->> 'cultural_editor') = 'true');

-- Los objetos se publicarían al autorizar el cartel y publicar su ficha.
-- Pendiente de acordar el bucket privado y sus políticas antes de permitir cargas reales.
commit;
