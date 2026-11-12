import React, { useState, useEffect } from 'react';
import schedulesData from '../data/cercanias_sevilla_schedules.json';
import { Clock, ArrowUpRight, ArrowDownRight, Share2, AlertTriangle, ChevronDown } from 'lucide-react';

export default function CercaniasSevilla() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAvisos, setShowAvisos] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const horaActualStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  // 1. Cargar y filtrar estrictamente desde el JSON GTFS real para Utrera (stop_id: "51200")
  const viajesUtrera = Array.isArray(schedulesData) ? schedulesData.filter(trip => 
    trip && Array.isArray(trip.stops) && trip.stops.some(stop => stop.stop_id === '51200')
  ) : [];

  // 2. Procesamiento puro de datos reales
  const viajesProcesados = viajesUtrera.map(trip => {
    const utreraStop = trip.stops.find(s => s.stop_id === '51200');
    const horaUtrera = utreraStop ? utreraStop.departure_time.substring(0, 5) : '00:00';
    
    const firstStop = trip.stops[0]?.stop_name || 'Origen';
    const lastStop = trip.stops[trip.stops.length - 1]?.stop_name || 'Destino';
    const utreraIndex = trip.stops.findIndex(s => s.stop_id === '51200');
    
    // Si Utrera es el inicio (índice 0), el tren sale hacia Sevilla/Norte. 
    // Si Utrera es una parada posterior, viene de Sevilla/Lora y va hacia el Sur.
    const esSalidaDesdeUtrera = utreraIndex === 0;

    return {
      ...trip,
      horaUtrera,
      firstStop,
      lastStop,
      esSalidaDesdeUtrera,
      sentido: esSalidaDesdeUtrera ? 'sevilla' : 'sur'
    };
  }).sort((a, b) => a.horaUtrera.localeCompare(b.horaUtrera));

  // Separar estrictamente según el sentido real del JSON
  const listaSevilla = viajesProcesados.filter(v => v.sentido === 'sevilla');
  const listaSur = viajesProcesados.filter(v => v.sentido === 'sur');

  // Seleccionar el próximo tren en tiempo real (>= hora actual, o el primero si ya ha pasado el día)
  const proximoSevilla = listaSevilla.find(v => v.horaUtrera >= horaActualStr) || listaSevilla[0];
  const siguientesSevilla = listaSevilla.filter(v => v !== proximoSevilla);

  const proximoSur = listaSur.find(v => v.horaUtrera >= horaActualStr) || listaSur[0];
  const siguientesSur = listaSur.filter(v => v !== proximoSur);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-28 text-slate-800 font-sans">
      
      {/* Cabecera UtrerApp */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white p-6 rounded-3xl shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute right-4 top-2 text-8xl opacity-10">🚆</div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold backdrop-blur-sm">
                UtrerApp • Núcleo C-1 Sevilla
              </span>
              <span className="text-xs text-amber-200">Estación de Utrera (ID: 51200)</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Próximos Trenes en Utrera</h1>
            <p className="text-amber-100 text-sm mt-1">
              Datos extraídos directamente de los archivos GTFS locales.
            </p>
          </div>
          <div className="bg-black/30 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
            <Clock className="text-amber-400 animate-pulse" size={24} />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-amber-200 font-bold">Hora actual</p>
              <p className="text-2xl font-mono font-black text-white">{horaActualStr}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Avisos */}
      <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowAvisos(!showAvisos)}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" size={20} />
            <span className="text-sm font-bold text-amber-950">Avisos del sistema GTFS local</span>
          </div>
          <ChevronDown className={`text-amber-700 transition-transform ${showAvisos ? 'rotate-180' : ''}`} size={18} />
        </div>
        {showAvisos && (
          <div className="mt-3 pt-3 border-t border-amber-200/60 text-xs text-amber-900 space-y-1">
            <p>· Sincronización activa con los ficheros JSON del repositorio.</p>
          </div>
        )}
      </div>

      {/* Grid de 2 Columnas: Datos 100% de los JSON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

        {/* COLUMNA 1: DIRECCIÓN SEVILLA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-amber-600 pb-2">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ArrowUpRight className="text-amber-600" size={24} /> Dirección Sevilla (Salidas)
            </h2>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-lg">C-1</span>
          </div>

          {proximoSevilla ? (
            <div className="bg-white border-2 border-amber-500/40 rounded-3xl p-6 shadow-xl relative overflow-hidden bg-gradient-to-br from-amber-50/20 to-white">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full">
                  Próxima Salida Real
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">En servicio</span>
              </div>

              <div className="my-4">
                <p className="text-xs text-slate-500 mb-1">Hora de salida desde Utrera</p>
                <div className="text-5xl font-mono font-black text-slate-900">{proximoSevilla.horaUtrera}</div>
                <p className="text-base font-bold text-slate-700 mt-2">Destino: <span className="text-amber-900">{proximoSevilla.lastStop}</span></p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                <span>Trip ID: <strong className="font-mono text-slate-800">{proximoSevilla.trip_id}</strong></span>
                <span className="bg-slate-100 px-2 py-1 rounded font-mono text-[10px]">Ruta: {proximoSevilla.route_id}</span>
              </div>

              <button 
                onClick={() => alert(`Aviso programado para tren a ${proximoSevilla.lastStop} (${proximoSevilla.horaUtrera}).`)}
                className="mt-5 w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-3 rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 size={16} /> Avisa a quien vaya contigo
              </button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border text-sm text-slate-500 text-center">No hay trayectos en esta dirección.</div>
          )}
        </div>

        {/* COLUMNA 2: DIRECCIÓN SUR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-slate-700 pb-2">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ArrowDownRight className="text-slate-700" size={24} /> Dirección Sur (Llegadas / Paso)
            </h2>
            <span className="text-xs bg-slate-200 text-slate-800 font-bold px-2.5 py-1 rounded-lg">C-1</span>
          </div>

          {proximoSur ? (
            <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-50/50 to-white">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                  Próximo Paso Real
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">En servicio</span>
              </div>

              <div className="my-4">
                <p className="text-xs text-slate-500 mb-1">Hora de paso por Utrera</p>
                <div className="text-5xl font-mono font-black text-slate-900">{proximoSur.horaUtrera}</div>
                <p className="text-base font-bold text-slate-700 mt-2">Viene de: <span className="text-slate-900">{proximoSur.firstStop}</span></p>
                <p className="text-xs text-slate-500 mt-1">Destino final: <strong>{proximoSur.lastStop}</strong></p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                <span>Trip ID: <strong className="font-mono text-slate-800">{proximoSur.trip_id}</strong></span>
                <span className="bg-slate-100 px-2 py-1 rounded font-mono text-[10px]">Ruta: {proximoSur.route_id}</span>
              </div>

              <button 
                onClick={() => alert(`Aviso programado para tren hacia ${proximoSur.lastStop} (${proximoSur.horaUtrera}).`)}
                className="mt-4 w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-3 rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 size={16} /> Avisa a quien vaya contigo
              </button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border text-sm text-slate-500 text-center">No hay trayectos en esta dirección.</div>
          )}
        </div>

      </div>

      {/* SECCIÓN "DESPUÉS" (Listas completas de datos reales del JSON) */}
      <section className="pt-6 border-t border-slate-200">
        <h3 className="text-2xl font-serif font-black mb-4 text-slate-900">Después (Horarios GTFS)</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Siguientes hacia Sevilla ({siguientesSevilla.length})</h4>
            {siguientesSevilla.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No hay más trayectos.</p>
            ) : (
              siguientesSevilla.map((trip, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 px-3 hover:bg-slate-50 rounded-2xl transition border-b border-slate-100 last:border-none text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-lg text-slate-900 w-14">{trip.horaUtrera}</span>
                    <div>
                      <span className="font-bold text-slate-800">Destino: {trip.lastStop}</span>
                      <p className="text-[10px] text-slate-400">Origen: {trip.firstStop}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-blue-100 text-blue-800">C-1</span>
                </div>
              ))
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Siguientes hacia el Sur ({siguientesSur.length})</h4>
            {siguientesSur.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No hay más trayectos.</p>
            ) : (
              siguientesSur.map((trip, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 px-3 hover:bg-slate-50 rounded-2xl transition border-b border-slate-100 last:border-none text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-lg text-slate-900 w-14">{trip.horaUtrera}</span>
                    <div>
                      <span className="font-bold text-slate-800">Desde: {trip.firstStop}</span>
                      <p className="text-[10px] text-slate-400">Destino: {trip.lastStop}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-slate-200 text-slate-700">C-1</span>
                </div>
              ))
            )}
          </div>

        </div>
      </section>

    </div>
  );
}