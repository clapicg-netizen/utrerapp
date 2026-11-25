const { createHmac, randomUUID } = require('node:crypto');
const { isIP } = require('node:net');
const { loadPrices } = require('./gasolineras.js');

function createHandler({ env = process.env, namespace, generate } = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const { VERCEL_ENV } = env;
    const { localIntent, contextosLocales, consultaSensible, contestarLocal } = await import('../server/conso/intencion-local.mjs');
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
    const followUp = req.body?.weatherFollowUp;
    const context = req.body?.context ?? (followUp ? 'weather' : undefined);
    if (!question || question.length > 500 || Buffer.byteLength(question) > 1600 ||
        Object.keys(req.body).some(key => key !== 'question' && key !== 'weatherFollowUp' && key !== 'context') ||
        (followUp !== undefined && typeof followUp !== 'boolean') ||
        (context !== undefined && !['weather','pharmacy',...contextosLocales].includes(context)) || /[\u0000-\u0008\u000b-\u001f]/.test(question)) {
      return res.status(400).json({ answer: 'Escribe una pregunta de hasta 500 caracteres.' });
    }

    const { app, ...sources } = await import('../server/conso/utrerapp.mjs');
    const { redisStore } = await import('../server/conso/storage.mjs');
    const { openai } = await import('../server/conso/openai.mjs');
    const { gemini } = await import('../server/conso/gemini.mjs');
    const { billingReady, loadSettings, localDay } = await import('../server/conso/settings.mjs');
    const { pricing, monthlyBudgetNanoUsd, SpendingLimit } = await import('../server/conso/budget.mjs');
    const metrics = { calls: 0, searches: 0, input: 0, output: 0 };
    const now = new Date();
    const day = localDay(app.timeZone, now);
    let store;
    let reserved = false;
    let estimatedNanoUsd = 0;
    try {
      const ip = req.headers['x-vercel-forwarded-for'];
      const settings = loadSettings(app, env);
      const { provider, model, region } = settings;
      const apiKey = provider === 'openai' ? env.OPENAI_API_KEY : env.GEMINI_API_KEY;
      if (!settings.enabled || !settings.adultAccessVerified || typeof ip !== 'string' || !isIP(ip)) {
        return res.status(503).json({ answer: unavailable });
      }

      const { previewIntent, weatherIntent } = await import('../server/conso/preview.mjs');
      const { pharmacyIntent, pharmacyAnswer } = await import('../server/conso/pharmacy.mjs');
      const pharmacy = settings.pharmacies && pharmacyIntent(question, day, context === 'pharmacy');
      const weather = !pharmacy && app.weather && weatherIntent(question, { today: day, followUp: context === 'weather' });
      const directa = !pharmacy && !weather && localIntent(question,context);
      const puedeResolver = directa && (['education','food'].includes(directa.topic) ? settings.directory : settings.official);
      const intent = !pharmacy && !weather && !puedeResolver && provider === 'openai' && previewIntent(question,app);
      if (consultaSensible(question)) return res.status(422).json({answer:'Escribe la consulta sin incluir datos personales.'});
      if (!pharmacy && !weather && !puedeResolver && !intent?.answer && (!billingReady(provider, env) || !apiKey)) {
        return res.status(503).json({ answer: unavailable });
      }

      store = redisStore(namespace || app.id, env);
      const price = pricing(provider, model, region);
      const visitor = createHmac('sha256', store.rateSecret).update(day + '\n' + ip).digest('hex');
      reserved = await store.reserve(day, visitor, Math.floor(Date.now() / 60000), settings);
      if (!reserved) return res.status(429).json({ answer: 'Se ha alcanzado el límite de consultas. Vuelve a intentarlo más tarde.' });
      async function recordUsage(extra = {}) {
        try {
          await store.record(day, { ...metrics, nanoUsd: estimatedNanoUsd, ...extra });
        } catch {
          // Una incidencia en las métricas no libera una reserva previa.
        }
      }

      if (pharmacy) {
        const { available, ...data } = await pharmacyAnswer({
          request: pharmacy, today: day, timeZone: app.timeZone, now, app, readPublic: sources.readPublic,
        });
        await recordUsage({ topic_pharmacy: 1, ...(available ? { direct: 1 } : {}) });
        return res.status(200).json({ ...data, context: 'pharmacy' });
      }
      if (weather) {
        const { weatherAnswer } = await import('../server/conso/weather.mjs');
        const { available, ...data } = await weatherAnswer({
          place: app.weather, apiKey: env.AEMET_API_KEY, request: weather, zone: app.timeZone,
        });
        await recordUsage({ topic_weather: 1, ...(available ? { direct: 1 } : { weatherUnavailable: 1 }) });
        return res.status(200).json({ ...data, context: 'weather' });
      }
      if (puedeResolver) {
        const dato = await contestarLocal(directa,{app,settings,sources,loadFuel:loadPrices,
          loadTrain:async()=> (await import('../server/renfe.mjs')).getBoard()});
        await recordUsage({direct:1});
        return res.status(200).json({...dato,context:directa.topic});
      }
      if (intent?.answer) {
        await recordUsage({ direct: 1 });
        return res.status(200).json({ answer: intent.answer, links: intent.links });
      }

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
        metrics.aiQueries = 1;
        const adapter = provider === 'openai' ? openai : gemini;
        return (generate || adapter(apiKey, metrics, model, settle, region))(request);
      };
      const data = await answerQuestion({
        question: intent?.question || question, app, settings, generate: guardedGenerate, sources, day, metrics,
      });
      await recordUsage(metrics.aiQueries ? {} : { direct: 1 });
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
