import React, { useState, useEffect } from 'react';
import schedulesData from '../data/cercanias_sevilla_schedules.json';

export default function CercaniasSevilla() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const horaActualStr = currentTime.toTimeString().substring(0, 5); // "HH:MM"

  // Procesar trayectos GTFS desde Utrera (stop_id: "51200")
  const viajesUtrera = Array.isArray(schedulesData) ? schedulesData.filter(trip => 
    trip && Array.isArray(trip.stops) && trip.stops.some(stop => stop.stop_id === '51200')
  ) : [];

  const viajesProcesados = viajesUtrera.map(trip => {
    const utreraStop = trip.stops.find(s => s.stop_id === '51200');
    const salidaUtrera = utreraStop ? utreraStop.departure_time.substring(0, 5) : '00:00';
    const firstStop = trip.stops[0]?.stop_name || '';
    const lastStop = trip.stops[trip.stops.length - 1]?.stop_name || '';

    // Lógica limpia:
    // Si Utrera es el origen (o el principio del trayecto) y va hacia Sevilla/Lora -> Columna Sevilla
    // Si el tren viene de Sevilla/Lora y llega a Utrera o continúa hacia el sur (Lebrija/Cádiz) -> Columna Sur/Lebrija
    const utreraIndex = trip.stops.findIndex(s => s.stop_id === '51200');
    const esSalidaDesdeUtrera = utreraIndex === 0;

    let sentido = 'sevilla';
    if (esSalidaDesdeUtrera) {
      sentido = lastStop.includes('Lora') || lastStop.includes('Sevilla') || lastStop.includes('Rosales') ? 'sevilla' : 'sur';
    } else {
      sentido = lastStop.includes('Utrera') || lastStop.includes('Lebrija') || lastStop.includes('Cádiz') ? 'sur' : 'sevilla';
    }

    return {
      ...trip,
      salidaUtrera,
      firstStop,
      lastStop,
      esSalidaDesdeUtrera,
      sentido
    };
  }).sort((a, b) => a.salidaUtrera.localeCompare(b.salidaUtrera));

  const haciaSevilla = viajesProcesados.filter(v => v.sentido === 'sevilla');
  const haciaSur = viajesProcesados.filter(v => v.sentido === 'sur');

  const proximoSevilla = haciaSevilla.find(v => v.salidaUtrera >= horaActualStr) || haciaSevilla[0];
  const posterioresSevilla = haciaSevilla.filter(v => v !== proximoSevilla);

  const proximoSur = haciaSur.find(v => v.salidaUtrera >= horaActualStr) || haciaSur[0];
  const posterioresSur = haciaSur.filter(v => v !== proximoSur);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C221E] pb-24 font-sans">
      
      {/* Cabecera corporativa UtrerApp */}
      <header className="bg-[#5C3A21] text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-serif font-bold tracking-wide">El tren <span className="font-light italic text-[#E3C396]">en Utrera</span></h1>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0 text-xs text-amber-200">
          <span>🕒 Hora actual: <strong className="text-white font-mono">{horaActualStr}</strong></span>
          <span className="bg-[#4A2E1A] px-3 py-1 rounded-full font-bold text-white">GTFS Live</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* Aviso institucional */}
        <div className="bg-[#FFF8E7] border-l-4 border-amber-500 p-4 rounded-xl shadow-sm flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div className="text-sm">
            <span className="font-bold text-amber-900">Avisos de Renfe para Utrera:</span> <span className="text-amber-800">Servicio de Cercanías operativo sincronizado con base de datos local.</span>
          </div>
        </div>

        {/* Dos Columnas Principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLUMNA SEVILLA */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold border-b-2 border-[#2C221E] pb-1">A Sevilla</h2>
            
            {proximoSevilla ? (
              <div className="bg-white border border-[#E6DFD5] rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#2B6CB0] text-white text-xs font-bold px-2 py-0.5 rounded">C1</span>
                    <span className="font-serif font-bold text-xl">{proximoSevilla.lastStop}</span>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">A su hora</span>
                </div>

                <div className="my-4">
                  <p className="text-xs text-gray-500 mb-1">Salida de Utrera</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-serif font-extrabold text-[#2C221E]">{proximoSevilla.salidaUtrera}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="bg-[#2C221E] text-white text-xs px-3 py-1 rounded-lg font-bold">
                    🚆 Vía Principal
                  </div>
                  <span className="text-xs text-gray-600">Origen: <strong className="text-gray-900">{proximoSevilla.firstStop}</strong></span>
                </div>

                <button className="mt-4 w-full bg-[#E3C396]/30 hover:bg-[#E3C396]/50 text-[#5C3A21] font-semibold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2">
                  📤 Avisa a quien vaya contigo
                </button>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border text-sm text-gray-500">No hay trenes programados.</div>
            )}
          </section>

          {/* COLUMNA LEBRIJA Y CÁDIZ */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold border-b-2 border-[#2C221E] pb-1">A Lebrija y Cádiz</h2>
            
            {proximoSur ? (
              <div className="bg-white border border-[#E6DFD5] rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#2B6CB0] text-white text-xs font-bold px-2 py-0.5 rounded">C1</span>
                    <span className="font-serif font-bold text-xl">{proximoSur.lastStop}</span>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">A su hora</span>
                </div>

                <div className="my-4">
                  <p className="text-xs text-gray-500 mb-1">Llegada / Paso por Utrera</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-serif font-extrabold text-[#2C221E]">{proximoSur.salidaUtrera}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="bg-[#2C221E] text-white text-xs px-3 py-1 rounded-lg font-bold">
                    🚆 Vía Principal
                  </div>
                  <span className="text-xs text-gray-600">Origen: <strong className="text-gray-900">{proximoSur.firstStop}</strong></span>
                </div>

                <button className="mt-4 w-full bg-[#E3C396]/30 hover:bg-[#E3C396]/50 text-[#5C3A21] font-semibold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2">
                  📤 Avisa a quien vaya contigo
                </button>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border text-sm text-gray-500">No hay trenes programados.</div>
            )}
          </section>

        </div>

        {/* SECCIÓN "DESPUÉS" */}
        <section className="mt-10 pt-6 border-t border-[#E6DFD5]">
          <h3 className="text-xl font-serif font-bold mb-4">Después</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Lista después Sevilla */}
            <div className="bg-white border border-[#E6DFD5] rounded-2xl p-4 space-y-3">
              {posterioresSevilla.length === 0 ? (
                <p className="text-xs text-gray-400 p-2">No hay más trayectos posteriores.</p>
              ) : (
                posterioresSevilla.map((trip, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-none text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-serif font-bold text-base w-14">{trip.salidaUtrera}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">C1</span>
                      <span className="font-medium text-gray-800">{trip.lastStop}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800">Previsto</span>
                  </div>
                ))
              )}
            </div>

            {/* Lista después Sur */}
            <div className="bg-white border border-[#E6DFD5] rounded-2xl p-4 space-y-3">
              {posterioresSur.length === 0 ? (
                <p className="text-xs text-gray-400 p-2">No hay más trayectos posteriores.</p>
              ) : (
                posterioresSur.map((trip, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-none text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-serif font-bold text-base w-14">{trip.salidaUtrera}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">C1</span>
                      <span className="font-medium text-gray-800">{trip.lastStop}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800">Previsto</span>
                  </div>
                ))
              )}
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}