const weekdays = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const units = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte'];

export const isoDay = date => date.toISOString().slice(0, 10);
export function shiftDay(day, offset = 0) {
  const date = new Date(day + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
}

function calendarDate(year, month, day) {
  const value = [year, month, day].map((part, index) => String(part).padStart(index === 0 ? 4 : 2, '0')).join('-');
  const parsed = shiftDay(value);
  return Number.isFinite(parsed.getTime()) && isoDay(parsed) === value ? value : null;
}

function upcomingDate(today, year, month, day) {
  const currentYear = Number(today.slice(0, 4));
  let date = calendarDate(year || currentYear, month, day);
  if (!year && date && date < today) date = calendarDate(currentYear + 1, month, day);
  return date;
}

function count(value) {
  if (/^\d+$/.test(value)) return Number(value);
  if (value === 'uno') return 1;
  if (value.startsWith('veinti')) {
    const unit = units.indexOf(value.slice(6));
    if (unit >= 1 && unit <= 9) return 20 + unit;
  }
  if (value === 'treinta') return 30;
  if (value === 'treinta y uno') return 31;
  return units.indexOf(value);
}

const weekday = new RegExp('\\b(?:(?:el|este) )?(?:(proximo|siguiente) )?(' + weekdays.join('|') + ')\\b');
const monthDate = new RegExp('\\b(?:el )?(\\d{1,2}) de (' + months.join('|') + ')(?: (?:de|del) (\\d{4}))?\\b');
const fixedDate = /\b(?:el )?(?:(\d{4})-(\d{2})-(\d{2})|(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?)\b/;
const relative = /\b(?:dentro de|en|de aqui a) (\d{1,6}|[a-z]+(?: y [a-z]+)?) dias?\b/;
const weekend = /\b(?:este |el |(?:el )?proximo )?(?:fin de semana|finde)\b/;
const named = /\b(?:pasado manana|manana|hoy|ayer)\b/;

export function resolveWeatherDate(text, today) {
  let match = text.match(fixedDate);
  if (match) {
    const date = match[1] ? calendarDate(+match[1], +match[2], +match[3]) : upcomingDate(today, +match[6], +match[5], +match[4]);
    return { phrase: match[0], dates: date ? [date] : [] };
  }
  match = text.match(monthDate);
  if (match) {
    const date = upcomingDate(today, +match[3], months.indexOf(match[2]) + 1, +match[1]);
    return { phrase: match[0], dates: date ? [date] : [] };
  }
  match = text.match(relative);
  if (match) {
    const offset = count(match[1]);
    return { phrase: match[0], dates: offset >= 0 ? [isoDay(shiftDay(today, offset))] : [] };
  }
  const current = shiftDay(today).getUTCDay();
  match = text.match(weekend);
  if (match) {
    let saturday = (6 - current + 7) % 7;
    const next = match[0].includes('proximo');
    if (next && current === 6) saturday = 7;
    return {
      phrase: match[0],
      dates: !next && current === 0 ? [today] : [saturday, saturday + 1].map(offset => isoDay(shiftDay(today, offset))),
    };
  }
  match = text.match(weekday);
  if (match) {
    const offset = (weekdays.indexOf(match[2]) - current + 7) % 7;
    return { phrase: match[0], dates: [isoDay(shiftDay(today, match[1] && offset === 0 ? 7 : offset))] };
  }
  match = text.match(named);
  if (match) {
    const offsets = { ayer: -1, hoy: 0, manana: 1, 'pasado manana': 2 };
    return { phrase: match[0], dates: [isoDay(shiftDay(today, offsets[match[0]]))] };
  }
}
