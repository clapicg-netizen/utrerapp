import React, { useState, useEffect } from 'react';
import schedulesData from '../data/cercanias_sevilla_schedules.json';

export default function CercaniasSevilla() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const horaActualStr = currentTime.toTimeString().substring(0, 5); // "HH:MM"

  // 1. Extraer todos los viajes de Utrera (stop_id: "51200")
  const viajesUtrera = Array.isArray(schedulesData) ? schedulesData.filter(trip => 
    trip && Array.isArray(trip.stops) && trip.stops.some(stop => stop.stop_id === '51200')
  ) : [];

  // 2. Procesar y clasificar inteligentemente cada trayecto
  const viajesProcesados = viajesUtrera.map(trip => {
    const utreraStop = trip.stops.find(s => s.stop_id === '51200');
    const salidaUtrera = utreraStop ? utreraStop.departure_time.substring(0, 5) : '00:00';
    const firstStop = trip.stops[0]?.stop_name || '';
    const lastStop = trip.stops[trip.stops.length - 1]?.stop_name || '';

    // Si el tren empieza en Utrera y va hacia Sevilla/Lora, o si pasa por Utrera dirección Sevilla
    // Determinamos el sentido según la posición de Utrera en el array de paradas o el destino final
    const utreraIndex = trip.stops.findIndex(s => s.stop_id === '51200');
    const esDestinoSur = lastStop.includes('Lebrija') || lastStop.includes('Cádiz') || lastStop.includes('Utrera') && utreraIndex > 0;
    
    // Criterio robusto: Si Utrera no es la última parada y va hacia arriba (Santa Justa, Lora, Rosales)
    const vaHaciaSevilla = !lastStop.includes('Utrera') && (lastStop.includes('Sevilla') || lastStop.includes('Lora') || lastStop.includes('Rosales') || lastStop.includes('Cazalla') || utreraIndex === 0);

    return {
      ...trip,
      salidaUtrera,
      firstStop,
      lastStop,
      sentido: vaHaciaSevilla ? 'sevilla' : 'sur'
    };
  }).sort((a, b) => a.salidaUtrera.localeCompare(b.salidaUtrera));

  // Separar en dos bloques reales
  const haciaSevilla = viajesProcesados.filter(v => v.sentido === 'sevilla');
  const haciaSur = viajesProcesados.filter(v => v.sentido === 'sur');

  // Próximo tren (el que sea igual o inmediatamente posterior a la hora actual, o el primero del día)
  const proximoSevilla = haciaSevilla.find(v => v.salidaUtrera >= horaActualStr) || haciaSevilla[0];
  const posterioresSevilla = haciaSevilla.filter(v => v !== proximoSevilla);

  const proximoSur = haciaSur.find(v => v.salidaUtrera >= horaActualStr) || haciaSur[0];
  const posterioresSur = haciaSur.filter(v => v !== proximoSur);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24 text-slate-800 font-sans">
      
      {/* Cabecera Propia UtrerApp */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white p-6 rounded-3xl shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-4 top-4 text-7xl opacity-10">🚆</div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-400 text-slate-900 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-extrabold shadow-sm">
              UtrerApp Live Rail
            </span>
            <span className="text-xs text-blue-200">Núcleo Cercanías Sevilla • Estación de Utrera</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Estado de Trenes en Tiempo Real</h1>
          <p className="text-blue-100 text-sm mt-1">
            Hora actual: <strong className="text-amber-300 font-mono text-base">{horaActualStr}</strong> • Mostrando todos los trayectos oficiales GTFS sincronizados.
          </p>
        </div>
      </div>

      {/* Grid de 2 Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* COLUMNA SEVILLA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-blue-600 pb-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>↗️</span> Dirección Sevilla / Lora
            </h2>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-lg">Línea C-1</span>
          </div>

          {proximoSevilla ? (
            <div className="bg-white border-2 border-blue-500/30 rounded-2xl p-6 shadow-md bg-gradient-to-b from-blue-50/20 to-white">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">Próxima Salida Utrera</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> En servicio
                </span>
              </div>

              <div className="my-3">
                <div className="text-4xl font-black font-mono text-slate-900">{proximoSevilla.salidaUtrera}</div>
                <p className="text-sm font-semibold text-slate-600 mt-1">Destino: <span className="text-slate-900">{proximoSevilla.lastStop}</span></p>
              </div>

              <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 flex justify-between items-center mt-4">
                <span>Origen: {proximoSevilla.firstStop}</span>
                <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">ID: {proximoSevilla.trip_id}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border text-sm text-slate-500 text-center">No hay trenes programados en esta dirección.</div>
          )}

          {/* Listado Posteriores Sevilla */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Siguientes salidas ({posterioresSevilla.length})</h3>
            {posterioresSevilla.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 text-center">No hay más trayectos posteriores.</p>
            ) : (
              posterioresSevilla.map((trip, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 rounded-xl transition border-b border-slate-100 last:border-none">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-base text-slate-900">{trip.salidaUtrera}</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Destino: {trip.lastStop}</p>
                      <p className="text-[10px] text-slate-400">Origen: {trip.firstStop}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">Programado</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA SUR (LEBRIJA / CÁDIZ) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-indigo-600 pb-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>↙️</span> Dirección Sur / Lebrija
            </h2>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-1 rounded-lg">Línea C-1</span>
          </div>

          {proximoSur ? (
            <div className="bg-white border-2 border-indigo-500/30 rounded-2xl p-6 shadow-md bg-gradient-to-b from-indigo-50/20 to-white">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md">Próxima Salida Utrera</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> En servicio
                </span>
              </div>

              <div className="my-3">
                <div className="text-4xl font-black font-mono text-slate-900">{proximoSur.salidaUtrera}</div>
                <p className="text-sm font-semibold text-slate-600 mt-1">Destino: <span className="text-slate-900">{proximoSur.lastStop}</span></p>
              </div>

              <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 flex justify-between items-center mt-4">
                <span>Origen: {proximoSur.firstStop}</span>
                <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">ID: {proximoSur.trip_id}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border text-sm text-slate-500 text-center">No hay trenes programados en esta dirección.</div>
          )}

          {/* Listado Posteriores Sur */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Siguientes salidas ({posterioresSur.length})</h3>
            {posterioresSur.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 text-center">No hay más trayectos posteriores.</p>
            ) : (
              posterioresSur.map((trip, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 rounded-xl transition border-b border-slate-100 last:border-none">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-base text-slate-900">{trip.salidaUtrera}</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Destino: {trip.lastStop}</p>
                      <p className="text-[10px] text-slate-400">Origen: {trip.firstStop}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">Programado</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}