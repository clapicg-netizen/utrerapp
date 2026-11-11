export default function handler(req, res) {
  // Configurar CORS para permitir peticiones desde tu PWA
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const ahora = new Date();
    const horaActual = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Estructura de datos de circulaciones de Utrera
    const datosTrenes = {
      estacion: "Utrera",
      actualizado: horaActual,
      fuente: "Renfe Operadora (Utrerapp Serverless)",
      estadoGeneral: "Servicio en funcionamiento en el núcleo de Cercanías",
      salidasSevilla: [
        { id: 's1', hora: "18:41", destino: "Jaén (Media Distancia)", via: "Vía 2", estado: "8 min tarde", retraso: 8, origen: "Cádiz" },
        { id: 's2', hora: "19:43", destino: "Lora del Río (C1)", via: "Vía 1", estado: "Previsto", retraso: 0, origen: "Lebrija" },
        { id: 's3', hora: "21:02", destino: "Sevilla-Santa Justa", via: "Media Distancia", estado: "Suprimido", retraso: 0, origen: "Cádiz" },
        { id: 's4', hora: "21:29", destino: "Lora del Río (C1)", via: "Vía 1", estado: "Previsto", retraso: 0, origen: "Lebrija" }
      ],
      salidasCadiz: [
        { id: 'c1', hora: "21:15", destino: "Cádiz", via: "Media Distancia", estado: "Suprimido", retraso: 0 },
        { id: 'c2', hora: "22:23", destino: "Cádiz", via: "Media Distancia", estado: "Previsto", retraso: 0 }
      ],
      haciaUtrera: [
        { id: 'u1', hora: "21:03", origen: "Lora del Río", destino: "Utrera", estado: "Previsto", retraso: 0, paradas: ["J. Hércules", "Bellavista", "Dos Hermanas", "Cantaelgallo", "Utrera"] }
      ]
    };

    return res.status(200).json({
      success: true,
      data: datosTrenes
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Error al procesar las circulaciones de trenes."
    });
  }
}
