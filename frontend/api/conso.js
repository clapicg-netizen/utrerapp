const { createHmac } = require('node:crypto');
const { isIP } = require('node:net');

function createHandler({ env = process.env, namespace, generate } = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const { VERCEL_ENV, GEMINI_API_KEY } = env;
    const { answerQuestion, unavailable } = await import('../server/conso/engine.mjs');
    if (VERCEL_ENV !== 'preview') return res.status(404).end();
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).end();
    }

    const origin = req.headers.origin;
    const host = req.headers.host;
    if (!host || origin !== 'https://' + host || !/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) {
      return res.status(403).json({ answer: 'La consulta debe enviarse desde UtrerApp.' });
    }
    const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
    if (!question || question.length > 500 || Buffer.byteLength(question) > 1600 ||
        Object.keys(req.body).length !== 1 || /[\u0000-\u0008\u000b-\u001f]/.test(question)) {
      return res.status(400).json({ answer: 'Escribe una pregunta de hasta 500 caracteres.' });
    }

    const { app, ...sources } = await import('../server/conso/utrerapp.mjs');
    const { redisStore } = await import('../server/conso/storage.mjs');
    const { gemini } = await import('../server/conso/gemini.mjs');
    const { loadSettings, localDay, rates } = await import('../server/conso/settings.mjs');
    const metrics = { calls: 0, searches: 0, input: 0, output: 0 };
    const day = localDay(app.timeZone);
    let store;
    let reserved = false;
    let selectedModel;
    try {
      const ip = req.headers['x-vercel-forwarded-for'];
      if (env.CONSO_GEMINI_BILLING_CONFIRMED !== 'true' || !GEMINI_API_KEY || typeof ip !== 'string' || !isIP(ip)) throw new Error('Conso server unavailable');
      store = redisStore(namespace || app.id, env);
      const settings = loadSettings(app, env);
      if (!settings.enabled) return res.status(503).json({ answer: unavailable });
      selectedModel = settings.model;
      const visitor = createHmac('sha256', store.rateSecret).update(day + '\n' + ip).digest('hex');
      reserved = await store.reserve(day, visitor, Math.floor(Date.now() / 60000), settings);
      if (!reserved) return res.status(429).json({ answer: 'Se ha alcanzado el límite de consultas. Vuelve a intentarlo más tarde.' });
      const data = await answerQuestion({
        question, app, settings, generate: generate || gemini(GEMINI_API_KEY, metrics, selectedModel), sources, day, metrics,
      });
      try {
        await store.record(day, {
          ...metrics, nanoUsd: metrics.input * rates[selectedModel].input + metrics.output * rates[selectedModel].output,
        });
      } catch {
        // La reserva persistente se conserva aunque fallen las métricas.
      }
      return res.status(200).json(data);
    } catch {
      if (reserved) {
        try {
          await store.record(day, {
            ...metrics, failures: 1, nanoUsd: metrics.input * rates[selectedModel].input + metrics.output * rates[selectedModel].output,
          });
        } catch {
          // El límite ya quedó reservado. No se repite la llamada a Gemini.
        }
      }
      return res.status(503).json({ answer: unavailable });
    }
  };
}

module.exports = createHandler();
module.exports.createHandler = createHandler;
