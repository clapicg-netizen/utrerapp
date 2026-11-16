module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  res.setHeader('Cache-Control', 'no-store');
  try {
    const { getBoard } = await import('../server/renfe.mjs');
    return res.status(200).json(await getBoard());
  } catch (error) {
    console.error('Panel de Utrera', error);
    return res.status(503).json({ error: 'No se ha podido consultar Renfe' });
  }
};
