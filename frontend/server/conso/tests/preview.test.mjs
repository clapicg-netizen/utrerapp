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

const today = '2026-11-24';
const parse = (question, followUp = false) => weatherIntent(question, { today, followUp });

test('resuelve días de la semana, fechas y plazos escritos de distintas formas', () => {
  for (const [question, dates, followUp] of [
    ['¿Y el sábado, qué tiempo hará?', ['2026-11-28']],
    ['¿Qué tiempo hará en Utrera el próximo sábado?', ['2026-11-28']],
    ['¿Qué tiempo hará el sábado?', ['2026-11-28']],
    ['¿Y el domingo?', ['2026-11-29'], true],
    ['¿Lloverá el próximo viernes?', ['2026-11-27']],
    ['¿Qué tiempo hará dentro de tres días?', ['2026-11-27']],
    ['¿Va a llover este finde?', ['2026-11-28', '2026-11-29']],
    ['¿Podré salir el sábado por la tarde?', ['2026-11-28']],
    ['¿Y pasado mañana?', ['2026-11-26'], true],
    ['¿La previsión para el 28 de noviembre?', ['2026-11-28']],
    ['¿Lloverá el 29/11/2026 en Utrera?', ['2026-11-29']],
    ['¿Y el 2026-11-30?', ['2026-11-30'], true],
    ['¿Va a llover de aquí a veintiún días?', ['2026-12-15']],
    ['¿Qué tiempo hará el 31 de noviembre?', []],
  ]) assert.deepEqual(parse(question, followUp)?.dates, dates, question);

  assert.equal(parse('¿Mañana necesito paraguas?').umbrella, true);
  assert.equal(parse('¿Hará mucho viento esta tarde?').part, 'tarde');
  assert.equal(parse('¿Podré salir el sábado por la tarde?').part, 'tarde');
  assert.equal(parse('¿Y el domingo?'), undefined);
  assert.equal(parse('¿Y pasado mañana?'), undefined);
  assert.equal(parse('¿Qué tiempo hará mañana en Sevilla?', true), undefined);
  assert.equal(parse('¿Qué academias hay el sábado?', true), undefined);
});
