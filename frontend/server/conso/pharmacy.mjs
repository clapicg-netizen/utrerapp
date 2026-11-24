import { normalizePreviewQuestion } from './preview.mjs';
import { isoDay, resolveWeatherDate, shiftDay } from './weather-dates.mjs';

const guard = /^(?:(?:que|cual es la|cuales son las|donde (?:hay|encuentro|puedo encontrar|consulto|puedo consultar)|busco|necesito) (?:una |las |la )?)?farmacias?(?: hay| estan| esta)?(?: de guardia| abiertas?)$/;
const time = /\b(?:ahora(?: mismo)?|en este momento)\b/;

export function pharmacyIntent(question, today) {
  const clean = normalizePreviewQuestion(question).replace(/\ben utrera\b/, ' ');
  const timing = resolveWeatherDate(clean, today);
  const subject = clean.replace(timing?.phrase || /$^/, ' ').replace(time, ' ').replace(/^\s*y\s+/, '')
    .replace(/\bpara\s*$/, '').replace(/\s+/g, ' ').trim();
  if (!guard.test(subject)) return;
  return { date: timing ? timing.dates[0] : today, now: time.test(clean) || /abiertas?\b/.test(subject) };
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
  const { date } = request;
  const links = [app.pharmacySource];
  if (!date) return { answer: 'No he podido interpretar la fecha. Indícame el día y el mes.', links };
  if (date < today || (request.now && date !== today)) {
    return { answer: 'No puedo confirmar un turno vigente para esa combinación de fecha y hora. Puedes consultar el buscador oficial.', links };
  }
  const label = new Intl.DateTimeFormat('es-ES', { timeZone, dateStyle: 'full' }).format(shiftDay(date));
  const unknown = request.now
    ? 'No puedo confirmar qué farmacia está de guardia ahora en Utrera.'
    : 'No tengo una farmacia de guardia verificada en Utrera para el ' + label + '.';
  try {
    const previous = isoDay(shiftDay(today, -1));
    const dates = request.now ? [previous, today] : [date];
    const rows = await readPublic(app.db, 'farmacias_calendario', {
      select: 'fecha,nombre_farmacia,direccion,horario,turno,telefono',
      fecha: dates.length === 2 ? 'in.(' + dates.join(',') + ')' : 'eq.' + date,
      limit: '30',
    });
    const minutes = new Intl.DateTimeFormat('en-GB', {
      timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).format(now).split(':').reduce((hours, mins) => Number(hours) * 60 + Number(mins));
    const valid = rows.filter(row => {
      if (!dates.includes(row.fecha) || typeof row.nombre_farmacia !== 'string' || !row.nombre_farmacia.trim()) return false;
      const window = openingMinutes(row.horario);
      if (!window) return false;
      if (!request.now) return row.fecha === date;
      const { start, end } = window;
      if (row.fecha === previous) return end < start && minutes < end;
      return minutes >= start && (end < start || minutes < end);
    });
    if (!valid.length) return { answer: unknown, links };
    return {
      answer: (request.now ? 'Según el calendario de UtrerApp, estos turnos están vigentes ahora' :
        'Turnos publicados en el calendario de UtrerApp para el ' + label) + ':\n\n' +
        valid.map(row => [row.nombre_farmacia, row.direccion, row.horario, row.telefono].filter(Boolean).join(' · ')).join('\n') +
        '\n\nPuedes confirmar la guardia en el buscador oficial.',
      links, available: true,
    };
  } catch {
    return { answer: unknown, links };
  }
}
