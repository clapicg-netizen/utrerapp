// frontend/api/gasolineras.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    // Llamada oficial al servicio REST del MITECO (Municipio de Utrera: código 3095)
    const respuesta = await fetch(
      'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroMunicipio/3095',
      { cache: 'no-store' }
    );

    if (!respuesta.ok) {
      throw new Error('Error al conectar con la pasarela oficial del MITECO');
    }

    const datos = await respuesta.json();
    const estaciones = datos.ListaEstacionesServicio || [];

    return res.status(200).json({
      success: true,
      stations: estaciones
    });

  } catch (error) {
    console.error('Error en pasarela de gasolineras:', error);
    return res.status(500).json({
      success: false,
      error: 'No se pudieron recuperar los precios actualizados',
      stations: []
    });
  }
}