export const fuelTypes = [
  { id: 'gasolina95', label: 'Gasolina 95 E5', shortLabel: 'Gasolina 95' },
  { id: 'diesel', label: 'Diésel A', shortLabel: 'Diésel A' },
  { id: 'gasolina98', label: 'Gasolina 98 E5', shortLabel: 'Gasolina 98' },
  { id: 'dieselPremium', label: 'Diésel premium', shortLabel: 'Diésel premium' },
  { id: 'glp', label: 'GLP', shortLabel: 'GLP' },
];

export async function getUtreraFuelPrices(signal) {
  const response = await fetch(process.env.REACT_APP_GASOLINERAS_API_URL || '/api/gasolineras', {
    signal, headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('No se pudo consultar el Geoportal');
  const data = await response.json();
  if (!data.success || !Array.isArray(data.stations)) throw new Error('Respuesta inválida');
  return data;
}
