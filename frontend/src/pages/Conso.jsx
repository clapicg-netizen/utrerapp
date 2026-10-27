// src/pages/Conso.jsx
import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, HeartPulse, Pill, Train, Phone, MapPin, Car, ArrowRight, ArrowLeft } from 'lucide-react';
import { consultarConsoIA } from '../lib/consoService';
import { supabase } from '../lib/supabaseClient';

export default function Conso() {
  const [mensaje, setMensaje] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);
  
  const fechaHoyStr = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const [chat, setChat] = useState([
    {
      origen: 'conso',
      texto: `¡Hola! Soy Conso, tu asistente virtual de Utrera. 👋\nPuedes preguntarme por las farmacias de guardia de hoy, el tiempo, trenes, aparcamientos o cualquier duda sobre nuestra ciudad.`
    }
  ]);

  const abrirMapa = (e, direccion) => {
    e.preventDefault();
    window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(direccion), "_blank");
  };

  const realizarLlamada = (e, telefono) => {
    e.preventDefault();
    window.location.href = "tel:" + telefono;
  };

  const procesarRespuesta = async (pregunta) => {
    const texto = pregunta.toLowerCase();

    // Consultas rápidas locales estructuradas consultando Supabase en tiempo real
    if (texto.includes('farmacia') || texto.includes('guardia')) {
      try {
        const fechaStr = new Date().toISOString().split('T')[0];
        const { data: guardiasHoy, error } = await supabase
          .from('farmacias_calendario')
          .select('*')
          .eq('fecha', fechaStr);

        if (error) throw error;

        if (!guardiasHoy || guardiasHoy.length === 0) {
          return (
            <div className="space-y-2">
              <p className="font-bold text-slate-900">💊 FARMACIA DE GUARDIA OFICIAL</p>
              <p className="text-xs text-slate-500">No hay registros introducidos en Supabase para la fecha de hoy ({fechaStr}).</p>
            </div>
          );
        }

        const farmaciasDia = guardiasHoy.filter(f => !f.turno || f.turno.toLowerCase() === 'día' || f.turno.toLowerCase() === 'dia');
        const farmaciasNoche = guardiasHoy.filter(f => f.turno && f.turno.toLowerCase() === 'noche');

        return (
          <div className="space-y-3">
            <div>
              <p className="font-bold text-slate-900 mb-0.5">💊 FARMACIA DE GUARDIA OFICIAL</p>
              <p className="text-[11px] text-slate-500 capitalize">📅 {fechaHoyStr}</p>
            </div>

            {/* TURNO DE DÍA */}
            {farmaciasDia.length > 0 && (
              <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200/60 space-y-2">
                <span className="inline-block bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ☀️ Turno de Día (9:30 a 22:00 h)
                </span>
                {farmaciasDia.map((f, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                    <p className="font-bold text-slate-900 text-xs">{f.nombre_farmacia}</p>
                    {f.boticario && <p className="text-[10px] text-slate-500">Titular: {f.boticario}</p>}
                    <p className="text-slate-600 text-[11px] flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                      <span>{f.direccion}</span>
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500">📞 {f.telefono}</span>
                      <div className="flex gap-1.5">
                        <button onClick={(e) => realizarLlamada(e, f.telefono)} className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold cursor-pointer">Llamar</button>
                        <button onClick={(e) => abrirMapa(e, f.direccion)} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold cursor-pointer">Mapa</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TURNO DE NOCHE */}
            {farmaciasNoche.length > 0 && (
              <div className="bg-indigo-50/60 p-3 rounded-2xl border border-indigo-200/60 space-y-2">
                <span className="inline-block bg-indigo-900 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  🌙 Turno de Noche (22:00 a 9:30 h)
                </span>
                {farmaciasNoche.map((f, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                    <p className="font-bold text-slate-900 text-xs">{f.nombre_farmacia}</p>
                    {f.boticario && <p className="text-[10px] text-slate-500">Titular: {f.boticario}</p>}
                    <p className="text-slate-600 text-[11px] flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                      <span>{f.direccion}</span>
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500">📞 {f.telefono}</span>
                      <div className="flex gap-1.5">
                        <button onClick={(e) => realizarLlamada(e, f.telefono)} className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 text-[10px] font-bold cursor-pointer">Llamar</button>
                        <button onClick={(e) => abrirMapa(e, f.direccion)} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold cursor-pointer">Mapa</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 italic">
              <HeartPulse size={15} className="text-emerald-500" />
              <span>¡Mucho ánimo y que haya mejoría! ❤️</span>
            </div>
          </div>
        );
      } catch (err) {
        console.error("Error consultando farmacias en Conso:", err);
        return "Lo siento, ha ocurrido un error al consultar las farmacias de guardia en la base de datos.";
      }
    }

    if (texto.includes('tren') || texto.includes('renfe') || texto.includes('horario')) {
      return (
        <div className="space-y-3">
          <div>
            <p className="font-bold text-slate-900 mb-0.5">🚆 CERCANÍAS LÍNEA C-1 (Utrera ⇄ Sevilla)</p>
            <p className="text-[11px] text-slate-500">Horarios oficiales de Renfe</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-3.5 rounded-2xl shadow-md space-y-3">
            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-400 text-xs flex items-center gap-1">
                  <ArrowRight size={14} /> Utrera ➔ Sevilla (Santa Justa)
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.open("https://www.renfe.com/es/es/cercanias/cercanias-sevilla/horarios#/paradas?stationInputValue=51200&stationInputText=Utrera&tripPreferences=todas", "_blank");
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>🚆 Ver Horarios: Utrera ➔ Sevilla</span>
              </button>
            </div>

            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-xs flex items-center gap-1">
                  <ArrowLeft size={14} /> Sevilla (Santa Justa) ➔ Utrera
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.open("https://www.renfe.com/es/es/cercanias/cercanias-sevilla/horarios#/paradas?stationInputValue=51100&stationInputText=Sevilla-Santa%20Justa&tripPreferences=todas", "_blank");
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>🚆 Ver Horarios: Sevilla ➔ Utrera</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (texto.includes('aparcamiento') || texto.includes('parking') || texto.includes('aparcar')) {
      return (
        <div className="space-y-3">
          <div>
            <p className="font-bold text-slate-900 mb-0.5">🅿️ APARCAMIENTOS EN TIEMPO REAL</p>
            <p className="text-[11px] text-slate-500">Red de sensores inteligentes de Utrera</p>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-3.5 rounded-2xl shadow-md space-y-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                window.open("https://holautrera.com/parking", "_blank");
              }}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>🗺️ Ver Mapa de Plazas Libres (holautrera.com)</span>
            </button>
          </div>
        </div>
      );
    }

    // Para cualquier otra consulta, tira de la IA real
    try {
      const respuestaIA = await consultarConsoIA(pregunta);
      return respuestaIA;
    } catch (err) {
      return "Disculpa, ahora mismo tengo problemas de conexión con el servidor de inteligencia artificial. Pero puedes consultarme por las farmacias de guardia o los trenes.";
    }
  };

  const enviarMensaje = async (textoEnvio) => {
    if (!textoEnvio.trim()) return;

    const nuevoChat = [...chat, { origen: 'usuario', texto: textoEnvio }];
    setChat(nuevoChat);
    setMensaje('');
    setCargandoIA(true);

    const respuestaConso = await procesarRespuesta(textoEnvio);
    setChat((prev) => [...prev, { origen: 'conso', texto: respuestaConso }]);
    setCargandoIA(false);
  };

  const manejarSubmit = (e) => {
    e.preventDefault();
    enviarMensaje(mensaje);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 font-sans flex flex-col justify-between">
      <div className="bg-gradient-to-r from-rose-950 to-red-900 text-white p-5 shadow-lg">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Bot size={22} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold">Conso IA</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-rose-200">Asistente Oficial de Utrera</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 max-w-md mx-auto w-full space-y-3 overflow-y-auto">
        {chat.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-2.5 ${msg.origen === 'usuario' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs shadow-sm ${
              msg.origen === 'usuario' ? 'bg-rose-900 text-white' : 'bg-amber-500 text-slate-950 font-bold'
            }`}>
              {msg.origen === 'usuario' ? <User size={16} /> : <Sparkles size={16} />}
            </div>

            <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm max-w-[85%] whitespace-pre-line ${
              msg.origen === 'usuario' 
                ? 'bg-rose-900 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              {msg.texto}
            </div>
          </div>
        ))}

        {cargandoIA && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2">
            <Sparkles size={14} className="animate-spin text-amber-500" />
            <span>Conso está pensando su respuesta...</span>
          </div>
        )}
      </div>

      <div className="px-4 py-2 max-w-md mx-auto w-full grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => enviarMensaje("Farmacia de guardia")}
          className="bg-rose-50 border border-rose-200 text-rose-900 hover:bg-rose-100 py-2 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <Pill size={14} className="text-rose-700" />
          <span>Farmacias</span>
        </button>
        <button
          type="button"
          onClick={() => enviarMensaje("Horario de trenes")}
          className="bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 py-2 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <Train size={14} className="text-slate-600" />
          <span>Trenes</span>
        </button>
        <button
          type="button"
          onClick={() => enviarMensaje("Aparcamientos")}
          className="bg-sky-50 border border-sky-200 text-sky-900 hover:bg-sky-100 py-2 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <Car size={14} className="text-sky-700" />
          <span>Aparcar</span>
        </button>
      </div>

      <div className="p-3 bg-white border-t border-slate-200 sticky bottom-0 z-15 max-w-md mx-auto w-full">
        <form onSubmit={manejarSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Pregúntale a Conso sobre Utrera, el tiempo, trenes..."
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            className="flex-1 bg-slate-100 text-slate-900 placeholder-slate-400 px-4 py-3 rounded-2xl text-xs border border-slate-200 focus:outline-none focus:border-rose-900 transition-colors"
          />
          <button
            type="submit"
            className="bg-rose-900 text-white px-5 py-3 rounded-2xl text-xs font-bold hover:bg-rose-950 transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>Enviar</span>
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}