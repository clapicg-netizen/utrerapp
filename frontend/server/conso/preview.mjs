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
