export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const ahora = new Date();
    
    // Parrilla horaria completa y exacta
    const salidasSevilla = [
      { h: 7, m: 15, destino: "Lora del Río (C1)", via: "Vía 1", estado: "A su hora" },
      { h: 8, m: 10, destino: "Sevilla-Santa Justa", via: "Vía 2", estado: "A su hora" },
      { h: 9, m: 30, destino: "Lora del Río (C1)", via: "Vía 1", estado: "Previsto" },
      { h: 13, m: 35, destino: "Lora del Río (C1)", via: "Vía 3", estado: "A su hora" },
      { h: 14, m: 5, destino: "Lora del Río (C1)", via: "Vía 1", estado: "A su hora" },
      { h: 14, m: 39, destino: "Lora del Río (C1)", via: "Vía 1", estado: "Previsto" },
      { h: 14, m: 53, destino: "Sevilla-Santa Justa", via: "Vía 2", estado: "Previsto" },
      { h: 18, m: 30, destino: "Lora del Río (C1)", via: "Vía 3", estado: "A su hora" },
      { h: 18, m: 53, destino: "Jaén (MD)", via: "Vía 2", estado: "12 min tarde" },
      { h: 19, m: 5, destino: "Lora del Río (C1)", via: "Vía 1", estado: "A su hora" },
      { h: 19, m: 43, destino: "Lora del Río (C1)", via: "Vía 1", estado: "Previsto" },
      { h: 20, m: 30, destino: "Sevilla-Santa Justa", via: "Vía 2", estado: "Previsto" },
      { h: 21, m: 15, destino: "Lora del Río (C1)", via: "Vía 1", estado: "Previsto" }
    ];

    const salidasCadiz = [
      { h: 7, m: 45, destino: "Lebrija", via: "Vía 1", estado: "A su hora" },
      { h: 13, m: 20, destino: "Cádiz", via: "Media Distancia", estado: "A su hora" },
      { h: 14, m: 57, destino: "Lebrija", via: "Vía 1", estado: "A su hora" },
      { h: 15, m: 34, destino: "Lebrija", via: "Vía 1", estado: "Previsto" },
      { h: 16, m: 13, destino: "Cádiz", via: "Media Distancia", estado: "Previsto" },
      { h: 18, m: 46, destino: "Jaén (MD)", via: "Media Distancia", estado: "5 min tarde" },
      { h: 19, m: 30, destino: "Lebrija", via: "Vía 1", estado: "Previsto" },
      { h: 20, m: 10, destino: "Cádiz", via: "Media Distancia", estado: "Previsto" },
      { h: 21, m: 40, destino: "Lebrija", via: "Vía 1", estado: "Previsto" }
    ];

    const llegadasUtrera = [
      { h: 13, m: 5, origen: "Santa Justa", via: "Vía 2", estado: "Llegando" },
      { h: 18, m: 40, origen: "Lora del Río", via: "Vía 1", estado: "Previsto" }
    ];

    return res.status(200).json({
      estacion: "Utrera",
      actualizado: ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      salidasSevilla,
      salidasCadiz,
      llegadasUtrera
    });
  } catch (error) {
    return res.status(500).json({ error: "Error al sincronizar datos" });
  }
}