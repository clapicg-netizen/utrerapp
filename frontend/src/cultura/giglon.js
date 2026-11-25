import { enlaceCompra } from './datos';

export const carteleraGiglon = 'https://www.giglon.com/sala/teatro-municipal-enrique-de-la-cuadra';

export const ejemploGiglon = `Dulcinea
Recinto Teatro Municipal Enrique de la Cuadra
Dirección Calle Sevilla - Utrera (Sevilla)
Fecha 05/12/2026 20:30
desde 12,00 €
https://www.giglon.com/evento/dulcineautrera`;

export function identificarGiglon(valor) {
  const validado = enlaceCompra(valor.trim());
  if (!validado) return '';
  const enlace = new URL(validado);
  return (enlace.searchParams.get('idEvent') || enlace.pathname.split('/')[2]).toLowerCase();
}

function leerPrecio(texto) {
  if (/^(?:entrada\s+)?(?:gratis|gratuita|gratuito|libre)$/i.test(texto)) return { tipoPrecio: 'gratis', precio: '0' };
  const precio = texto.match(/^(desde\s+)?(\d{1,6}(?:[.,]\d{1,2})?)\s*€$/i);
  if (!precio) return null;
  const cantidad = String(Number(precio[2].replace(',', '.')));
  return precio[1] ? { tipoPrecio: 'desde', precio: cantidad }
    : { tipoPrecio: cantidad === '0' ? 'gratis' : 'pago', precio: cantidad };
}

const desconocido = { tipoPrecio: 'desconocido', precio: '' };

// Una fuente futura debe devolver la misma propuesta sin guardarla.
export function prepararGiglon(texto) {
  const propuesta = { titulo: '', lugar: '', direccion: '', compra: '', pases: [] };
  let precioGeneral = desconocido;
  let pase = null;
  const avisos = [];
  for (const original of texto.split(/\r?\n/)) {
    const linea = original.trim();
    if (!linea) continue;
    const dato = linea.match(/^(título|titulo|recinto|lugar|dirección|direccion|precio|enlace(?: de compra)?)\s*(?::\s*|\s+)(.+)$/i);
    const campo = dato?.[1].normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    const valor = (dato?.[2] || linea).trim();
    if (campo === 'titulo') { propuesta.titulo = valor; continue; }
    if (campo === 'recinto' || campo === 'lugar') { propuesta.lugar = valor; continue; }
    if (campo === 'direccion') { propuesta.direccion = valor.replace(/\s*\(ver mapa\)\s*$/i, ''); continue; }
    const compra = enlaceCompra(valor);
    if (compra) {
      if (!propuesta.compra) propuesta.compra = compra;
      if (pase && !pase.compra) pase.compra = compra;
      continue;
    }
    const turno = linea.match(/^(?:(?:fecha|función|funcion)\s*:?\s*)?(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:(?:\s+(?:a las\s+)?|,\s*)(\d{1,2}):(\d{2})(?:\s*h)?)?(?:\s*[·;]\s*(.+))?$/i);
    if (turno) {
      const [, dia, mes, anio, horas, minutos, importe = ''] = turno;
      const fecha = [anio, mes.padStart(2, '0'), dia.padStart(2, '0')].join('-');
      const comprobacion = new Date(fecha + 'T12:00:00Z');
      if (Number.isNaN(+comprobacion) || comprobacion.toISOString().slice(0, 10) !== fecha || +horas > 23 || +minutos > 59) {
        avisos.push('Hay una fecha u hora inválida que debes revisar.');
        pase = null;
        continue;
      }
      pase = { fecha, hora: horas ? horas.padStart(2, '0') + ':' + minutos : '', compra: '', tarifa: leerPrecio(importe) };
      if (propuesta.pases.some(p => p.fecha === pase.fecha && p.hora === pase.hora)) avisos.push('Hay funciones repetidas. Revisa las fechas y horas.');
      propuesta.pases.push(pase);
      continue;
    }
    if (pase) {
      const hora = linea.match(/^hora(?:rio)?\s*:?\s*(\d{1,2}):(\d{2})\s*h?$/i);
      if (hora && +hora[1] <= 23 && +hora[2] <= 59) { pase.hora = hora[1].padStart(2, '0') + ':' + hora[2]; continue; }
    }
    const precio = leerPrecio(valor);
    if (precio) {
      if (pase) pase.tarifa = precio;
      else precioGeneral = precio;
      continue;
    }
    if (!propuesta.titulo && !campo && !/^(?:https?:|fecha\b|hora\b|entradas disponibles|evento finalizado|comprar|¡comparte!)/i.test(linea)) {
      propuesta.titulo = linea.replace(/^#+\s*/, '').slice(0, 200);
    }
  }
  const compraComun = new Set([propuesta.compra, ...propuesta.pases.map(p => p.compra)].filter(Boolean)).size === 1;
  propuesta.pases = propuesta.pases.map(({ tarifa, ...p }) => ({ ...p, compra: p.compra || (compraComun ? propuesta.compra : ''), ...(tarifa || precioGeneral) }));
  if (!propuesta.titulo && !propuesta.pases.length && !propuesta.lugar && !propuesta.direccion && !propuesta.compra) throw new Error('No se han reconocido datos. Pega el título y las líneas de recinto, dirección y funciones.');
  return { ...propuesta, avisos };
}

const normalizar = valor => valor.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim();

export function coincidenciasGiglon(propuesta, filas) {
  const id = identificarGiglon(propuesta.compra);
  return filas.flatMap(fila => {
    const enlaces = new Set([id, ...propuesta.pases.map(p => identificarGiglon(p.compra || ''))].filter(Boolean));
    const mismaCompra = fila.funciones.some(f => enlaces.has(identificarGiglon(f.compra || '')));
    if (!mismaCompra && (!normalizar(propuesta.titulo) || normalizar(fila.titulo) !== normalizar(propuesta.titulo))) return [];
    const diferencias = [];
    if (normalizar(fila.titulo) !== normalizar(propuesta.titulo)) diferencias.push('título');
    const activos = fila.funciones.filter(f => !f.retirada);
    const mismoPase = (a, b) => a.fecha === b.fecha && a.hora === b.hora;
    if (activos.length !== propuesta.pases.length || propuesta.pases.some(p => !activos.some(f => mismoPase(f, p)))) diferencias.push('fechas u horarios');
    if (propuesta.pases.some(p => p.precio !== '' && p.tipoPrecio !== 'desde' && activos.some(f => mismoPase(p, f) && p.precio !== f.precio))) diferencias.push('precio');
    if (propuesta.lugar && normalizar(fila.lugar || '') !== normalizar(propuesta.lugar)) diferencias.push('recinto');
    if (propuesta.direccion && normalizar(fila.direccion || '') !== normalizar(propuesta.direccion)) diferencias.push('dirección');
    if (enlaces.size && !mismaCompra) diferencias.push('enlace');
    return [{ fila, diferencias }];
  });
}
