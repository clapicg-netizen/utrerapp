import { enlaceCompra } from './datos';
import { identificarGiglon } from './giglon';

const fuente = process.env.REACT_APP_TEATRO_FUENTE_AUTORIZADA;
export const fuenteDisponible = Boolean(fuente && /^https:\/\//i.test(fuente));

async function obtener(url, tipo, limite) {
  const respuesta = await fetch(url, { credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(10000) });
  if (!respuesta.ok || !tipo(respuesta.headers.get('content-type')?.split(';')[0])) throw new Error('La fuente autorizada devolvió un formato inesperado.');
  const lector = respuesta.body.getReader();
  const partes = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await lector.read();
      if (done) break;
      total += value.byteLength;
      if (total > limite) throw new Error('El contenido supera el límite admitido.');
      partes.push(value);
    }
  } finally {
    await lector.cancel();
  }
  return new Blob(partes, { type: respuesta.headers.get('content-type').split(';')[0] });
}

const cadena = (valor, maximo) => typeof valor === 'string' ? valor.trim().slice(0, maximo) : '';

export async function leerFichaAutorizada(enlace) {
  if (!fuenteDisponible) throw new Error('Falta configurar la fuente autorizada.');
  const compra = enlaceCompra(enlace.trim());
  if (!compra) throw new Error('Introduce un enlace individual de Giglon.');
  const url = new URL(fuente);
  url.searchParams.set('evento', identificarGiglon(compra));
  const ficha = JSON.parse(await (await obtener(url, tipo => tipo === 'application/json', 100000)).text());
  if (ficha.id !== identificarGiglon(compra)) throw new Error('La fuente devolvió otro espectáculo.');
  const titulo = cadena(ficha.titulo, 200);
  const lugar = cadena(ficha.lugar, 300);
  if (!titulo || !lugar || !Array.isArray(ficha.pases) || !ficha.pases.length || ficha.pases.length > 30) throw new Error('La fuente no ha devuelto los datos esenciales de la ficha.');
  const pases = ficha.pases.map(p => {
    const fecha = cadena(p.fecha, 10);
    const hora = cadena(p.hora, 5);
    const dia = new Date(fecha + 'T12:00:00Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(+dia) || dia.toISOString().slice(0,10) !== fecha
      || (hora && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(hora))) throw new Error('La fuente devolvió una fecha u hora inválida.');
    const importe = cadena(p.precio, 20);
    const tipoPrecio = ['pago','desde'].includes(p.tipoPrecio) && /^\d{1,6}(?:\.\d{1,2})?$/.test(importe) && Number(importe) > 0
      ? p.tipoPrecio : p.tipoPrecio === 'gratis' ? 'gratis' : 'desconocido';
    return { fecha, hora, compra: enlaceCompra(cadena(p.compra, 400)) || compra, tipoPrecio,
      precio: tipoPrecio === 'gratis' ? '0' : tipoPrecio === 'desconocido' ? '' : importe };
  });
  const propuesta = { titulo,lugar,direccion:cadena(ficha.direccion,500),compra,pases,avisos:[],
    descripcion:cadena(ficha.descripcion,16000) };
  if (ficha.cartel) {
    const cartel = new URL(ficha.cartel, url);
    if (cartel.origin !== url.origin) throw new Error('El cartel no pertenece a la fuente autorizada.');
    const imagen = await obtener(cartel, tipo => ['image/png','image/jpeg','image/webp'].includes(tipo), 750000);
    propuesta.archivo = new File([imagen], 'cartel', { type: imagen.type });
    propuesta.cartel = await new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(lector.result);
      lector.onerror = reject;
      lector.readAsDataURL(imagen);
    });
  }
  return propuesta;
}
