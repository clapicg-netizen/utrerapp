import { createClient } from '@supabase/supabase-js';
import { demoCultural, leerCultura } from './datos';

const url = process.env.REACT_APP_CULTURA_SUPABASE_URL;
const key = process.env.REACT_APP_CULTURA_SUPABASE_ANON_KEY;
export const culturaDB = demoCultural && url === 'https://bkpusgqsatyymqbisjcv.supabase.co' && key
  ? createClient(url, key, { auth: { storageKey: 'utrerapp-cultura-pruebas-auth', detectSessionInUrl: false } }) : null;
const bucket = 'carteles-cultura';
const selects = 'id,titulo,categoria,descripcion,lugar,direccion,cartel_ruta,estado,programacion_cultural_funciones(id,fecha,hora,fin,precio_centimos,compra_url,estado_venta)';
async function leer(gestion = false) {
  if (!culturaDB) return leerCultura();
  let query = culturaDB.from('programacion_cultural').select(selects).eq('seccion','teatro');
  if (!gestion) query = query.eq('estado','publicado');
  const { data, error } = await query;
  if (error) throw error;
  return Promise.all(data.map(async ({ programacion_cultural_funciones, ...fila }) => {
    const imagen = fila.cartel_ruta && (await culturaDB.storage.from(bucket).createSignedUrl(fila.cartel_ruta, 300)).data?.signedUrl;
    return { ...fila, cartel: imagen || '', funciones: programacion_cultural_funciones.map(f => ({
      id:f.id, fecha:f.fecha || '', hora:f.hora?.slice(0,5) || '', fin:f.fin?.slice(0,5) || '',
      precio:f.precio_centimos === null ? '' : String(f.precio_centimos / 100), compra:f.compra_url || '', venta:f.estado_venta,
    })) };
  }));
}
export const leerPublicacion = () => leer();
export const leerGestion = () => leer(true);

export async function guardarRemoto(evento) {
  let ruta = evento.cartel_ruta || null;
  let nuevaRuta;
  if (evento.archivo) {
    nuevaRuta = `teatro/${evento.id}/${crypto.randomUUID()}`;
    const { error } = await culturaDB.storage.from(bucket).upload(nuevaRuta,evento.archivo,{ contentType:evento.archivo.type });
    if (error) throw error;
    ruta = nuevaRuta;
  }
  const fila = { id:evento.id, titulo:evento.titulo, categoria:evento.categoria, descripcion:evento.descripcion,
    lugar:evento.lugar, direccion:evento.direccion, cartel_ruta:ruta, estado:evento.estado };
  const funciones = evento.funciones.map(f=>({ id:f.id, fecha:f.fecha || null, hora:f.hora || null, fin:f.fin || null,
    precio_centimos:f.precio === '' ? null : Math.round(Number(f.precio)*100), compra_url:f.compra || null, estado_venta:f.venta }));
  const { error } = await culturaDB.rpc('guardar_programacion_teatro',{ ficha:fila, funciones });
  if (error) {
    if (nuevaRuta) await culturaDB.storage.from(bucket).remove([nuevaRuta]);
    throw error;
  }
  if (nuevaRuta && evento.cartel_ruta) await culturaDB.storage.from(bucket).remove([evento.cartel_ruta]);
}
export async function borrarRemoto(evento) {
  const { error } = await culturaDB.from('programacion_cultural').delete().eq('id',evento.id).eq('seccion','teatro').select('id').single();
  if (error) throw error;
  if (evento.cartel_ruta) await culturaDB.storage.from(bucket).remove([evento.cartel_ruta]);
}
