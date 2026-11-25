import { normalizePreviewQuestion } from './preview.mjs';
import { isoDay, resolveWeatherDate, shiftDay } from './weather-dates.mjs';

const guard = /^(?:(?:que|cual es la|cuales son las|donde (?:hay|encuentro|puedo encontrar|consulto|puedo consultar)|busco|necesito) (?:una |las |la )?)?farmacias?(?: hay| estan| esta)?(?: de guardia| abiertas?)$/;
const time = /\b(?:ahora(?: mismo)?|en este momento)\b/;
const shift = /\b(?:(?:por la|esta|de) (noche|tarde)|(?:por la|esta|de) (manana))\b/;

export function pharmacyIntent(question, today, followUp = false) {
  const clean = normalizePreviewQuestion(question).replace(/\ben utrera\b/, ' ');
  const part = clean.match(shift);
  const withoutPart = clean.replace(shift, ' ');
  const timing = resolveWeatherDate(withoutPart, today);
  const subject = withoutPart.replace(timing?.phrase || /$^/, ' ').replace(time, ' ')
    .replace(/^\s*y(?:\s+|$)/, '').replace(/\bpara\s*$/, '').replace(/^\s*para\b/, '')
    .replace(/\s+/g, ' ').trim();
  if (!guard.test(subject) && !(followUp && !subject && (timing || part || time.test(clean)))) return;
  return { dates: timing?.dates || [today], now: time.test(clean) || /abiertas?\b/.test(subject), part: part?.[1] || part?.[2] };
}

function openingMinutes(horario) {
  const match = typeof horario === 'string' && horario.trim().match(/^(\d{1,2}):(\d\d)\s*(?:a|[-–])\s*(\d{1,2}):(\d\d)\s*h?$/i);
  if (!match) return;
  const [sh, sm, eh, em] = match.slice(1).map(Number);
  if (sh > 23 || eh > 23 || sm > 59 || em > 59) return;
  const start = sh * 60 + sm, end = eh * 60 + em;
  if (start !== end) return { start, end };
}

export async function pharmacyAnswer({ request, today, timeZone, now, app, readPublic }) {
  const { dates, part } = request;
  if (!dates.length) return { answer: 'No he podido interpretar la fecha. Indícame el día y el mes.' };
  if (dates.some(date => date < today) || (request.now && (dates.length !== 1 || dates[0] !== today))) {
    return { answer: 'No puedo confirmar un turno vigente para esa combinación de fecha y hora.' };
  }
  const format = new Intl.DateTimeFormat('es-ES', { timeZone, dateStyle: 'full' });
  const label = date => format.format(shiftDay(date));
  const unknown = request.now
    ? 'No puedo confirmar qué farmacia está de guardia ahora en Utrera con el calendario de UtrerApp.'
    : 'No tengo una farmacia de guardia verificada en Utrera para el ' + dates.map(label).join(' y el ') + '.';
  const unavailable = { answer: unknown, pharmacy: { days: dates.map(date => ({ date, label: label(date), shifts: [] })) } };
  try {
    const previous = isoDay(shiftDay(today, -1));
    const queryDates = request.now ? [previous, today] : dates;
    const rows = await readPublic(app.db, 'farmacias_calendario', {
      select: 'fecha,nombre_farmacia,direccion,horario,turno,telefono',
      fecha: queryDates.length > 1 ? 'in.(' + queryDates.join(',') + ')' : 'eq.' + queryDates[0],
      limit: '100',
    });
    const minutes = new Intl.DateTimeFormat('en-GB', {
      timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).format(now).split(':').reduce((hours, mins) => Number(hours) * 60 + Number(mins));
    const shifts = rows.flatMap(row => {
      if (!queryDates.includes(row.fecha) || typeof row.nombre_farmacia !== 'string' || !row.nombre_farmacia.trim()) return [];
      const window = openingMinutes(row.horario);
      if (!window) return [];
      const { start, end } = window;
      const overnight = end < start;
      const carryover = row.fecha === previous && overnight && minutes < end;
      const active = carryover || (row.fecha === today && minutes >= start && (overnight || minutes < end));
      if (request.now) {
        if (!active) return [];
      } else if (part) {
        const [from, to] = { manana: [0, 12 * 60], tarde: [12 * 60, 20 * 60], noche: [22 * 60, 24 * 60] }[part];
        if (!(start < to && (overnight ? 24 * 60 : end) > from)) return [];
      }
      const address = row.direccion?.trim();
      const municipality = /\bpalmar de troya\b/i.test(address) ? 'El Palmar de Troya' : 'Utrera';
      const destination = address && (/\b(?:utrera|palmar de troya)\b/i.test(address)
        ? `${address}, Sevilla, España`
        : `${address}, ${municipality}, Sevilla, España`);
      return [{
        startDate: row.fecha, name: row.nombre_farmacia, address, municipality, destination,
        hours: row.horario, phone: row.telefono, shift: overnight ? 'night' : 'day', carryover,
        status: active ? 'active' : row.fecha === today && minutes >= end && !overnight ? 'ended' : 'scheduled',
      }];
    });
    if (!shifts.length) return unavailable;
    const describe = row => [row.name, row.address, row.hours, row.phone].filter(Boolean).join(' · ');
    const days = dates.map(date => ({
      date, label: label(date), shifts: shifts.filter(row => request.now || row.startDate === date),
    }));
    const answer = request.now
      ? 'Según el calendario de UtrerApp, estos turnos están vigentes ahora:\n\n' + shifts.map(describe).join('\n')
      : days.map(day => day.label + ':\n' + (day.shifts.length
        ? day.shifts.map(describe).join('\n') : 'No tengo turnos verificados para esa fecha.')).join('\n\n');
    return { answer: answer + '\n\nFuente: calendario de UtrerApp.', available: true, pharmacy: { days } };
  } catch {
    return unavailable;
  }
}
