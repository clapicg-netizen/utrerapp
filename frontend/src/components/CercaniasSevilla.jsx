import React, { useState, useEffect } from 'react';
import schedulesData from '../data/cercanias_sevilla_schedules.json';

export default function CercaniasSevilla() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar reloj cada minuto para calcular en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const horaActualStr = currentTime.toTimeString().substring(0, 5); // "HH:MM"

  // Filtrar todos los trayectos que pasan por Utrera (stop_id: "51200")
  const viajesUtrera = Array.isArray(schedulesData) ? schedulesData.filter(trip => 
    trip && Array.isArray(trip.stops) && trip.stops.some(stop => stop.stop_id === '51200')
  ) : [];

  // Enriquecer cada viaje con la hora exacta de salida de Utrera y su sentido
  const viajesProcesados = viajesUtrera.map(trip => {
    const utreraStop = trip.stops.find(s => s.stop_id === '51200');
    const salidaUtrera = utreraStop ? utreraStop.departure_time.substring(0, 5) : '00:00';
    const firstStop = trip.stops[0]?.stop_name || '';
    const lastStop = trip.stops[trip.stops.length - 1]?.stop_name || '';

    // Sentido Sevilla si el destino final o ruta tira hacia Sevilla/Lora/Rosales
    const vaHaciaSevilla = lastStop.includes('Sevilla') || lastStop.includes('Lora') || lastStop.includes('Rosales') || lastStop.includes('Cazalla');

    return {
      ...trip,
      salidaUtrera,
      firstStop,
      lastStop,
      sentido: vaHaciaSevilla ? 'sevilla' : 'sur'
    };
  }).sort((a, b) => a.salidaUtrera.localeCompare(b.salidaUtrera));

  // Separar sentidos
  const haciaSevilla = viajesProcesados.filter(v => v.sentido === 'sevilla');
  const haciaSur = viajesProcesados.filter(v => v.sentido === 'sur');

  // Encontrar el tren más cercano a la hora actual para cada sentido
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
            Hora actual de referencia: <strong className="text-amber-300 font-mono text-base">{horaActualStr}</strong> (Cálculo directo sobre base GTFS oficial)
          </p>
        </div>
      </div>

      {/* Grid de 2 Columnas: Sentido Sevilla vs Sentido Sur (Lebrija/Cádiz) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* COLUMNA SEVILLA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-blue-600 pb-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>↗️</span> Dirección Sevilla / Santa Justa
            </h2>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-lg">Línea C-1</span>
          </div>

          {proximoSevilla ? (
            <div className="bg-white border-2 border-blue-500/30 rounded-2xl p-6 shadow-md hover:shadow-lg transition bg-gradient-to-b from-blue-50/20 to-white">
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
                <span>Origen ruta: {proximoSevilla.firstStop}</span>
                <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">ID: {proximoSevilla.trip_id}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border text-sm text-slate-500 text-center">No hay más trenes programados hoy en esta dirección.</div>
          )}

          {/* Listado Posteriores Sevilla */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Siguientes salidas hacia Sevilla</h3>
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
              <span>↙️</span> Dirección Lebrija / Cádiz
            </h2>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-1 rounded-lg">Línea C-1</span>
          </div>

          {proximoSur ? (
            <div className="bg-white border-2 border-indigo-500/30 rounded-2xl p-6 shadow-md hover:shadow-lg transition bg-gradient-to-b from-indigo-50/20 to-white">
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
                <span>Origen ruta: {proximoSur.firstStop}</span>
                <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">ID: {proximoSur.trip_id}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border text-sm text-slate-500 text-center">No hay más trenes programados hoy en esta dirección.</div>
          )}

          {/* Listado Posteriores Sur */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Siguientes salidas hacia el Sur</h3>
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

      {/* Nota de Auditoría de UtrerApp */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-center gap-3 shadow-sm">
        <span className="text-xl">💡</span>
        <div>
          <strong className="font-bold">Módulo exclusivo UtrerApp:</strong> Los datos se calculan de manera autónoma y en tiempo real a partir del repositorio GTFS local, ofreciendo una experiencia limpia, rápida y sin depender de plataformas externas.
        </div>
      </div>

    </div>
  );
}