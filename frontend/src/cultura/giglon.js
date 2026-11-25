import { enlaceCompra } from './datos';

export const carteleraGiglon = 'https://www.giglon.com/sala/teatro-municipal-enrique-de-la-cuadra';

export const ejemploGiglon = {
  enlace: 'https://www.giglon.com/evento/dulcineautrera',
  titulo: 'Dulcinea',
  funciones: 'Fecha 05/12/2026 20:30 · desde 12,00 €',
};

export function identificarGiglon(valor) {
  const validado = enlaceCompra(valor.trim());
  if (!validado) return '';
  const enlace = new URL(validado);
  return (enlace.searchParams.get('idEvent') || enlace.pathname.split('/')[2]).toLowerCase();
}

export function prepararGiglon({ enlace, titulo, funciones }) {
  const id = identificarGiglon(enlace);
  if (!id) throw new Error('Introduce un enlace directo a un espectáculo de Giglon.');
  if (!titulo.trim() || titulo.trim().length > 200) throw new Error('Introduce el título que figura en Giglon.');
  const compra = enlaceCompra(enlace.trim());
  const pases = funciones.trim().split(/\r?\n/).filter(linea => linea.trim()).map((linea, i) => {
    const turno = linea.trim().match(/^(?:fecha\s*:?\s*)?(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?:\s*h)?(?:\s*·\s*(.+))?$/i);
    if (!turno) throw new Error(`Revisa la fecha y hora de la línea ${i + 1}.`);
    const [, dia, mes, anio, horas, minutos, importe = ''] = turno;
    const fecha = [anio, mes.padStart(2, '0'), dia.padStart(2, '0')].join('-');
    const comprobacion = new Date(fecha + 'T12:00:00Z');
    if (Number.isNaN(+comprobacion) || comprobacion.toISOString().slice(0, 10) !== fecha || +horas > 23 || +minutos > 59) {
      throw new Error(`La fecha u hora de la línea ${i + 1} no es válida.`);
    }
    const hora = horas.padStart(2, '0') + ':' + minutos;
    const precioExacto = importe.match(/^(\d{1,6}(?:[.,]\d{1,2})?)\s*€$/);
    const precio = /^(?:gratis|gratuita)$/i.test(importe) ? '0' : precioExacto ? String(Number(precioExacto[1].replace(',', '.'))) : '';
    return { fecha, hora, compra, precio, precioPendiente: precio === '' ? importe : '' };
  });
  const fechas = new Set(pases.map(p => p.fecha + p.hora));
  if (!pases.length || pases.length > 30 || fechas.size !== pases.length) throw new Error('Introduce entre 1 y 30 funciones distintas.');
  return { titulo: titulo.trim(), pases, compra };
}

const normalizar = valor => valor.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim();

export function coincidenciasGiglon(propuesta, filas) {
  const id = identificarGiglon(propuesta.compra);
  return filas.flatMap(fila => {
    const mismaCompra = fila.funciones.some(f => identificarGiglon(f.compra || '') === id);
    if (!mismaCompra && (!normalizar(propuesta.titulo) || normalizar(fila.titulo) !== normalizar(propuesta.titulo))) return [];
    const diferencias = [];
    if (normalizar(fila.titulo) !== normalizar(propuesta.titulo)) diferencias.push('título');
    const activos = fila.funciones.filter(f => !f.retirada);
    const mismoPase = (a, b) => a.fecha === b.fecha && a.hora === b.hora;
    if (activos.length !== propuesta.pases.length || propuesta.pases.some(p => !activos.some(f => mismoPase(f, p)))) diferencias.push('fechas u horarios');
    if (propuesta.pases.some(p => p.precio !== '' && activos.some(f => mismoPase(p, f) && p.precio !== f.precio))) diferencias.push('precio');
    if (!mismaCompra) diferencias.push('enlace');
    return [{ fila, diferencias }];
  });
}
