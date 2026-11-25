// El Geoportal usa un identificador propio para Utrera, distinto del código INE.
const MUNICIPALITY = '6152';
const HOSTS = ['sedeaplicaciones.minetur.gob.es', 'energia.serviciosmin.gob.es'];
const PATH = '/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroMunicipio/';
const PRICE_FIELDS = {
  gasolina95: 'Precio Gasolina 95 E5',
  diesel: 'Precio Gasoleo A',
  gasolina98: 'Precio Gasolina 98 E5',
  dieselPremium: 'Precio Gasoleo Premium',
  glp: 'Precio Gases licuados del petróleo',
};

function readNumber(value) {
  if (value == null || !String(value).trim()) return null;
  const number = Number(String(value).replace(',', '.'));
  return Number.isFinite(number) ? number : null;
}

function normalizeStation(raw) {
  const locality = raw.Localidad?.trim();
  // El catálogo aún asigna esta localidad a Utrera. El Palmar es un municipio independiente.
  if (raw.IDMunicipio !== MUNICIPALITY || raw['Tipo Venta'] !== 'P'
    || locality?.toUpperCase() === 'PALMAR DE TROYA (EL)' || !raw.IDEESS) return null;

  const prices = Object.fromEntries(Object.entries(PRICE_FIELDS).map(([fuel, field]) => {
    const value = readNumber(raw[field]);
    return [fuel, value > 0 ? value : null];
  }));

  if (Object.values(prices).every(value => value === null)) return null;
  return {
    id: raw.IDEESS,
    name: raw.Rótulo?.trim() || 'Estación de servicio',
    address: raw.Dirección?.trim() || '',
    locality,
    hours: raw.Horario?.trim() || '',
    lat: readNumber(raw.Latitud),
    lon: readNumber(raw['Longitud (WGS84)']),
    prices,
  };
}

async function loadPrices() {
  for (const host of HOSTS) {
    try {
      const response = await fetch('https://' + host + PATH + MUNICIPALITY, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(7500),
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      if (data.ResultadoConsulta !== 'OK' || !Array.isArray(data.ListaEESSPrecio)) {
        throw new Error('Respuesta no válida');
      }
      return {
        success: true,
        publishedAt: data.Fecha || null,
        stations: data.ListaEESSPrecio.map(normalizeStation).filter(Boolean),
      };
    } catch (error) {
      console.warn('Geoportal MITECO', host, error.message);
    }
  }
  return null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }

  const prices = await loadPrices();
  if (!prices) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ success: false, error: 'Geoportal no disponible' });
  }
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=120');
  return res.status(200).json(prices);
};

module.exports.loadPrices = loadPrices;
