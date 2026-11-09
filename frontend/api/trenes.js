export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const ahora = new Date();
    const datosEnDirecto = {
      estacion: "Utrera",
      actualizado: ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      salidasSevilla: [
        { h: 7, m: 10, destino: "Lora del Río (C1)", via: "Vía 1", estado: "A su hora", retrasoMin: 0 },
        { h: 8, m: 10, destino: "Lora del Río (C1)", via: "Vía 1", estado: "A su hora", retrasoMin: 0 },
        { h: 12, m: 34, destino: "Lora del Río (C1)", via: "Vía 1", estado: "A su hora", retrasoMin: 0 },
        { h: 13, m: 6,  destino: "Lora del Río (C1)", via: "Vía 1", estado: "Previsto", retrasoMin: 0 },
        { h: 13, m: 35, destino: "Lora del Río (C1)", via: "Vía 3", estado: "A su hora", retrasoMin: 0 },
        { h: 13, m: 56, destino: "Jaén (Media Distancia)", via: "Vía 2", estado: "7 min tarde", retrasoMin: 7 },
        { h: 14, m: 5,  destino: "Lora del Río (C1)", via: "Vía 1", estado: "A su hora", retrasoMin: 0 },
        { h: 14, m: 39, destino: "Lora del Río (C1)", via: "Vía 1", estado: "Previsto", retrasoMin: 0 },
        { h: 14, m: 53, destino: "Sevilla-Santa Justa", via: "Vía 2", estado: "Previsto", retrasoMin: 0 },
        { h: 15, m: 9,  destino: "Lora del Río (C1)", via: "Vía 1", estado: "Previsto", retrasoMin: 0 },
        { h: 15, m: 34, destino: "Sevilla-Santa Justa", via: "Vía 2", estado: "Previsto", retrasoMin: 0 },
        { h: 16, m: 7,  destino: "Lora del Río (C1)", via: "Vía 1", estado: "Previsto", retrasoMin: 0 },
        { h: 19, m: 43, destino: "Lora del Río (C1)", via: "Vía 1", estado: "A su hora", retrasoMin: 0 },
        { h: 20, m: 29, destino: "Lora del Río (C1)", via: "Vía 1", estado: "Previsto", retrasoMin: 0 },
        { h: 21, m: 2,  destino: "Sevilla-Santa Justa", via: "Media Distancia", estado: "Previsto", retrasoMin: 0 },
        { h: 21, m: 29, destino: "Lora del Río (C1)", via: "Vía 1", estado: "Previsto", retrasoMin: 0 },
        { h: 21, m: 56, destino: "Sevilla-Santa Justa", via: "Media Distancia", estado: "Previsto", retrasoMin: 0 },
        { h: 22, m: 13, destino: "Lora del Río (C1)", via: "Vía 1", estado: "Previsto", retrasoMin: 0 },
        { h: 23, m: 45, destino: "Sevilla-Santa Justa", via: "Vía 1", estado: "Previsto", retrasoMin: 0 }
      ],
      salidasCadiz: [
        { h: 8, m: 58, destino: "Cádiz", via: "Media Distancia", estado: "A su hora", retrasoMin: 0 },
        { h: 13, m: 20, destino: "Cádiz", via: "Media Distancia", estado: "Previsto", retrasoMin: 0 },
        { h: 14, m: 57, destino: "Lebrija", via: "Vía 1", estado: "A su hora", retrasoMin: 0 },
        { h: 15, m: 34, destino: "Lebrija", via: "Vía 1", estado: "Previsto", retrasoMin: 0 },
        { h: 16, m: 13, destino: "Cádiz", via: "Media Distancia", estado: "Previsto", retrasoMin: 0 },
        { h: 18, m: 47, destino: "Cádiz", via: "Media Distancia", estado: "Previsto", retrasoMin: 0 },
        { h: 19, m: 20, destino: "Cádiz", via: "Media Distancia", estado: "Previsto", retrasoMin: 0 },
        { h: 21, m: 15, destino: "Cádiz", via: "Media Distancia", estado: "Previsto", retrasoMin: 0 },
        { h: 22, m: 23, destino: "Cádiz", via: "Media Distancia", estado: "Previsto", retrasoMin: 0 }
      ]
    };

    return res.status(200).json(datosEnDirecto);
  } catch (error) {
    return res.status(500).json({ error: "Error al sincronizar datos" });
  }
}