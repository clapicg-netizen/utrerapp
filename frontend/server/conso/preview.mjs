import { resolveWeatherDate } from './weather-dates.mjs';
import { localDay } from './settings.mjs';

export function normalizePreviewQuestion(question) {
  return question.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/[¿?¡!,.;:]+/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/^(?:(?:hola|buenas(?: tardes| noches)?|buenos dias)\s+)+/, '')
    .replace(/\s+(?:por favor|gracias)$/, '');
}

export function previewIntent(question, app) {
  const normalized = normalizePreviewQuestion(question);
  for (const intent of app.previewIntents) {
    if (normalized === normalizePreviewQuestion(intent.question) || intent.variants?.test(normalized)) return intent;
  }
}

const weatherPhrase = /^(?:(?:que tiempo|que temperatura) (?:hace|hara|va a hacer)|(?:va a llover|llueve|llovera)|(?:el )?tiempo|(?:la )?prevision(?: del tiempo)?|(?:necesito|hara falta|hace falta|me llevo|llevo) (?:un )?paraguas|(?:hara|habra|hace|va a hacer) (?:mucho )?viento|(?:cuanto|que) viento (?:hara|hace))$/;
const outing = /^(?:podre|puedo|se podra) (?:salir|pasear|dar un paseo)(?: al aire libre)?$/;
const partPhrase = /\b(?:(?:por la|esta|a la) (manana|tarde|noche)|(?:al )?(mediodia))\b/;

export function weatherIntent(question, { today = localDay('Europe/Madrid'), followUp = false } = {}) {
  const clean = normalizePreviewQuestion(question).replace(/\ben utrera\b/, ' ');
  const part = clean.match(partPhrase);
  const withoutPart = clean.replace(partPhrase, ' ');
  const timing = resolveWeatherDate(withoutPart, today);
  const subject = withoutPart.replace(timing?.phrase || /$^/, ' ')
    .replace(/^\s*y(?:\s+|$)/, '').replace(/\bpara\s*$/, '').replace(/^\s*para\b/, '')
    .replace(/\s+/g, ' ').trim();
  if (!weatherPhrase.test(subject) && !(outing.test(subject) && timing) &&
      !(followUp && (timing || part) && !subject)) return;
  return {
    dates: timing?.dates || [today],
    part: part?.[1] || part?.[2],
    focus: /viento/.test(clean) ? 'wind' : /paraguas|llov|llue/.test(clean) ? 'rain' : undefined,
    umbrella: /paraguas/.test(clean),
  };
}
