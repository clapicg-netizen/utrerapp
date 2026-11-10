// frontend/src/lib/fuelService.js
export async function getUtreraFuelPrices() {
  try {
    const response = await fetch('/api/gasolineras', {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Error al consultar precios (${response.status})`);
    }

    const payload = await response.json();
    const stations = Array.isArray(payload) ? payload : payload.stations || payload.data || [];

    return stations.map(raw => ({
      id: raw.IDElem || raw.codigo || raw.Rótulo,
      name: raw.Rótulo || raw.nombre || "Estación de Servicio",
      address: raw.Dirección || raw.address || "Utrera",
      price95: parsePrice(raw["Precio Gasolina 95 E5"] || raw.precio95),
      priceDiesel: parsePrice(raw["Precio Gasóleo A"] || raw.precioDiesel),
      lat: parseNumber(raw.Latitud?.replace(',', '.')),
      lon: parseNumber(raw["Longitud (WGS84)"]?.replace(',', '.')) || parseNumber(raw.Longitud?.replace(',', '.'))
    })).filter(s => s.price95 != null || s.priceDiesel != null)
      .sort((a, b) => (a.price95 || 99) - (b.price95 || 99));

  } catch (error) {
    console.error("Error obteniendo precios reales:", error);
    return [];
  }
}

function parsePrice(value) {
  if (!value) return null;
  const num = Number(String(value).replace(',', '.'));
  return Number.isFinite(num) ? num : null;
}

function parseNumber(value) {
  if (!value) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}