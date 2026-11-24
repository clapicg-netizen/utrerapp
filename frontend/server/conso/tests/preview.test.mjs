import test from 'node:test';
import assert from 'node:assert/strict';
import { previewIntent } from '../preview.mjs';
import { app } from '../utrerapp.mjs';

test('mapea variantes a preguntas fijas, sin reenviar la frase original', () => {
  for (const [question, approved] of [
    ['Buenas, busco una academia en Utrera', '¿Qué academias hay en Utrera?'],
    ['Buenas, busco alguna academia en Utrera', '¿Qué academias hay en Utrera?'],
    ['Hola, dónde puedo tomar tapas en Utrera por favor', '¿Qué bares hay en Utrera?'],
    ['¿Cómo hacer trámites del ayuntamiento en Utrera?', '¿Dónde puedo consultar las gestiones municipales de Utrera?'],
    ['¿Qué ver en Utrera?', '¿Qué puedo visitar en Utrera?'],
    ['Quiero consultar los horarios de los trenes', '¿Dónde veo la información del tren?'],
    ['¿Qué academias hay en Dos Hermanas?', undefined],
    ['Busco academias en Utrera. Mi teléfono es 600000000', undefined],
  ]) assert.equal(previewIntent(question, app)?.question, approved, question);
});

test('la previsión devuelve una respuesta local y un enlace directo', () => {
  const intent = previewIntent('hola, que tiempo hará mañana en utrera?', app);
  assert.match(intent.answer, /no tengo una previsión meteorológica verificada/);
  assert.match(intent.links[0].url, /aemet\.es\/.*utrera-id41095$/);
});
