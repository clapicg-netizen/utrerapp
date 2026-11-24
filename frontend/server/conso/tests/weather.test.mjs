import test from 'node:test';
import assert from 'node:assert/strict';
import { weatherIntent } from '../preview.mjs';
import { weatherAnswer } from '../weather.mjs';

const now = new Date('2026-11-24T10:00:00Z');
const zone = 'Europe/Madrid';
const publicUrl = 'https://www.aemet.es/es/eltiempo/prediccion/municipios/utrera-id41095';
const day = fecha => ({
  fecha, temperatura: { minima: 7, maxima: 17 },
  probPrecipitacion: [{ periodo: '', value: 70 }, { periodo: '12-18', value: '65' }],
  viento: [{ periodo: '12-18', direccion: 'N', velocidad: 26 }],
  rachaMax: [{ periodo: '12-18', value: 40 }],
});

test('descarga una vez y responde a preguntas distintas con datos de AEMET', async t => {
  const calls = [];
  const place = { code: '41095', name: 'Utrera', url: publicUrl };
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push(url.toString());
    if (calls.length === 1) {
      assert.match(url, /diaria\/41095$/);
      assert.equal(options.headers.api_key, 'prueba');
      return Response.json({ estado: 200, datos: 'https://opendata.aemet.es/opendata/sh/fixture' });
    }
    assert.equal(options.headers.api_key, undefined);
    assert.equal(options.redirect, 'error');
    return Response.json([{ id: 41095, elaborado: '2026-11-24T10:00:00', prediccion: {
      dia: ['2026-11-25', '2026-11-28', '2026-11-29'].map(day),
    } }]);
  });
  const base = { place, apiKey: 'prueba', now, zone };
  const [tomorrow, weekend] = await Promise.all([
    weatherAnswer({ ...base, request: weatherIntent('¿Mañana necesito paraguas?') }),
    weatherAnswer({ ...base, request: weatherIntent('¿Qué tiempo hará este fin de semana?') }),
  ]);
  assert.match(tomorrow.answer, /Llevaría paraguas/);
  assert.match(tomorrow.answer, /70 %.*65 % de precipitación de 12 a 18 h/);
  assert.match(tomorrow.answer, /7 °C.*17 °C.*26 km\/h N.*40 km\/h/);
  assert.match(tomorrow.answer, /Fuente: AEMET/);
  assert.match(weekend.answer, /sábado, 28 de noviembre/);
  assert.match(weekend.answer, /domingo, 29 de noviembre/);
  await weatherAnswer({ ...base, request: weatherIntent('¿Mañana necesito paraguas?') });
  assert.equal(calls.length, 2);
});

test('sin clave o con URL ajena falla sin inventar una previsión', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ estado: 200, datos: 'https://example.com/opendata/sh/fixture' }));
  const base = { place: { code: '41096', name: 'Utrera', url: publicUrl }, now, zone,
    request: weatherIntent('¿Mañana necesito paraguas?') };
  assert.equal((await weatherAnswer(base)).available, false);
  assert.equal(fetch.mock.callCount(), 0);
  assert.match((await weatherAnswer({ ...base, apiKey: 'prueba' })).answer, /no tengo una previsión/);
  assert.equal(fetch.mock.callCount(), 1);
});
