-- NO EJECUTADO. Solo después de que se autoricen la migración y el ensayo
-- en utrerapp-pruebas. Cambios de prueba dentro de una transacción revertida.
begin;
select set_config('qa.admin',(select user_id::text from public.admin_comercios_utrera limit 1),true);
select set_config('qa.ordinario',(select u.id::text from auth.users u
  where not exists(select 1 from public.admin_comercios_utrera a where a.user_id=u.id) limit 1),true);
do $$ begin
  if current_setting('qa.admin',true) in ('',current_setting('qa.ordinario',true))
     or nullif(current_setting('qa.admin',true),'') is null
     or nullif(current_setting('qa.ordinario',true),'') is null
  then raise exception 'Se requieren dos identidades distintas de prueba'; end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('qa.ordinario'),'role','authenticated',
  'app_metadata',jsonb_build_object('cultural_editor',true))::text,true);
do $$ begin
  if public.es_editor_programacion_teatro() then raise exception 'Usuario fuera del panel autorizado'; end if;
  begin
    perform public.guardar_programacion_teatro('{}',0);
    raise exception 'RPC aceptó una cuenta sin acceso al panel';
  exception when insufficient_privilege then null;
  end;
end $$;

select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('qa.admin'),'role','authenticated',
  'user_metadata',jsonb_build_object('cultural_editor',true))::text,true);
do $$ begin
  if public.es_editor_programacion_teatro() then raise exception 'Se aceptó un permiso editable por el usuario'; end if;
end $$;

select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('qa.admin'),'role','authenticated',
  'app_metadata',jsonb_build_object('cultural_editor',true))::text,true);
do $$
declare
  ficha jsonb := '{"id":"f0000000-0000-4000-8000-000000000001","titulo":"Ensayo ficticio","categoria":"Teatro","descripcion":"Prueba","lugar":"Recinto ficticio","direccion":"","cartel_ruta":null,"estado":"borrador"}';
  pases jsonb := '[
    {"id":"f1000000-0000-4000-8000-000000000001","fecha":"2027-01-31","hora":"23:30","fin_fecha":"2027-02-01","fin_hora":"01:00","precio_centimos":null,"compra_url":null,"estado_venta":"normal"},
    {"id":"f2000000-0000-4000-8000-000000000001","fecha":"2027-02-01","hora":null,"fin_fecha":null,"fin_hora":null,"precio_centimos":0,"compra_url":null,"estado_venta":"normal"}
  ]';
  ruta text := 'teatro/f0000000-0000-4000-8000-000000000001/f3000000-0000-4000-8000-000000000001';
begin
  if not public.es_editor_programacion_teatro() then raise exception 'Editor rechazado'; end if;
  insert into storage.objects(bucket_id,name) values('carteles-cultura',ruta);
  ficha := jsonb_set(ficha,'{cartel_ruta}',to_jsonb(ruta));
  if public.guardar_programacion_teatro(ficha,0,pases)<>1 then raise exception 'Alta fallida'; end if;
  if public.guardar_programacion_teatro(ficha,1)<>2 then raise exception 'Edición fallida'; end if;
  if (select count(*) from public.programacion_cultural_funciones where espectaculo_id=(ficha->>'id')::uuid)<>2
  then raise exception 'Se perdió un pase omitido'; end if;
  begin
    perform public.guardar_programacion_teatro(ficha,2,jsonb_build_array((pases->0) - 'estado_venta'));
    raise exception 'Se aceptó una edición incompleta';
  exception when raise_exception then
    if sqlerrm<>'Datos de función incompletos' then raise; end if;
  end;
  begin
    perform public.guardar_programacion_teatro(ficha,2,jsonb_build_array(jsonb_set(pases->0,'{fin_fecha}','"2027-01-31"')));
    raise exception 'Se aceptó una hora final anterior al inicio';
  exception when check_violation then null;
  end;
  begin
    perform public.guardar_programacion_teatro(ficha,1);
    raise exception 'Se aceptó una revisión antigua';
  exception when raise_exception then
    if sqlerrm<>'La ficha cambió. Vuelve a cargarla antes de guardar' then raise; end if;
  end;
  begin
    delete from public.programacion_cultural_funciones where id=(pases->0->>'id')::uuid;
    raise exception 'Borrado directo concedido';
  exception when insufficient_privilege then null;
  end;
  begin
    delete from storage.objects where bucket_id='carteles-cultura' and name=ruta;
  exception when insufficient_privilege then null;
  end;
  if not exists(select 1 from storage.objects where bucket_id='carteles-cultura' and name=ruta)
  then raise exception 'El Storage permitió borrar el cartel'; end if;
  if public.guardar_programacion_teatro(ficha,2,'[]',jsonb_build_array(jsonb_build_object('id',pases->0->>'id','motivo','Prueba')))<>3
  then raise exception 'Retirada fallida'; end if;
end $$;

set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$ begin
  if exists(select from public.programacion_cultural where id='f0000000-0000-4000-8000-000000000001')
    or exists(select from public.programacion_cultural_funciones where espectaculo_id='f0000000-0000-4000-8000-000000000001')
    or exists(select from storage.objects where bucket_id='carteles-cultura' and name like 'teatro/f0000000-%')
  then raise exception 'Borrador visible al público'; end if;
  if has_function_privilege(current_user,'public.guardar_programacion_teatro(jsonb,bigint,jsonb,jsonb,uuid[])','EXECUTE')
    then raise exception 'RPC accesible por anónimo'; end if;
  if has_table_privilege(current_user,'public.programacion_cultural_historial','SELECT')
    then raise exception 'Historial accesible por anónimo'; end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('qa.admin'),'role','authenticated',
  'app_metadata',jsonb_build_object('cultural_editor',true))::text,true);
do $$
declare
  ficha jsonb;
begin
  select to_jsonb(e) || '{"estado":"publicado"}'::jsonb into ficha from public.programacion_cultural e where id='f0000000-0000-4000-8000-000000000001';
  if public.guardar_programacion_teatro(ficha,3)<>4 then raise exception 'Publicación fallida'; end if;
end $$;

select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('qa.ordinario'),'role','authenticated')::text,true);
do $$ begin
  if (select count(*) from public.programacion_cultural_funciones where espectaculo_id='f0000000-0000-4000-8000-000000000001')<>1
    or exists(select from public.programacion_cultural_historial where espectaculo_id='f0000000-0000-4000-8000-000000000001')
  then raise exception 'Visibilidad incorrecta para cuenta ordinaria'; end if;
  begin
    insert into storage.objects(bucket_id,name) values('carteles-cultura','teatro/f0000000-0000-4000-8000-000000000001/f4000000-0000-4000-8000-000000000001');
    raise exception 'Carga concedida a cuenta ordinaria';
  exception when insufficient_privilege then null;
  end;
end $$;

set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$ begin
  if (select count(*) from public.programacion_cultural where id='f0000000-0000-4000-8000-000000000001')<>1
    or (select count(*) from public.programacion_cultural_funciones where espectaculo_id='f0000000-0000-4000-8000-000000000001')<>1
    or (select count(*) from storage.objects where bucket_id='carteles-cultura' and name like 'teatro/f0000000-%')<>1
  then raise exception 'No se ve exactamente la publicación y su cartel'; end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('qa.admin'),'role','authenticated',
  'app_metadata',jsonb_build_object('cultural_editor',true))::text,true);
do $$
declare ficha jsonb;
begin
  select to_jsonb(e) into ficha from public.programacion_cultural e where id='f0000000-0000-4000-8000-000000000001';
  if public.guardar_programacion_teatro(ficha,4,'[]','[]',array['f1000000-0000-4000-8000-000000000001'::uuid])<>5
  then raise exception 'Restauración fallida'; end if;
  if (select count(*) from public.programacion_cultural_funciones where espectaculo_id=(ficha->>'id')::uuid and retirada_en is null)<>2
    or (select count(*) from public.programacion_cultural_historial where espectaculo_id=(ficha->>'id')::uuid)<>5
  then raise exception 'El historial o el identificador original se han perdido'; end if;
end $$;

rollback;
