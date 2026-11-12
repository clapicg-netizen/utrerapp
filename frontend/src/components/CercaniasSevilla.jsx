import React, { useState } from 'react';
import schedulesData from '../data/cercanias_sevilla_schedules.json';

export default function CercaniasSevilla() {
  const [activeTab, setActiveTab] = useState('ahora');

  // Filtramos los viajes reales desde nuestros datos GTFS que pasan por Utrera (stop_id: "51200")
  const viajesConUtrera = Array.isArray(schedulesData) ? schedulesData.filter(trip => 
    trip && Array.isArray(trip.stops) && trip.stops.some(stop => stop.stop_id === '51200')
  ) : [];

  // Separamos de forma segura los trenes
  const trenesHaciaSevilla = viajesConUtrera.filter(trip => {
    const lastStop = trip.stops[trip.stops.length - 1];
    return lastStop && (lastStop.stop_name.includes('Sevilla') || lastStop.stop_name.includes('Lora') || lastStop.stop_name.includes('Rosales'));
  });

  const trenesHaciaSur = viajesConUtrera.filter(trip => !trenesHaciaSevilla.includes(trip));

  const proximoSevilla = trenesHaciaSevilla[0] || null;
  const posterioresSevilla = trenesHaciaSevilla.slice(1);

  const proximoSur = trenesHaciaSur[0] || null;
  const posterioresSur = trenesHaciaSur.slice(1);

  const getUtreraTime = (trip) => {
    const stop = trip.stops.find(s => s.stop_id === '51200');
    return stop && stop.departure_time ? stop.departure_time.substring(0, 5) : '--:--';
  };

  const getFirstStopName = (trip) => trip.stops[0]?.stop_name || 'Origen';
  const getLastStopName = (trip) => trip.stops[trip.stops.length - 1]?.stop_name || 'Destino';

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C221E] pb-24 font-sans">
      {/* Cabecera Superior Estilo "El tren en Utrera" */}
      <header className="bg-[#5C3A21] text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-serif font-bold tracking-wide">El tren <span className="font-light italic text-[#E3C396]">en Utrera</span></h1>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0 bg-[#4A2E1A] p-1 rounded-full text-xs font-medium">
          <button 
            onClick={() => setActiveTab('ahora')}
            className={`px-4 py-1.5 rounded-full transition ${activeTab === 'ahora' ? 'bg-white text-[#5C3A21] shadow-sm font-bold' : 'text-amber-100 hover:text-white'}`}
          >
            🚆 Ahora
          </button>
          <button 
            onClick={() => setActiveTab('volver')}
            className={`px-4 py-1.5 rounded-full transition ${activeTab === 'volver' ? 'bg-white text-[#5C3A21] shadow-sm font-bold' : 'text-amber-100 hover:text-white'}`}
          >
            ← Volver
          </button>
          <button 
            onClick={() => setActiveTab('como-va')}
            className={`px-4 py-1.5 rounded-full transition ${activeTab === 'como-va' ? 'bg-white text-[#5C3A21] shadow-sm font-bold' : 'text-amber-100 hover:text-white'}`}
          >
            📊 Cómo va
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* Aviso de Renfe */}
        <div className="bg-[#FFF8E7] border-l-4 border-amber-500 p-4 rounded-xl shadow-sm flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div className="text-sm">
            <span className="font-bold text-amber-900">Avisos oficiales de Renfe (GTFS):</span> <span className="text-amber-800 font-medium">Datos sincronizados del núcleo de Sevilla.</span>
          </div>
        </div>

        {/* Columnas Principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLUMNA SEVILLA */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold border-b-2 border-[#2C221E] pb-1">A Sevilla / Lora</h2>
            
            {proximoSevilla ? (
              <div className="bg-white border border-[#E6DFD5] rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#2B6CB0] text-white text-xs font-bold px-2 py-0.5 rounded">C1</span>
                    <span className="font-serif font-bold text-xl">{getLastStopName(proximoSevilla)}</span>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">A su hora</span>
                </div>

                <div className="my-4">
                  <p className="text-xs text-gray-500 mb-1">Salida estimada de Utrera</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-serif font-extrabold text-[#2C221E]">{getUtreraTime(proximoSevilla)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="bg-[#2C221E] text-white text-xs px-3 py-1 rounded-lg font-bold flex items-center gap-1">
                    <span>🚆 Vía Principal</span>
                  </div>
                  <span className="text-xs text-gray-600">Origen: <strong className="text-gray-900">{getFirstStopName(proximoSevilla)}</strong></span>
                </div>

                <button className="mt-4 w-full bg-[#E3C396]/30 hover:bg-[#E3C396]/50 text-[#5C3A21] font-semibold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2">
                  📤 Avisa a quien vaya contigo
                </button>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border text-sm text-gray-500">No hay más trenes programados hoy en este sentido.</div>
            )}
          </section>

          {/* COLUMNA SUR */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold border-b-2 border-[#2C221E] pb-1">A Lebrija / Cádiz</h2>
            
            {proximoSur ? (
              <div className="bg-white border border-[#E6DFD5] rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#2B6CB0] text-white text-xs font-bold px-2 py-0.5 rounded">C1</span>
                    <span className="font-serif font-bold text-xl">{getLastStopName(proximoSur)}</span>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">A su hora</span>
                </div>

                <div className="my-4">
                  <p className="text-xs text-gray-500 mb-1">Salida estimada de Utrera</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-serif font-extrabold text-[#2C221E]">{getUtreraTime(proximoSur)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="bg-[#2C221E] text-white text-xs px-3 py-1 rounded-lg font-bold flex items-center gap-1">
                    <span>🚆 Vía Principal</span>
                  </div>
                  <span className="text-xs text-gray-600">Origen: <strong className="text-gray-900">{getFirstStopName(proximoSur)}</strong></span>
                </div>

                <button className="mt-4 w-full bg-[#E3C396]/30 hover:bg-[#E3C396]/50 text-[#5C3A21] font-semibold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2">
                  📤 Avisa a quien vaya contigo
                </button>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border text-sm text-gray-500">No hay más trenes programados hoy en este sentido.</div>
            )}
          </section>

        </div>

        {/* SECCIÓN "DESPUÉS" */}
        <section className="mt-10 pt-6 border-t border-[#E6DFD5]">
          <h3 className="text-xl font-serif font-bold mb-4">Después (Próximos trayectos reales)</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            <div className="bg-white border border-[#E6DFD5] rounded-2xl p-4 space-y-3">
              {posterioresSevilla.length === 0 ? (
                <p className="text-xs text-gray-400 p-2">No hay más registros posteriores hacia Sevilla en el feed.</p>
              ) : (
                posterioresSevilla.map((trip, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-none text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-serif font-bold text-base w-14">{getUtreraTime(trip)}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">C1</span>
                      <span className="font-medium text-gray-800">Destino: {getLastStopName(trip)}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800">Previsto</span>
                  </div>
                ))
              )}
            </div>

            <div className="bg-white border border-[#E6DFD5] rounded-2xl p-4 space-y-3">
              {posterioresSur.length === 0 ? (
                <p className="text-xs text-gray-400 p-2">No hay más registros posteriores hacia el sur en el feed.</p>
              ) : (
                posterioresSur.map((trip, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-none text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-serif font-bold text-base w-14">{getUtreraTime(trip)}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">C1</span>
                      <span className="font-medium text-gray-800">Destino: {getLastStopName(trip)}</span>
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