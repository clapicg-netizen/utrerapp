begin;
alter table public.programacion_cultural_funciones
  add column precio_desde boolean not null default false,
  add constraint cultura_precio_desde_valido check (not precio_desde or (precio_centimos is not null and precio_centimos > 0));

create or replace function public.guardar_programacion_teatro(
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
      (id,espectaculo_id,fecha,hora,fin_fecha,fin_hora,precio_centimos,precio_desde,compra_url,estado_venta)
    values (pase_id,registro,(paso->>'fecha')::date,(paso->>'hora')::time,(paso->>'fin_fecha')::date,
      (paso->>'fin_hora')::time,(paso->>'precio_centimos')::integer,coalesce((paso->>'precio_desde')::boolean,false),paso->>'compra_url',paso->>'estado_venta')
    on conflict (id) do update set fecha=excluded.fecha, hora=excluded.hora, fin_fecha=excluded.fin_fecha,
      fin_hora=excluded.fin_hora, precio_centimos=excluded.precio_centimos,
      precio_desde=case when paso ? 'precio_desde' then excluded.precio_desde
        when excluded.precio_centimos is distinct from programacion_cultural_funciones.precio_centimos then false
        else programacion_cultural_funciones.precio_desde end,
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
commit;
