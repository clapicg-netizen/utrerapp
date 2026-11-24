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
const when = /\b(este fin de semana|el fin de semana|este finde|el finde|manana por la tarde|manana por la manana|esta tarde|esta manana|hoy|manana)\b/;

export function weatherIntent(question) {
  const clean = normalizePreviewQuestion(question).replace(/\s+en utrera$/, '');
  const timing = clean.match(when)?.[0] || '';
  if (!weatherPhrase.test(clean.replace(when, '').replace(/\s+/g, ' ').trim())) return;
  return {
    day: /fin de semana|finde/.test(timing) ? 'finde' : timing.startsWith('manana') ? 'manana' : 'hoy',
    part: timing.endsWith('tarde') ? 'tarde' : timing.startsWith('esta manana') || timing.endsWith('por la manana') ? 'manana' : undefined,
    focus: /viento/.test(clean) ? 'wind' : /paraguas|llov|llue/.test(clean) ? 'rain' : undefined,
    umbrella: /paraguas/.test(clean),
  };
}
