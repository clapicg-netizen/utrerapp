-- DDL aditiva validada en utrerapp-pruebas. Aplicar a producción solo con autorización.
-- Crea objetos vacíos. La autorización del editor se concede por separado.
begin;

create table public.programacion_cultural (
  id uuid primary key default gen_random_uuid(),
  seccion text not null default 'teatro' check (seccion = 'teatro'),
  titulo text not null check (length(btrim(titulo)) between 1 and 200),
  categoria text not null check (categoria in ('Teatro','Música','Humor','Infantil','Danza','Otras')),
  descripcion text not null default '',
  lugar text not null check (length(btrim(lugar)) > 0),
  direccion text not null default '',
  cartel_ruta text,
  estado text not null default 'borrador' check (estado in ('borrador','publicado','retirado')),
  revision bigint not null default 1,
  check (cartel_ruta is null or cartel_ruta ~ ('^teatro/' || id::text || '/[0-9a-f-]{36}$'))
);

create table public.programacion_cultural_funciones (
  id uuid primary key default gen_random_uuid(),
  espectaculo_id uuid not null references public.programacion_cultural(id) on delete restrict,
  fecha date,
  hora time,
  fin_fecha date,
  fin_hora time,
  precio_centimos integer check (precio_centimos >= 0),
  compra_url text check (compra_url ~ '^https://(www\.)?giglon\.com/(evento/[A-Za-z0-9_-]+/?|todos\?idEvent=[A-Za-z0-9_-]+)$'),
  estado_venta text not null default 'normal' check (estado_venta in ('normal','agotado','cancelado','cambio')),
  retirada_en timestamptz,
  retirada_por uuid,
  motivo_retirada text,
  check ((fin_fecha is null and fin_hora is null) or
    (fecha is not null and hora is not null and fin_fecha is not null and fin_hora is not null and
     fin_fecha + fin_hora > fecha + hora)),
  check ((retirada_en is null and retirada_por is null and motivo_retirada is null) or
    (retirada_en is not null and retirada_por is not null and motivo_retirada is not null and length(btrim(motivo_retirada)) > 0))
);

create unique index cultura_funcion_activa_unica
  on public.programacion_cultural_funciones (espectaculo_id, fecha, hora) nulls not distinct
  where retirada_en is null and fecha is not null;
create index cultura_funcion_fecha_idx on public.programacion_cultural_funciones(fecha, hora)
  where retirada_en is null;

create table public.programacion_cultural_historial (
  id bigint generated always as identity primary key,
  espectaculo_id uuid not null references public.programacion_cultural(id) on delete restrict,
  revision bigint not null,
  actor uuid not null,
  registrado_en timestamptz not null default clock_timestamp(),
  antes jsonb,
  despues jsonb not null,
  unique (espectaculo_id, revision)
);

-- Mantiene el filtro que ya utiliza el panel y exige, además, un permiso cultural
-- booleano en app_metadata, gestionado por el servidor.
create function public.es_editor_programacion_teatro()
returns boolean language sql stable security invoker set search_path = '' as $$
  select coalesce(auth.uid() is not null and
    auth.jwt()->'app_metadata'->'cultural_editor' = 'true'::jsonb and
    public.es_admin_comercios_utrera(), false);
$$;

revoke all on public.programacion_cultural, public.programacion_cultural_funciones,
  public.programacion_cultural_historial from public, anon, authenticated;
grant select on public.programacion_cultural, public.programacion_cultural_funciones to anon, authenticated;
grant select on public.programacion_cultural_historial to authenticated;
revoke all on function public.es_editor_programacion_teatro() from public, anon, authenticated;
grant execute on function public.es_editor_programacion_teatro() to authenticated;

alter table public.programacion_cultural enable row level security;
alter table public.programacion_cultural_funciones enable row level security;
alter table public.programacion_cultural_historial enable row level security;

create policy cultura_lectura_publicada on public.programacion_cultural
  for select to anon, authenticated using (seccion = 'teatro' and estado = 'publicado');
create policy cultura_funcion_lectura_publicada on public.programacion_cultural_funciones
  for select to anon, authenticated using (retirada_en is null and fecha is not null and exists (
    select 1 from public.programacion_cultural e where e.id = espectaculo_id and e.seccion = 'teatro' and e.estado = 'publicado'
  ));
create policy cultura_ficha_lectura_editor on public.programacion_cultural
  for select to authenticated using ((select public.es_editor_programacion_teatro()));
create policy cultura_funcion_lectura_editor on public.programacion_cultural_funciones
  for select to authenticated using ((select public.es_editor_programacion_teatro()));
create policy cultura_historial_lectura_editor on public.programacion_cultural_historial
  for select to authenticated using ((select public.es_editor_programacion_teatro()));

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('carteles-cultura','carteles-cultura',false,750000,array['image/png','image/jpeg','image/webp']);

-- Las políticas restrictivas impiden que una política permisiva general de Storage
-- amplíe acceso al nuevo bucket. Para el resto de buckets devuelven true.
create policy cultura_carteles_limite_anon on storage.objects as restrictive
  for select to anon using (bucket_id <> 'carteles-cultura' or exists (
    select 1 from public.programacion_cultural e where e.estado='publicado' and e.cartel_ruta = name
  ));
create policy cultura_carteles_limite_auth on storage.objects as restrictive
  for select to authenticated using (bucket_id <> 'carteles-cultura' or
    (select public.es_editor_programacion_teatro()) or exists (
      select 1 from public.programacion_cultural e where e.estado='publicado' and e.cartel_ruta = name
    ));
create policy cultura_carteles_publicados on storage.objects
  for select to anon, authenticated using (bucket_id='carteles-cultura' and exists (
    select 1 from public.programacion_cultural e where e.estado='publicado' and e.cartel_ruta = name
  ));
create policy cultura_carteles_editor on storage.objects
  for select to authenticated using (bucket_id='carteles-cultura' and (select public.es_editor_programacion_teatro()));
create policy cultura_carteles_tope_carga_anon on storage.objects as restrictive
  for insert to anon with check (bucket_id <> 'carteles-cultura');
create policy cultura_carteles_tope_carga_auth on storage.objects as restrictive
  for insert to authenticated with check (bucket_id <> 'carteles-cultura' or (
    name ~ '^teatro/[0-9a-f-]{36}/[0-9a-f-]{36}$' and (select public.es_editor_programacion_teatro())
  ));
create policy cultura_carteles_carga on storage.objects
  for insert to authenticated with check (
    bucket_id='carteles-cultura' and name ~ '^teatro/[0-9a-f-]{36}/[0-9a-f-]{36}$'
    and (select public.es_editor_programacion_teatro())
  );
create policy cultura_carteles_sin_sobrescritura on storage.objects as restrictive
  for update to anon, authenticated using (bucket_id <> 'carteles-cultura') with check (bucket_id <> 'carteles-cultura');
create policy cultura_carteles_sin_borrado on storage.objects as restrictive
  for delete to anon, authenticated using (bucket_id <> 'carteles-cultura');

-- Única entrada de escritura. Sin escritura directa para los roles web.
-- La lista de funciones es un conjunto de altas/ediciones explícitas, no un reemplazo.
create function public.guardar_programacion_teatro(
  ficha jsonb, revision_esperada bigint,
  funciones jsonb default '[]'::jsonb,
  retirar jsonb default '[]'::jsonb,
  restaurar uuid[] default '{}'::uuid[]
)
returns bigint language plpgsql security definer set search_path = '' as $$
declare
  registro uuid := (ficha->>'id')::uuid;
  actual bigint;
  siguiente bigint;
  previo jsonb;
  posterior jsonb;
  paso jsonb;
  pase_id uuid;
  pase_ids uuid[] := '{}'::uuid[];
  filas integer;
begin
  if not public.es_editor_programacion_teatro() then
    raise insufficient_privilege using message = 'Edición cultural no autorizada';
  end if;
  if registro is null or revision_esperada is null or revision_esperada < 0
    or jsonb_typeof(ficha) is distinct from 'object'
    or not (ficha ?& array['id','titulo','categoria','descripcion','lugar','direccion','cartel_ruta','estado'])
    or jsonb_typeof(funciones) is distinct from 'array'
    or jsonb_typeof(retirar) is distinct from 'array' or restaurar is null then
    raise exception 'Solicitud incompleta';
  end if;

  select e.revision into actual from public.programacion_cultural e where e.id=registro for update;
  if coalesce(actual,0) <> revision_esperada then
    raise exception 'La ficha cambió. Vuelve a cargarla antes de guardar';
  end if;
  if actual is not null then
    select jsonb_build_object('ficha',to_jsonb(e),'funciones',coalesce((
      select jsonb_agg(to_jsonb(f) order by f.id) from public.programacion_cultural_funciones f where f.espectaculo_id=registro
    ),'[]'::jsonb)) into previo from public.programacion_cultural e where e.id=registro;
  end if;
  if ficha->>'cartel_ruta' is not null and not exists (
    select 1 from storage.objects where bucket_id='carteles-cultura' and name=ficha->>'cartel_ruta'
  ) then raise exception 'El cartel no está en el almacenamiento cultural'; end if;

  if actual is null then
    insert into public.programacion_cultural(id,titulo,categoria,descripcion,lugar,direccion,cartel_ruta,estado)
    values(registro,ficha->>'titulo',ficha->>'categoria',ficha->>'descripcion',ficha->>'lugar',ficha->>'direccion',ficha->>'cartel_ruta',ficha->>'estado')
    returning revision into siguiente;
  else
    update public.programacion_cultural set titulo=ficha->>'titulo',categoria=ficha->>'categoria',
      descripcion=ficha->>'descripcion',lugar=ficha->>'lugar',direccion=ficha->>'direccion',
      cartel_ruta=ficha->>'cartel_ruta',estado=ficha->>'estado',revision=actual+1
    where id=registro returning revision into siguiente;
  end if;

  for paso in select value from jsonb_array_elements(retirar) loop
    pase_id := (paso->>'id')::uuid;
    update public.programacion_cultural_funciones
      set retirada_en=clock_timestamp(), retirada_por=auth.uid(), motivo_retirada=nullif(btrim(paso->>'motivo'),'')
      where id=pase_id and espectaculo_id=registro and retirada_en is null;
    if not found then raise exception 'Función no disponible para retirar'; end if;
    pase_ids := array_append(pase_ids,pase_id);
  end loop;

  for paso in select value from jsonb_array_elements(funciones) loop
    if jsonb_typeof(paso) is distinct from 'object' or not (paso ?& array[
      'id','fecha','hora','fin_fecha','fin_hora','precio_centimos','compra_url','estado_venta'
    ]) then raise exception 'Datos de función incompletos'; end if;
    pase_id := (paso->>'id')::uuid;
    if pase_id is null or pase_id=any(pase_ids) then raise exception 'Función repetida o sin identificador'; end if;
    pase_ids := array_append(pase_ids,pase_id);
    insert into public.programacion_cultural_funciones
      (id,espectaculo_id,fecha,hora,fin_fecha,fin_hora,precio_centimos,compra_url,estado_venta)
    values (pase_id,registro,(paso->>'fecha')::date,(paso->>'hora')::time,(paso->>'fin_fecha')::date,
      (paso->>'fin_hora')::time,(paso->>'precio_centimos')::integer,paso->>'compra_url',paso->>'estado_venta')
    on conflict (id) do update set fecha=excluded.fecha, hora=excluded.hora, fin_fecha=excluded.fin_fecha,
      fin_hora=excluded.fin_hora, precio_centimos=excluded.precio_centimos,
      compra_url=excluded.compra_url, estado_venta=excluded.estado_venta
    where programacion_cultural_funciones.espectaculo_id=registro and programacion_cultural_funciones.retirada_en is null;
    get diagnostics filas=row_count;
    if filas <> 1 then raise exception 'Función de otra ficha o ya retirada'; end if;
  end loop;

  foreach pase_id in array restaurar loop
    if pase_id is null or pase_id=any(pase_ids) then raise exception 'Función repetida o sin identificador'; end if;
    pase_ids := array_append(pase_ids,pase_id);
    update public.programacion_cultural_funciones
      set retirada_en=null, retirada_por=null, motivo_retirada=null
      where id=pase_id and espectaculo_id=registro and retirada_en is not null;
    if not found then raise exception 'Función no disponible para restaurar'; end if;
  end loop;

  if ficha->>'estado'='publicado' and (
    not exists (select 1 from public.programacion_cultural_funciones f where f.espectaculo_id=registro and f.retirada_en is null)
    or exists (select 1 from public.programacion_cultural_funciones f where f.espectaculo_id=registro and f.retirada_en is null and f.fecha is null)
  ) then raise exception 'La publicación requiere funciones activas con fecha confirmada'; end if;

  select jsonb_build_object('ficha',to_jsonb(e),'funciones',coalesce((
    select jsonb_agg(to_jsonb(f) order by f.id) from public.programacion_cultural_funciones f where f.espectaculo_id=registro
  ),'[]'::jsonb)) into posterior from public.programacion_cultural e where e.id=registro;
  insert into public.programacion_cultural_historial(espectaculo_id,revision,actor,antes,despues)
    values(registro,siguiente,auth.uid(),previo,posterior);
  return siguiente;
end;
$$;
revoke all on function public.guardar_programacion_teatro(jsonb,bigint,jsonb,jsonb,uuid[]) from public, anon, authenticated;
grant execute on function public.guardar_programacion_teatro(jsonb,bigint,jsonb,jsonb,uuid[]) to authenticated;

commit;
