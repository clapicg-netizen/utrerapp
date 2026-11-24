import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import handler from '../../../api/conso.js';
import { localDay } from '../settings.mjs';
import { redisStore } from '../storage.mjs';

const [phase, prefix, day, minute] = process.argv.slice(2);
const env = process.env;

async function request(fn, address) {
  const request = {
    method: 'POST',
    headers: {
      host: 'preview.example', origin: 'https://preview.example',
      'content-type': 'application/json', 'x-vercel-forwarded-for': address,
    },
    body: { question: 'Prueba del contador' },
  };
  const response = {
    setHeader() {},
    status(code) { this.code = code; return this; },
    json() {},
    end() {},
  };
  await fn(request, response);
  return response.code;
}

async function run() {
  assert.equal(env.VERCEL_ENV, 'preview');
  assert.ok(env.KV_REST_API_URL && env.KV_REST_API_TOKEN && env.KV_REST_API_READ_ONLY_TOKEN);
  const redisOrigin = new URL(env.KV_REST_API_URL).origin;
  // Los procesos de prueba solo pueden enviar tráfico a esta instancia de Redis.
  const realFetch = globalThis.fetch;
  globalThis.fetch = (url, options) => {
    assert.equal(new URL(url).origin, redisOrigin);
    return realFetch(url, options);
  };

  if (!phase) {
    const id = 'utrerapp-preview:verification:' + randomUUID();
    const date = localDay('Europe/Madrid');
    const window = String(Math.floor(Date.now() / 60000));
    for (const step of ['reserve', 'verify']) {
      const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), step, id, date, window], {
        stdio: 'inherit', timeout: 30000,
      });
      assert.equal(result.status, 0);
    }
    console.log('CONSO REDIS OK: conexión, cuota atómica y persistencia entre procesos; cero llamadas a Gemini.');
    return;
  }

  assert.match(prefix, /^utrerapp-preview:verification:[a-f0-9-]+$/);
  const write = redisStore(prefix, env);
  const read = redisStore(prefix, env, { readOnly: true });

  if (phase === 'reserve') {
    const singleVisitor = await Promise.all(Array.from({ length: 10 }, () =>
      write.reserve(day, 'visitor-a', minute, { userLimit: 2, globalLimit: 5 })));
    assert.equal(singleVisitor.filter(Boolean).length, 2);
    assert.deepEqual(await read.metrics([day]), [{ queries: 2 }]);
    console.log('CONSO REDIS OK: 2 de 10 reservas simultáneas para el mismo visitante.');

    const syntheticEnv = {
      ...env, CONSO_GEMINI_BILLING_CONFIRMED: 'true', GEMINI_API_KEY: 'test-never-sent',
      CONSO_ENABLED: 'true', CONSO_USER_LIMIT: '1', CONSO_GLOBAL_LIMIT: '5',
    };
    let providerCalls = 0;
    const generate = async () => {
      providerCalls++;
      return { topic: 'outside', terms: [], constraints: [], explicitExternal: false, current: false };
    };
    const http = handler.createHandler({ env: syntheticEnv, namespace: prefix, generate });
    assert.equal(await request(http, '192.0.2.1'), 200);
    assert.equal(await request(http, '192.0.2.1'), 429);
    const parallel = await Promise.all(Array.from({ length: 7 }, (_, i) => request(http, '198.51.100.' + (i + 1))));
    assert.equal(parallel.filter(status => status === 200).length, 2);
    assert.equal(parallel.filter(status => status === 429).length, 5);
    assert.equal(providerCalls, 3);

    const failing = handler.createHandler({
      env: { ...syntheticEnv, KV_REST_API_TOKEN: 'invalid-test-token' },
      namespace: prefix, generate,
    });
    assert.equal(await request(failing, '192.0.2.2'), 503);
    assert.equal(providerCalls, 3);
    const pending = handler.createHandler({
      env: { ...syntheticEnv, CONSO_GEMINI_BILLING_CONFIRMED: 'false' }, namespace: prefix, generate,
    });
    assert.equal(await request(pending, '192.0.2.3'), 503);
    assert.equal(providerCalls, 3);
    console.log('CONSO REDIS OK: HTTP 429 por visitante y cuota global; HTTP 503 ante Redis inaccesible y facturación pendiente.');
    return;
  }

  assert.equal(phase, 'verify');
  assert.deepEqual(await read.metrics([day]), [{
    queries: 5, calls: 0, searches: 0, input: 0, output: 0, topic_outside: 3, nanoUsd: 0,
  }]);
  assert.equal(await write.reserve(day, 'new-visitor', minute, { userLimit: 2, globalLimit: 5 }), false);
  assert.equal((await read.metrics([day]))[0].queries, 5);

  const nextDay = new Date(day + 'T12:00:00Z');
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const tomorrow = nextDay.toISOString().slice(0, 10);
  assert.equal(await write.reserve(tomorrow, 'new-visitor', minute, { userLimit: 2, globalLimit: 5 }), true);
  assert.equal((await read.metrics([tomorrow]))[0].queries, 1);
  console.log('CONSO REDIS OK: cuota de 5 persistente en otro proceso; nuevo día con contador independiente.');
}

run().catch(error => {
  // Nunca se incluyen URL, credenciales, cabeceras ni cuerpos en el registro.
  console.error('CONSO REDIS ERROR: ' + (error?.code === 'ERR_ASSERTION' ? 'falló una comprobación' : 'no se pudo realizar la prueba'));
  process.exitCode = 1;
});
