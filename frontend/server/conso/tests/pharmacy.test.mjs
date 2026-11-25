import test from 'node:test';
import assert from 'node:assert/strict';
import { pharmacyIntent, pharmacyAnswer } from '../pharmacy.mjs';
import { weatherIntent } from '../preview.mjs';
import { app } from '../utrerapp.mjs';
import { localDay } from '../settings.mjs';

const today = '2026-11-25';
const timeZone = 'Europe/Madrid';
const defaultNow = new Date('2026-11-24T23:30:00Z');
const fixture = [
  { fecha: '2026-11-24', nombre_farmacia: 'Turno nocturno anterior', horario: '22:00 a 09:30 h' },
  { fecha: '2026-11-25', nombre_farmacia: 'Turno diurno', horario: '09:30 a 22:00 h' },
  { fecha: '2026-11-25', nombre_farmacia: 'Turno nocturno de hoy', horario: '22:00 a 09:30 h' },
  { fecha: '2026-11-25', nombre_farmacia: 'Turno sin horario', horario: '' },
  { fecha: '2026-11-27', nombre_farmacia: 'Turno futuro', horario: '09:30 a 22:00 h' },
];

function check(question, readPublic = async () => fixture, now = defaultNow) {
  return pharmacyAnswer({ request: pharmacyIntent(question, today), today, timeZone, now, app, readPublic });
}

test('reconoce preguntas de farmacia y no las confunde con un seguimiento del tiempo', () => {
  for (const text of ['¿Qué farmacia hay de guardia hoy?', 'Hola, ¿cuál es la farmacia de guardia en Utrera?',
    '¿Qué farmacias están de guardia mañana?', '¿Dónde consulto las farmacias de guardia?']) {
    assert.ok(pharmacyIntent(text, today), text);
    assert.equal(weatherIntent(text, { today, followUp: true }), undefined);
  }
  assert.equal(pharmacyIntent('¿Qué farmacia hay de guardia mañana?', today).dates[0], '2026-11-26');
  assert.equal(pharmacyIntent('¿Farmacia de guardia en Sevilla?', today), undefined);
  assert.equal(localDay(timeZone, defaultNow), today);
});

test('solo muestra turnos con fecha y horario publicados', async () => {
  const result = await check('¿Qué farmacias hay de guardia hoy?', async (_db, table, params) => {
    assert.equal(table, 'farmacias_calendario');
    assert.equal(params.fecha, 'eq.2026-11-25');
    return fixture;
  });
  assert.match(result.answer, /miércoles, 25 de noviembre/);
  assert.match(result.answer, /Turno diurno/);
  assert.match(result.answer, /Turno nocturno de hoy/);
  assert.doesNotMatch(result.answer, /anterior|futuro|sin horario/);
});

test('la guardia vigente cruza medianoche y no incluye el turno siguiente', async () => {
  const night = await check('¿Qué farmacia está de guardia ahora?');
  assert.match(night.answer, /Turno nocturno anterior/);
  assert.doesNotMatch(night.answer, /Turno diurno|Turno nocturno de hoy/);
  const day = await check('¿Qué farmacia está de guardia ahora?', undefined, new Date('2026-11-25T08:30:00Z'));
  assert.match(day.answer, /Turno diurno/);
  assert.doesNotMatch(day.answer, /anterior|Turno nocturno de hoy/);
});

test('sin registro o si Supabase falla, no devuelve datos de otra fecha ni enlaces externos', async () => {
  for (const source of [async () => [fixture[4]], async () => { throw new Error('Temporalmente sin acceso'); }]) {
    const result = await check('¿Qué farmacia hay de guardia mañana?', source);
    assert.match(result.answer, /No tengo una farmacia de guardia verificada.*26 de noviembre/);
    assert.doesNotMatch(result.answer, /Turno/);
    assert.equal(result.links, undefined);
  }
});

test('las repreguntas mantienen el tema y el turno que corresponde', async () => {
  assert.equal(pharmacyIntent('¿Y mañana?', today), undefined);
  assert.deepEqual(pharmacyIntent('¿Y mañana?', today, true).dates, ['2026-11-26']);
  assert.equal(pharmacyIntent('¿Y el domingo, qué tiempo hará?', today, true), undefined);
  assert.deepEqual(weatherIntent('¿Y mañana?', { today, followUp: true }).dates, ['2026-11-26']);
  const request = pharmacyIntent('¿Y esta noche?', today, true);
  const result = await pharmacyAnswer({ request, today, timeZone, now: defaultNow, app, readPublic: async () => fixture });
  assert.match(result.answer, /Turno nocturno de hoy/);
  assert.doesNotMatch(result.answer, /Turno diurno|Turno nocturno anterior/);
});
