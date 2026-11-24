import { localDay } from './settings.mjs';
import { isoDay, shiftDay } from './weather-dates.mjs';

const origin = 'https://opendata.aemet.es';
const cache = new Map();
const ttl = 45 * 60_000;
const retryDelay = 2 * 60_000;

function localWallTime(now, timeZone) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone, dateStyle: 'short', timeStyle: 'medium', hourCycle: 'h23',
  }).format(now).replace(' ', 'T');
}

function issuedAt(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(value)
    ? Date.parse(value + 'Z') : NaN;
}

function matchesMunicipality(id, code) {
  if (typeof id !== 'number' && (typeof id !== 'string' || !/^-?\d+$/.test(id))) return false;
  const reported = Number(id);
  const expected = Number(code);
  // AEMET puede serializar los códigos INE como enteros de 16 bits con signo.
  return reported === expected || (expected >= 32_768 && expected <= 65_535 && reported === expected - 65_536);
}

async function forecast(place, apiKey, now, zone) {
  const request = async (url, headers) => {
    const response = await fetch(url, { headers, redirect: 'error', signal: AbortSignal.timeout(4500) });
    if (!response.ok) throw new Error('AEMET unavailable');
    return response.json();
  };
  const existing = cache.get(place.code);
  if (existing && existing.until > now.getTime()) return existing.result;

  const entry = { until: now.getTime() + ttl };
  entry.result = (async () => {
    const endpoint = origin + '/opendata/api/prediccion/especifica/municipio/diaria/' + place.code;
    const metadata = await request(endpoint, { api_key: apiKey, Accept: 'application/json' });
    if (metadata.estado !== 200 || typeof metadata.datos !== 'string') throw new Error('Invalid AEMET metadata');
    const dataUrl = new URL(metadata.datos);
    if (dataUrl.origin !== origin || !dataUrl.pathname.startsWith('/opendata/sh/') ||
        dataUrl.username || dataUrl.password) throw new Error('Invalid AEMET download URL');
    const rows = await request(dataUrl, { Accept: 'application/json' });
    const data = rows?.[0];
    const age = issuedAt(localWallTime(now, zone)) - issuedAt(data?.elaborado);
    if (!matchesMunicipality(data?.id, place.code) || !Array.isArray(data?.prediccion?.dia) ||
        !Number.isFinite(age) || age < -15 * 60_000 || age > 24 * 60 * 60_000) {
      throw new Error('AEMET forecast missing or stale');
    }
    entry.until = Math.min(entry.until, now.getTime() + 24 * 60 * 60_000 - age);
    return data;
  })().catch(error => {
    entry.until = now.getTime() + retryDelay;
    throw error;
  });
  cache.set(place.code, entry);
  return entry.result;
}

const number = value => {
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^-?\d+(?:\.\d+)?$/.test(value.trim()))) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};
const forecastRanges = {
  '': [0, 24], '00-24': [0, 24], '00-12': [0, 12], '12-24': [12, 24],
  '00-06': [0, 6], '06-12': [6, 12], '12-18': [12, 18], '18-24': [18, 24],
};

function observations(items, field, desired) {
  const values = (Array.isArray(items) ? items : []).flatMap(item => {
    const value = number(item?.[field]);
    const range = forecastRanges[item?.periodo || ''];
    if (!range || value == null || value < 0 || (field === 'value' && desired.quantity === 'rain' && value > 100)) return [];
    return [{ value, range, direction: item.direccion }];
  });
  const limited = values.filter(({ range: [start, end] }) => start >= desired.start && end <= desired.end);
  return (desired.exact ? limited : values).sort((a, b) => b.value - a.value || (a.range[1] - a.range[0]) - (b.range[1] - b.range[0]));
}

const hourRange = ([start, end]) => String(start).padStart(2, '0') + ' a ' + String(end).padStart(2, '0') + ' h';
const entireDay = range => range[0] === 0 && range[1] === 24;

function formatDay(row, label, request) {
  const parts = [];
  const min = number(row.temperatura?.minima);
  const max = number(row.temperatura?.maxima);
  if (min != null && max != null && min <= max) parts.push('mín. ' + min + ' °C, máx. ' + max + ' °C' + (request.part ? ' en el día' : ''));

  const [start, end] = ({ manana: [0, 12], tarde: [12, 24], noche: [18, 24], mediodia: [12, 18] })[request.part] || [0, 24];
  const desired = { start, end, exact: Boolean(request.part) };
  const sky = row.estadoCielo?.find?.(entry => {
    const range = forecastRanges[entry.periodo || ''];
    return typeof entry.descripcion === 'string' && entry.descripcion.trim() &&
      range && range[0] === start && range[1] === end;
  });
  if (sky) parts.push(sky.descripcion);

  const rain = observations(row.probPrecipitacion, 'value', { ...desired, quantity: 'rain' });
  const overall = rain.find(item => entireDay(item.range));
  const strongest = rain.find(item => !entireDay(item.range));
  if (overall) parts.push(overall.value + ' % de precipitación en el día');
  if (strongest) parts.push(strongest.value + ' % de precipitación de ' + hourRange(strongest.range) +
    ' (tramo con mayor probabilidad disponible)');
  if (!rain.length && request.focus === 'rain') parts.push('sin probabilidad de precipitación publicada para el tramo');

  const [wind] = observations(row.viento, 'velocidad', desired);
  const [gust] = observations(row.rachaMax, 'value', desired);
  if (wind) {
    const direction = /^(?:N|NE|E|SE|S|SO|O|NO)$/.test(wind.direction) ? ' ' + wind.direction : '';
    parts.push('viento previsto hasta ' + wind.value + ' km/h' + direction);
  }
  if (gust) parts.push('rachas previstas hasta ' + gust.value + ' km/h');
  if (!wind && !gust && request.focus === 'wind') parts.push('sin previsión de viento publicada para el tramo');
  if (request.part && !sky && !rain.length && !wind && !gust) {
    parts.push('AEMET no ofrece desglose para el tramo solicitado');
  }
  return { text: label + ' — ' + (parts.length ? parts.join('; ') + '.' : 'sin datos suficientes.'),
    rain: rain[0]?.value, fullDayRain: overall?.value, hasData: Boolean(min != null || max != null || sky || rain.length || wind || gust) };
}

export async function weatherAnswer({ place, apiKey, request, zone, now = new Date() }) {
  const links = [{ label: 'Previsión de ' + place.name + ' en AEMET', url: place.url }];
  const unavailable = { answer: 'Ahora mismo no tengo una previsión de AEMET verificada para ' + place.name + '.', links };
  const today = localDay(zone, now);
  const lastDay = isoDay(shiftDay(today, 6));
  const dateFormat = new Intl.DateTimeFormat('es-ES', { timeZone: zone, weekday: 'long', day: 'numeric', month: 'long' });
  const label = date => dateFormat.format(shiftDay(date));
  if (!request.dates.length) return { answer: 'No he podido interpretar esa fecha. Indícame el día y el mes, por ejemplo «28 de noviembre».', available: false };
  if (request.dates.every(date => date < today)) return { answer: 'La fecha solicitada ya ha pasado. Puedo consultar la previsión de hoy y los próximos días.', available: false };
  if (request.dates.every(date => date > lastDay)) return {
    answer: 'La fecha solicitada (' + label(request.dates[0]) + ') supera el horizonte de siete días de la previsión municipal de AEMET. El último día que puedo consultar es ' + label(lastDay) + '.',
    links, available: false,
  };
  if (!apiKey) return { ...unavailable, available: false };
  try {
    const data = await forecast(place, apiKey, now, zone);
    const days = request.dates.map(date => {
      const row = data.prediccion.dia.find(item => item.fecha?.slice?.(0, 10) === date);
      if (date > lastDay) return { text: label(date) + ' — fuera del horizonte de siete días de AEMET.' };
      return row ? formatDay(row, label(date), request)
        : { text: label(date) + ' — AEMET todavía no publica previsión para esta fecha.' };
    });
    const issued = data.elaborado.slice(0, 16).replace('T', ' a las ');
    let umbrella = '';
    if (request.umbrella && days[0]?.rain >= 40) umbrella = 'Llevaría paraguas.\n\n';
    else if (request.umbrella && days[0]?.fullDayRain != null) umbrella = 'Según la previsión, el paraguas no parece imprescindible.\n\n';
    return { answer: umbrella + days.map(item => item.text).join('\n') + '\n\nFuente: AEMET, previsión emitida el ' + issued + ' (hora local).', links, available: days.some(item => item.hasData) };
  } catch {
    return { ...unavailable, available: false };
  }
}
