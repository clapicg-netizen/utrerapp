import { supabase } from '../../lib/supabaseClient';

export const categoriasBase = ['Hostelería', 'Comercio', 'Servicios', 'Salud', 'Salud y Belleza', 'Inmobiliarias', 'Formación', 'Comida a domicilio'];

export const tiposFicha = [
  ['normal', 'Estándar'],
  ['especial1', 'Inmobiliaria'],
  ['especial2', 'Comida a domicilio'],
];

export const fichaInicial = {
  nombre: '', categoria: 'Hostelería', subcategoria: '', tipo_ficha: 'normal',
  direccion: '', telefono: '', whatsapp: '', horario_texto: '', descripcion: '',
  web_url: '', tienda_url: '', instagram_url: '', facebook_url: '', tiktok_url: '',
  oferta_flash: '', portada_url: '', logo_url: '', carta_pdf_url: '',
  galeria_urls: [], video_story_url: '', destacado: true, pin_acceso: '1234',
  datos_especiales_json: '',
};

export const medios = [
  ['logo_url', 'Logotipo', 'image/*'],
  ['portada_url', 'Portada principal', 'image/*'],
  ['video_story_url', 'Vídeo promocional', 'video/mp4,video/webm'],
  ['carta_pdf_url', 'Carta, menú o folleto', 'application/pdf,image/*'],
];

const camposUrl = [...medios.map(([campo]) => campo), 'web_url', 'tienda_url', 'instagram_url', 'facebook_url', 'tiktok_url'];

export function cargarFicha(ficha) {
  if (!ficha) return fichaInicial;
  return {
    ...Object.fromEntries(Object.entries(fichaInicial).map(([campo, defecto]) => [campo, ficha[campo] ?? defecto])),
    instagram_url: ficha.instagram_url || ficha.instagram_username || '',
    tiktok_url: ficha.tiktok_url || ficha.tiktok_username || '',
    galeria_urls: Array.isArray(ficha.galeria_urls) ? ficha.galeria_urls.filter(url => typeof url === 'string') : [],
    datos_especiales_json: ficha.datos_especiales == null ? '' : JSON.stringify(ficha.datos_especiales, null, 2),
  };
}

export function prepararFicha(formulario) {
  const { datos_especiales_json, ...ficha } = formulario;
  return {
    ...ficha,
    ...Object.fromEntries(camposUrl.map(campo => [campo, ficha[campo].trim() || null])),
    nombre: ficha.nombre.trim(),
    galeria_urls: ficha.galeria_urls.map(url => url.trim()).filter(Boolean),
    datos_especiales: datos_especiales_json.trim() ? JSON.parse(datos_especiales_json) : null,
  };
}

export const destinos = [
  ['market', 'Guía Comercial'], ['conso', 'Conso IA'], ['juego-mostachon', 'Juego del Mostachón'],
  ['transporte', 'Transporte'], ['salud', 'Salud'], ['farmacias', 'Farmacias'],
];

export const fondos = [
  ['from-rose-600 to-pink-700', 'Rosa'], ['from-amber-600 to-yellow-600', 'Dorado'],
  ['from-amber-600 to-orange-700', 'Naranja'], ['from-slate-800 to-slate-900', 'Oscuro'],
  ['from-sky-600 to-blue-700', 'Azul'],
];

export const etiquetas = [
  ['bg-rose-500 text-white', 'Roja'], ['bg-amber-500 text-white', 'Ámbar con texto blanco'],
  ['bg-amber-500 text-slate-900', 'Ámbar con texto oscuro'], ['bg-sky-500 text-white', 'Celeste'],
];

const anuncioInicial = {
  titulo: '', subtitulo: '', tipo: 'OFERTA DEL DÍA', color_badge: 'bg-amber-500 text-white',
  bg_gradient: 'from-amber-600 to-orange-700', icono: '⚡', accion_tab: 'market', orden: 1, activo: true,
};

export function cargarAnuncio(anuncio) {
  return Object.fromEntries(Object.entries(anuncioInicial).map(([campo, defecto]) => [
    campo, anuncio?.[campo] ?? defecto,
  ]));
}

export async function leerFilas(tabla, signal) {
  const filas = [];
  const limite = 500;
  for (let desde = 0; ; desde += limite) {
    const { data, error } = await supabase.from(tabla).select('*').order('id').range(desde, desde + limite - 1).abortSignal(signal);
    if (error) throw error;
    filas.push(...data);
    if (data.length < limite) return filas;
  }
}
