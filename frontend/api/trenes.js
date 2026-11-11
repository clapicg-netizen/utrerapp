export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const ahora = new Date();
    const horaActualStr = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Estructura sincronizada con las tarjetas visuales de Utrerapp
    const responsePayload = {
      estacion: "Utrera",
      actualizado: horaActualStr,
      estadoGeneral: "Servicio operativo en el núcleo de Cercanías de Sevilla",
      avisos: [
        {
          id: 1,
          texto: "Cercanías Sevilla informa: Con motivo de la huelga general convocada para hoy, la oferta habitual de trenes podrá verse afectada.",
          timestamp: `Actualizado hoy a las ${ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
          tipo: "alerta"
        },
        {
          id: 2,
          texto: "Ascensor de las vías 4 y 6 averiado.",
          timestamp: "Desde hoy a las 06:29",
          tipo: "incidencia"
        }
      ],
      haciaSevilla: [
        {
          id: 's1',
          linea: "C1",
          destino: "Lora del Río",
          horaProgramada: "07:25",
          intervaloMinutos: "9-17",
          ventanaSalida: "07:25 y 07:33",
          via: "Vía 3",
          estado: "A su hora",
          claseEstado: "normal",
          origenTrayecto: "Empieza su recorrido en Utrera; suele esperar ya en la vía."
        },
        {
          id: 's2',
          linea: "MD",
          destino: "Jaén (Media Distancia)",
          horaProgramada: "08:41",
          via: "Vía 2",
          estado: "8 min tarde",
          claseEstado: "retraso",
          origenTrayecto: "Cádiz"
        },
        {
          id: 's3',
          linea: "C1",
          destino: "Lora del Río",
          horaProgramada: "09:43",
          via: "Vía 1",
          estado: "Previsto",
          claseEstado: "normal",
          origenTrayecto: "Lebrija"
        }
      ],
      haciaCadiz: [
        {
          id: 'c1',
          linea: "MD",
          destino: "Cádiz",
          horaProgramada: "11:31",
          tiempoRestante: "4h 14min",
          via: "Media Distancia",
          estado: "Previsto",
          claseEstado: "normal",
          vieneDe: "Jaén",
          paradas: ["Lora del Río", "Santa Justa", "San Bernardo", "Dos Hermanas", "Utrera"]
        },
        {
          id: 'c2',
          linea: "MD",
          destino: "Cádiz",
          horaProgramada: "08:58",
          estado: "Suprimido el de las 08:58",
          claseEstado: "suprimido",
          mensajeExtra: "MD a Cádiz · abajo, el siguiente"
        },
        {
          id: 'c3',
          linea: "MD",
          destino: "Cádiz",
          horaProgramada: "10:23",
          estado: "Suprimido el de las 10:23",
          claseEstado: "suprimido",
          mensajeExtra: "MD a Cádiz · abajo, el siguiente"
        }
      ]
    };

    return res.status(200).json({
      success: true,
      data: responsePayload
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Error interno al sincronizar el estado de la estación."
    });
  }
}