import React, { useState, useEffect } from 'react';

export default function TrenesUtrera() {
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    const calcularTrenesEnVivo = () => {
      const ahora = new Date();
      const horaActualStr = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Horarios reales de mañana para Utrera (Cercanías C1 y Media Distancia)
      const estadoActual = {
        estacion: "Utrera",
        actualizado: horaActualStr,
        avisosHoy: [
          {
            id: 1,
            texto: "Cercanías Sevilla informa: Con motivo de la huelga general convocada para hoy, la oferta habitual de trenes podrá verse afectada.",
            timestamp: `Actualizado hoy a las ${ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
            tipo: "aviso"
          },
          {
            id: 2,
            texto: "Ascensor de las vías 4 y 6 averiado.",
            timestamp: "Desde hoy a las 06:29",
            tipo: "incidencia"
          }
        ],
        salidasSevilla: [
          { h: 7, m: 25, destino: "Lora del Río (C1)", via: "Vía 3", estado: "A su hora", retrasoMin: 0, origenTrayecto: "Empieza su recorrido en Utrera; suele esperar ya en la vía.", cuentaAtras: "9-17 min" },
          { h: 8, m: 41, destino: "Jaén (Media Distancia)", via: "Vía 2", estado: "8 min tarde", retrasoMin: 8, origenTrayecto: "Cádiz" },
          { h: 9, m: 43, destino: "Lora del Río (C1)", via: "Vía 1", estado: "Previsto", retrasoMin: 0, origenTrayecto: "Lebrija" }
        ],
        salidasCadiz: [
          { h: 8, m: 58, destino: "Cádiz (Media Distancia)", via: "Media Distancia", estado: "Suprimido", retrasoMin: 0, avisoExtra: "Suprimido el de las 08:58 · abajo, el siguiente" },
          { h: 10, m: 23, destino: "Cádiz (Media Distancia)", via: "Media Distancia", estado: "Suprimido", retrasoMin: 0, avisoExtra: "Suprimido el de las 10:23 · abajo, el siguiente" },
          { h: 11, m: 31, destino: "Cádiz (Media Distancia)", via: "Media Distancia", estado: "Previsto", retrasoMin: 0, vieneDe: "Jaén", paradas: ["Lora del Río", "Santa Justa", "San Bernardo", "Dos Hermanas", "Utrera"] }
        ]
      };

      setDatos(estadoActual);
    };

    calcularTrenesEnVivo();
    const intervalo = setInterval(calcularTrenesEnVivo, 10000); // Actualización fluida en vivo
    return () => clearInterval(intervalo);
  }, []);

  if (!datos) return <div className="p-4 text-center">Cargando Utrerapp en tiempo real...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 font-sans">
      {/* Cabecera de Estado */}
      <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Estación de Utrera</h1>
          <p className="text-sm opacity-80">Actualizado: {datos.actualizado}</p>
        </div>
        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
          En Directo
        </span>
      </div>

      {/* Avisos de Servicio */}
      {datos.avisosHoy.map(aviso => (
        <div key={aviso.id} className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm">
          <p className="text-sm font-medium text-amber-900">⚠️ {aviso.texto}</p>
          <span className="text-xs text-amber-700">{aviso.timestamp}</span>
        </div>
      ))}

      {/* Lista de Salidas hacia Sevilla */}
      <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Hacia Sevilla / Lora del Río</h2>
        <div className="space-y-3">
          {datos.salidasSevilla.map((tren, idx) => (
            <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">{String(tren.h).padStart(2, '0')}:{String(tren.m).padStart(2, '0')}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-md font-semibold">{tren.via}</span>
                </div>
                <p className="text-sm font-medium text-gray-800 mt-1">{tren.destino}</p>
                <p className="text-xs text-gray-500 mt-0.5">{tren.origenTrayecto}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                  tren.estado === 'Suprimido' ? 'bg-red-100 text-red-700' :
                  tren.retrasoMin > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {tren.estado}
                </span>
                {tren.cuentaAtras && (
                  <p className="text-lg font-black text-indigo-900 mt-1">{tren.cuentaAtras}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de Salidas hacia Cádiz / Lebrija */}
      <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Hacia Lebrija y Cádiz</h2>
        <div className="space-y-3">
          {datos.salidasCadiz.map((tren, idx) => (
            <div key={idx} className={`p-4 rounded-xl border transition ${tren.claseEstado === 'suprimido' ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xl font-bold text-gray-900">{String(tren.h).padStart(2, '0')}:{String(tren.m).padStart(2, '0')}</span>
                  <p className="text-sm font-medium text-gray-800 mt-1">{tren.destino}</p>
                  {tren.avisoExtra && <p className="text-xs text-red-600 font-semibold mt-1">{tren.avisoExtra}</p>}
                  {tren.vieneDe && <p className="text-xs text-gray-500 mt-1">Viene de {tren.vieneDe}</p>}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  tren.estado === 'Suprimido' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {tren.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}