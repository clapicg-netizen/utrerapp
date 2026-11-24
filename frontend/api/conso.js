const { createHmac, randomUUID } = require('node:crypto');
const { isIP } = require('node:net');

function createHandler({ env = process.env, namespace, generate } = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const { VERCEL_ENV } = env;
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
    const { openai } = await import('../server/conso/openai.mjs');
    const { gemini } = await import('../server/conso/gemini.mjs');
    const { billingReady, loadSettings, localDay } = await import('../server/conso/settings.mjs');
    const { pricing, monthlyBudgetNanoUsd, SpendingLimit } = await import('../server/conso/budget.mjs');
    const metrics = { calls: 0, searches: 0, input: 0, output: 0 };
    const day = localDay(app.timeZone);
    let store;
    let reserved = false;
    let estimatedNanoUsd = 0;
    try {
      const ip = req.headers['x-vercel-forwarded-for'];
      const settings = loadSettings(app, env);
      const { provider, model, region } = settings;
      const apiKey = provider === 'openai' ? env.OPENAI_API_KEY : env.GEMINI_API_KEY;
      if (!settings.enabled || !settings.adultAccessVerified || !billingReady(provider, env) ||
          !apiKey || typeof ip !== 'string' || !isIP(ip)) return res.status(503).json({ answer: unavailable });

      // Preview privado: nunca se reenvía texto libre. Solo se envían las preguntas
      // públicas y ficticias enumeradas en la configuración de la aplicación.
      if (provider === 'openai' && !app.previewQuestions.includes(question)) {
        return res.status(422).json({ answer: 'En este Preview solo se pueden enviar preguntas de prueba aprobadas.', examples: app.previewQuestions });
      }

      store = redisStore(namespace || app.id, env);
      const price = pricing(provider, model, region);
      const visitor = createHmac('sha256', store.rateSecret).update(day + '\n' + ip).digest('hex');
      reserved = await store.reserve(day, visitor, Math.floor(Date.now() / 60000), settings);
      if (!reserved) return res.status(429).json({ answer: 'Se ha alcanzado el límite de consultas. Vuelve a intentarlo más tarde.' });
      const guardedGenerate = async request => {
        if (request.search) throw new Error('Search disabled in Preview');
        const now = new Date();
        const month = localDay(app.timeZone, now).slice(0, 7);
        const id = randomUUID();
        const decision = await store.reserveSpend(month, id, now.getTime(), price.reserve, monthlyBudgetNanoUsd);
        if (decision !== 'reserved') throw new SpendingLimit(decision);
        const settle = async usage => {
          const actual = price.cost(usage);
          if (actual == null) return;
          estimatedNanoUsd += actual;
          try {
            await store.settleSpend(month, id, actual);
          } catch {
            // Si el resultado es incierto, el importe reservado sigue cubriendo la llamada.
          }
        };
        const adapter = provider === 'openai' ? openai : gemini;
        return (generate || adapter(apiKey, metrics, model, settle, region))(request);
      };
      const data = await answerQuestion({
        question, app, settings, generate: guardedGenerate, sources, day, metrics,
      });
      try {
        await store.record(day, {
          ...metrics, nanoUsd: estimatedNanoUsd,
        });
      } catch {
        // La reserva persistente se conserva aunque fallen las métricas.
      }
      return res.status(200).json(data);
    } catch (error) {
      if (error instanceof SpendingLimit) return res.status(429).json({
        answer: error.reason === 'budget'
          ? 'Se ha alcanzado el presupuesto mensual de Conso.'
          : 'Conso ha alcanzado el límite de llamadas por minuto. Inténtalo de nuevo en un momento.',
      });
      if (reserved) {
        try {
          await store.record(day, {
            ...metrics, failures: 1, nanoUsd: estimatedNanoUsd,
          });
        } catch {
          // El límite ya quedó reservado. No se repite la llamada al proveedor.
        }
      }
      return res.status(503).json({ answer: unavailable });
    }
  };
}

module.exports = createHandler();
module.exports.createHandler = createHandler;
