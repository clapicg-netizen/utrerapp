module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (process.env.VERCEL_ENV !== 'preview') return res.status(404).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }
  const auth = req.headers.authorization;
  if (typeof auth !== 'string' || !/^Bearer [A-Za-z0-9._-]{20,2500}$/.test(auth)) return res.status(401).end();
  try {
    const { app } = await import('../server/conso/utrerapp.mjs');
    const guard = await fetch(app.db.url + '/rest/v1/rpc/es_admin_comercios_utrera', {
      method: 'POST', headers: { apikey: app.db.anonKey, Authorization: auth, 'Content-Type': 'application/json' },
      body: '{}', signal: AbortSignal.timeout(3500),
    });
    if (!guard.ok || await guard.json() !== true) return res.status(403).end();
    const { redisStore } = await import('../server/conso/storage.mjs');
    const { billingReady, loadSettings, localDay } = await import('../server/conso/settings.mjs');
    const settings = loadSettings(app, process.env);
    const billingConfirmed = billingReady(settings.provider, process.env);
    const today = localDay(app.timeZone);
    const days = Array.from({ length: Number(today.slice(-2)) }, (_, i) =>
      today.slice(0, -2) + String(i + 1).padStart(2, '0'));
    let rows;
    try {
      rows = await redisStore(app.id, process.env, { readOnly: true }).metrics(days);
    } catch {
      return res.status(200).json({ settings, billingConfirmed, today: null, month: null });
    }
    const month = {};
    for (const row of rows) for (const [key, count] of Object.entries(row)) month[key] = (month[key] || 0) + count;
    return res.status(200).json({
      settings, billingConfirmed, today: rows.at(-1), month,
    });
  } catch {
    return res.status(503).json({ error: 'La configuración de Conso IA todavía no está disponible en este entorno.' });
  }
};
