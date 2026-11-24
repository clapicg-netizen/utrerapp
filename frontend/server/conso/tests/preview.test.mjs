import test from 'node:test';
import assert from 'node:assert/strict';
import { previewIntent, weatherIntent } from '../preview.mjs';
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

test('interpreta fecha, tramo y localidad de preguntas meteorológicas', () => {
  assert.equal(weatherIntent('hola, que tiempo hará mañana en utrera?').day, 'manana');
  assert.equal(weatherIntent('¿Mañana necesito paraguas?').umbrella, true);
  assert.equal(weatherIntent('¿Qué tiempo hará este fin de semana?').day, 'finde');
  assert.equal(weatherIntent('¿Hará mucho viento esta tarde?').part, 'tarde');
  assert.equal(weatherIntent('¿Qué tiempo hará mañana en Sevilla?'), undefined);
});
