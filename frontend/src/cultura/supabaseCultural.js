import { createClient } from '@supabase/supabase-js';
import { demoCultural, leerCultura } from './datos';
import { supabase } from '../lib/supabaseClient';

const url = process.env.REACT_APP_CULTURA_SUPABASE_URL;
const key = process.env.REACT_APP_CULTURA_SUPABASE_ANON_KEY;
export const culturaPruebas = Boolean(demoCultural && url === 'https://bkpusgqsatyymqbisjcv.supabase.co' && key);
const culturaProduccion = process.env.REACT_APP_TEATRO_PUBLICADO === 'true'
  && /^(?:www\.)?utrerapp\.com$/.test(window.location.hostname)
  && url === 'https://gzvybwvrkplbipkzkjwg.supabase.co' && key;
const configurado = culturaPruebas || culturaProduccion;
const bucket = 'carteles-cultura';
export const culturaDB = culturaProduccion ? supabase : culturaPruebas ? createClient(url, key, {
  auth: { storageKey: 'utrerapp-cultura-pruebas-auth', detectSessionInUrl: false },
}) : null;
const lecturaPublica = configurado ? createClient(url, key, {
  auth: { storageKey: 'utrerapp-cultura-lectura', persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
}) : null;
const selects = 'id,titulo,categoria,descripcion,lugar,direccion,cartel_ruta,estado,revision,programacion_cultural_funciones(id,fecha,hora,fin_fecha,fin_hora,precio_centimos,compra_url,estado_venta,retirada_en,motivo_retirada)';
async function leer(cliente, gestion) {
  if (!cliente) return leerCultura();
  let query = cliente.from('programacion_cultural').select(selects).eq('seccion','teatro');
  if (!gestion) query = query.eq('estado','publicado');
  const { data, error } = await query;
  if (error) throw error;
  return Promise.all(data.map(async ({ programacion_cultural_funciones, ...fila }) => {
    const imagen = fila.cartel_ruta && (await cliente.storage.from(bucket).createSignedUrl(fila.cartel_ruta,300)).data?.signedUrl;
    return { ...fila, cartel: imagen || '', funciones: programacion_cultural_funciones.filter(f=>gestion || !f.retirada_en).map(f => ({
      id:f.id, fecha:f.fecha || '', hora:f.hora?.slice(0,5) || '', fin:f.fin_hora?.slice(0,5) || '', finFecha:f.fin_fecha || '',
      precio:f.precio_centimos === null ? '' : String(f.precio_centimos/100), compra:f.compra_url || '', venta:f.estado_venta,
      retirada:f.retirada_en, motivo:f.motivo_retirada,
    })) };
  }));
}
export const leerPublicacion = () => leer(lecturaPublica,false);
export const leerGestion = () => leer(culturaDB,true);

export async function guardarRemoto(evento, { retirar = [], restaurar = [], editarFunciones = true } = {}) {
  let ruta = evento.cartel_ruta || null;
  if (evento.archivo) {
    ruta = `teatro/${evento.id}/${crypto.randomUUID()}`;
    const { error } = await culturaDB.storage.from(bucket).upload(ruta,evento.archivo,{ contentType:evento.archivo.type });
    if (error) throw error;
  }
  const ficha = { id:evento.id, titulo:evento.titulo, categoria:evento.categoria, descripcion:evento.descripcion,
    lugar:evento.lugar, direccion:evento.direccion, cartel_ruta:ruta, estado:evento.estado };
  const funciones = editarFunciones ? evento.funciones.filter(f => !f.retirada).map(f => ({
    id:f.id, fecha:f.fecha || null, hora:f.hora || null, fin_fecha:f.fin ? f.finFecha || f.fecha : null, fin_hora:f.fin || null,
    precio_centimos:f.precio === '' ? null : Math.round(Number(f.precio)*100), compra_url:f.compra || null, estado_venta:f.venta,
  })) : [];
  const { error } = await culturaDB.rpc('guardar_programacion_teatro',{
    ficha, revision_esperada:evento.revision || 0, funciones, retirar, restaurar,
  });
  if (error) throw error;
}
