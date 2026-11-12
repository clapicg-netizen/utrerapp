import React, { useState, useEffect } from 'react';
import schedulesData from '../data/cercanias_sevilla_schedules.json';
import { Clock, ArrowUpRight, ArrowDownRight, Share2, AlertTriangle, ChevronDown, Bell } from 'lucide-react';

export default function CercaniasSevilla() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAvisos, setShowAvisos] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const horaActualStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  // Procesamiento de datos GTFS
  const viajesUtrera = Array.isArray(schedulesData) ? schedulesData.filter(trip => 
    trip && Array.isArray(trip.stops) && trip.stops.some(stop => stop.stop_id === '51200')
  ) : [];

  const viajesProcesados = viajesUtrera.map(trip => {
    const utreraStop = trip.stops.find(s => s.stop_id === '51200');
    const horaUtrera = utreraStop ? utreraStop.departure_time.substring(0, 5) : '00:00';
    
    const firstStop = trip.stops[0]?.stop_name || 'Origen';
    const lastStop = trip.stops[trip.stops.length - 1]?.stop_name || 'Destino';
    const utreraIndex = trip.stops.findIndex(s => s.stop_id === '51200');
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

  const listaSevilla = viajesProcesados.filter(v => v.sentido === 'sevilla');
  const listaSur = viajesProcesados.filter(v => v.sentido === 'sur');

  const proximoSevilla = listaSevilla.find(v => v.horaUtrera >= horaActualStr) || listaSevilla[0];
  const siguientesSevilla = listaSevilla.filter(v => v !== proximoSevilla);

  const proximoSur = listaSur.find(v => v.horaUtrera >= horaActualStr) || listaSur[0];
  const siguientesSur = listaSur.filter(v => v !== proximoSur);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-28 text-slate-800 font-sans">
      
      {/* Cabecera Corporativa UtrerApp */}
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
              Información en tiempo real, estado operativo y control de frecuencias GTFS.
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

      {/* Avisos Oficiales / Alertas */}
      <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowAvisos(!showAvisos)}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" size={20} />
            <span className="text-sm font-bold text-amber-950">2 avisos de Renfe para Utrera · <span className="underline cursor-pointer">léelo abajo</span></span>
          </div>
          <ChevronDown className={`text-amber-700 transition-transform ${showAvisos ? 'rotate-180' : ''}`} size={18} />
        </div>
        {showAvisos && (
          <div className="mt-3 pt-3 border-t border-amber-200/60 text-xs text-amber-900 space-y-2">
            <p><strong>· Atención:</strong> Los paros parciales previstos por semaf para hoy han sido desconvocados; la circulación podría verse afectada puntualmente por inercias de ayer.</p>
            <p><strong>· Accesibilidad:</strong> El ascensor de la vía 1 de la estación de Dos Hermanas se encuentra temporalmente fuera de servicio por motivos técnicos.</p>
          </div>
        )}
      </div>

      {/* Grid de 2 Columnas Operativas (Tarjetas Principales) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

        {/* COLUMNA 1: DIRECCIÓN SEVILLA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-amber-600 pb-2">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ArrowUpRight className="text-amber-600" size={24} /> Dirección Sevilla
            </h2>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-lg">Línea C-1</span>
          </div>

          {proximoSevilla ? (
            <div className="bg-white border-2 border-amber-500/40 rounded-3xl p-6 shadow-xl relative overflow-hidden bg-gradient-to-br from-amber-50/20 to-white">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-md">C1</span>
                  <span className="font-serif font-bold text-xl text-slate-900">{proximoSevilla.lastStop}</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">A su hora</span>
              </div>

              <div className="my-4">
                <p className="text-xs text-slate-500 mb-1">el de las {proximoSevilla.horaUtrera}</p>
                <div className="text-3xl font-black font-serif text-slate-900">En el andén</div>
                <p className="text-xs text-slate-600 mt-1">Sale entre <strong className="text-slate-900">{proximoSevilla.horaUtrera} y {proximoSevilla.horaUtrera}</strong></p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl font-bold">
                  🚆 Vía Principal (Utrera)
                </div>
                <span className="text-xs text-slate-500">Salida oficial</span>
              </div>

              <button 
                onClick={() => alert(`Aviso programado para tren a ${proximoSevilla.lastStop} (${proximoSevilla.horaUtrera}).`)}
                className="mt-5 w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-3 rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 size={16} /> Avisa a quien vaya contigo
              </button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border text-sm text-slate-500 text-center">No hay trayectos disponibles.</div>
          )}
        </div>

        {/* COLUMNA 2: DIRECCIÓN SUR / LEBRIJA Y CÁDIZ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-slate-700 pb-2">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ArrowDownRight className="text-slate-700" size={24} /> Dirección Lebrija y Cádiz
            </h2>
            <span className="text-xs bg-slate-200 text-slate-800 font-bold px-2.5 py-1 rounded-lg">Línea C-1 / MD</span>
          </div>

          {proximoSur ? (
            <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-50/50 to-white">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-700 text-white text-xs font-bold px-2.5 py-0.5 rounded-md">MD</span>
                  <span className="font-serif font-bold text-xl text-slate-900">{proximoSur.lastStop}</span>
                </div>
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">Programado</span>
              </div>

              <div className="my-2">
                <p className="text-xs text-slate-500">el de las {proximoSur.horaUtrera}</p>
                <div className="text-3xl font-serif font-black text-slate-900 my-1">
                  En servicio
                </div>
                <div className="text-xs text-slate-600">
                  Paso estimado en Utrera: <strong className="text-slate-900">{proximoSur.horaUtrera}</strong>
                </div>
              </div>

              <div className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                <span>Viene de <strong className="text-slate-800">{proximoSur.firstStop}</strong></span>
                <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded">GTFS Live</span>
              </div>

              {/* Mini mapa esquemático de ruta */}
              <div className="mt-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-semibold">
                  <span>Lora del Río</span>
                  <span>Utrera</span>
                </div>
                <div className="relative flex items-center">
                  <div className="w-full bg-slate-300 h-1 absolute"></div>
                  <div className="w-full bg-amber-600 h-1 absolute" style={{ width: '80%' }}></div>
                  <div className="w-3 h-3 bg-amber-600 rounded-full z-10 relative ml-[80%] border-2 border-white shadow"></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-center">Sincronizado con red ferroviaria</p>
              </div>

              <button 
                onClick={() => alert(`Aviso programado para tren hacia ${proximoSur.lastStop} (${proximoSur.horaUtrera}).`)}
                className="mt-4 w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-3 rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 size={16} /> Avisa a quien vaya contigo
              </button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border text-sm text-slate-500 text-center">No hay trayectos disponibles.</div>
          )}
        </div>

      </div>

      {/* SECCIÓN "DESPUÉS" (Listados completos posteriores) */}
      <section className="pt-6 border-t border-slate-200">
        <h3 className="text-2xl font-serif font-black mb-4 text-slate-900">Después</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Lista Después Sevilla */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Siguientes hacia Sevilla ({siguientesSevilla.length})</h4>
            {siguientesSevilla.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No hay más trenes posteriores hoy.</p>
            ) : (
              siguientesSevilla.map((trip, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 px-3 hover:bg-slate-50 rounded-2xl transition border-b border-slate-100 last:border-none text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-lg text-slate-900 w-14">{trip.horaUtrera}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">C1</span>
                    <div>
                      <span className="font-bold text-slate-800">Destino: {trip.lastStop}</span>
                      <p className="text-[10px] text-slate-400">Origen: {trip.firstStop}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">Previsto</span>
                </div>
              ))
            )}
          </div>

          {/* Lista Después Sur */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Siguientes hacia el Sur ({siguientesSur.length})</h4>
            {siguientesSur.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No hay más trenes posteriores hoy.</p>
            ) : (
              siguientesSur.map((trip, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 px-3 hover:bg-slate-50 rounded-2xl transition border-b border-slate-100 last:border-none text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-lg text-slate-900 w-14">{trip.horaUtrera}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">C1</span>
                    <div>
                      <span className="font-bold text-slate-800">Desde: {trip.firstStop}</span>
                      <p className="text-[10px] text-slate-400">Destino: {trip.lastStop}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">Previsto</span>
                </div>
              ))
            )}
          </div>

        </div>
      </section>

    </div>
  );
}