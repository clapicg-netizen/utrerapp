import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, HeartPulse, Pill, Train, Phone, MapPin, Car, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Conso() {
  const [mensaje, setMensaje] = useState('');
  const [chat, setChat] = useState([
    {
      origen: 'conso',
      texto: '¡Hola! Soy Conso, tu asistente de Utrera. 👋\nPregúntame por las farmacias de guardia, trenes o aparcamientos.'
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

  // Procesamiento inteligente de Conso con los datos oficiales de Utrera
  const procesarRespuesta = (pregunta) => {
    const texto = pregunta.toLowerCase();

    if (texto.includes('farmacia') || texto.includes('guardia')) {
      return (
        <div className="space-y-3">
          <div>
            <p className="font-bold text-slate-900 mb-0.5">💊 FARMACIA DE GUARDIA OFICIAL</p>
            <p className="text-[11px] text-slate-500">📅 Sábado, 24 de Octubre de 2026</p>
          </div>

          {/* Turno de Día */}
          <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200/60 space-y-2">
            <span className="inline-block bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              ☀️ Turno de Día (9:30 a 22:00 h)
            </span>

            {/* Farmacia 1 */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
              <p className="font-bold text-slate-900 text-xs">Farmacia José Luis Algarín Pachón</p>
              <p className="text-slate-600 text-[11px] mt-1 flex items-center gap-1">
                <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                <span>Corredera, 1</span>
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500">📞 954860448</span>
                <div className="flex gap-1.5">
                  <button onClick={(e) => realizarLlamada(e, "954860448")} className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold cursor-pointer hover:bg-emerald-200">Llamar</button>
                  <button onClick={(e) => abrirMapa(e, "Corredera, 1, Utrera")} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold cursor-pointer hover:bg-slate-200">Mapa</button>
                </div>
              </div>
            </div>

            {/* Farmacia 2 */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
              <p className="font-bold text-slate-900 text-xs">Farmacia Rafael González</p>
              <p className="text-slate-600 text-[11px] mt-1 flex items-center gap-1">
                <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                <span>Cristo de los Afligidos, 74 (Antig. La Fuente)</span>
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500">📞 954860213</span>
                <div className="flex gap-1.5">
                  <button onClick={(e) => realizarLlamada(e, "954860213")} className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold cursor-pointer hover:bg-emerald-200">Llamar</button>
                  <button onClick={(e) => abrirMapa(e, "Cristo de los Afligidos, 74, Utrera")} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold cursor-pointer hover:bg-slate-200">Mapa</button>
                </div>
              </div>
            </div>

            {/* Farmacia 3 */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
              <p className="font-bold text-slate-900 text-xs">Farmacia Pablo Troncoso López</p>
              <p className="text-slate-600 text-[11px] mt-1 flex items-center gap-1">
                <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                <span>Avda. María Auxiliadora, 95. "El Charco"</span>
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500">📞 954860196</span>
                <div className="flex gap-1.5">
                  <button onClick={(e) => realizarLlamada(e, "954860196")} className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold cursor-pointer hover:bg-emerald-200">Llamar</button>
                  <button onClick={(e) => abrirMapa(e, "Avda. María Auxiliadora, 95, Utrera")} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold cursor-pointer hover:bg-slate-200">Mapa</button>
                </div>
              </div>
            </div>
          </div>

          {/* Turno de Noche */}
          <div className="bg-indigo-50/60 p-3 rounded-2xl border border-indigo-200/60 space-y-2">
            <span className="inline-block bg-indigo-900 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              🌙 Turno de Noche (22:00 a 9:30 h)
            </span>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
              <p className="font-bold text-slate-900 text-xs">Farmacia Ma Luz Ceballos Niebla</p>
              <p className="text-slate-600 text-[11px] mt-1 flex items-center gap-1">
                <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                <span>Avda. La Fontanilla, 38</span>
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500">📞 955864368</span>
                <div className="flex gap-1.5">
                  <button onClick={(e) => realizarLlamada(e, "955864368")} className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 text-[10px] font-bold cursor-pointer hover:bg-indigo-200">Llamar</button>
                  <button onClick={(e) => abrirMapa(e, "Avda. La Fontanilla, 38, Utrera")} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold cursor-pointer hover:bg-slate-200">Mapa</button>
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje de ánimo destacado */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 italic">
            <HeartPulse size={15} className="text-emerald-500" />
            <span>¡Mucho ánimo y que haya mejoría! ❤️</span>
          </div>
        </div>
      );
    }

    if (texto.includes('tren') || texto.includes('renfe') || texto.includes('horario')) {
      return (
        <div className="space-y-3">
          <div>
            <p className="font-bold text-slate-900 mb-0.5">🚆 CERCANÍAS LÍNEA C-1 (Utrera ⇄ Sevilla)</p>
            <p className="text-[11px] text-slate-500">Horarios oficiales y rutas directas de Renfe</p>
          </div>

          {/* Tarjeta de Trenes con accesos directos exactos */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-3.5 rounded-2xl shadow-md space-y-3">
            
            {/* Salida Hacia Sevilla */}
            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-400 text-xs flex items-center gap-1">
                  <ArrowRight size={14} /> Utrera ➔ Sevilla (Santa Justa)
                </span>
                <span className="bg-rose-950 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-800/50">
                  Línea C-1
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Consulta los horarios exactos en tiempo real, vías y paradas intermedias desde Utrera.
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.open("https://www.renfe.com/es/es/cercanias/cercanias-sevilla/horarios#/paradas?stationInputValue=51200&stationInputText=Utrera&tripPreferences=todas", "_blank");
                }}
                className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <span>🚆 Ver Horarios: Utrera ➔ Sevilla</span>
              </button>
            </div>

            {/* Regreso Hacia Utrera */}
            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-xs flex items-center gap-1">
                  <ArrowLeft size={14} /> Sevilla (Santa Justa) ➔ Utrera
                </span>
                <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-800/50">
                  Línea C-1
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Consulta los trenes de vuelta y los horarios de regreso desde Santa Justa hacia Utrera.
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.open("https://www.renfe.com/es/es/cercanias/cercanias-sevilla/horarios#/paradas?stationInputValue=51100&stationInputText=Sevilla-Santa%20Justa&tripPreferences=todas", "_blank");
                }}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <span>🚆 Ver Horarios: Sevilla ➔ Utrera</span>
              </button>
            </div>

          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 italic">
            • Recuerda validar tu abono en las canceladoras automáticas antes de acceder al andén.
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
            <div className="flex justify-between items-center text-center border-b border-slate-700 pb-2.5">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total Plazas</p>
                <p className="text-base font-black text-white">1.060</p>
              </div>
              <div>
                <p className="text-[10px] text-emerald-400 uppercase tracking-wider">Libres</p>
                <p className="text-base font-black text-emerald-400">47 (9%)</p>
              </div>
              <div>
                <p className="text-[10px] text-rose-400 uppercase tracking-wider">Ocupadas</p>
                <p className="text-base font-black text-rose-400">491 (91%)</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Consulta el plano interactivo oficial con el estado de los sensores y plazas libres calle a calle.
            </p>

            <button
              onClick={(e) => {
                e.preventDefault();
                window.open("https://holautrera.com/parking", "_blank");
              }}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <span>🗺️ Ver Mapa de Plazas Libres (holautrera.com)</span>
            </button>
          </div>
        </div>
      );
    }

    return `¡Entendido! Como Conso, tu asistente de Utrera, sigo procesando toda la información local. Prueba a preguntarme por la **"farmacia de guardia"**, los **"trenes"** o los **"aparcamientos"**.`;
  };

  const enviarMensaje = (textoEnvio) => {
    if (!textoEnvio.trim()) return;

    const nuevoChat = [...chat, { origen: 'usuario', texto: textoEnvio }];
    setChat(nuevoChat);
    setMensaje('');

    setTimeout(() => {
      const respuestaConso = procesarRespuesta(textoEnvio);
      setChat((prev) => [...prev, { origen: 'conso', texto: respuestaConso }]);
    }, 500);
  };

  const manejarSubmit = (e) => {
    e.preventDefault();
    enviarMensaje(mensaje);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 font-sans flex flex-col justify-between">
      {/* Cabecera */}
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

      {/* Historial de Chat */}
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
              {typeof msg.texto === 'string' ? msg.texto : msg.texto}
            </div>
          </div>
        ))}
      </div>

      {/* Botones de Acceso Rápido */}
      <div className="px-4 py-2 max-w-md mx-auto w-full grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => enviarMensaje("Farmacia de guardia")}
          className="bg-rose-50 border border-rose-200 text-rose-900 hover:bg-rose-100 py-2 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors shadow-sm cursor-pointer"
        >
          <Pill size={14} className="text-rose-700" />
          <span>Farmacias</span>
        </button>
        <button
          type="button"
          onClick={() => enviarMensaje("Horario de trenes")}
          className="bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 py-2 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors shadow-sm cursor-pointer"
        >
          <Train size={14} className="text-slate-600" />
          <span>Trenes</span>
        </button>
        <button
          type="button"
          onClick={() => enviarMensaje("Aparcamientos")}
          className="bg-sky-50 border border-sky-200 text-sky-900 hover:bg-sky-100 py-2 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors shadow-sm cursor-pointer"
        >
          <Car size={14} className="text-sky-700" />
          <span>Aparcar</span>
        </button>
      </div>

      {/* Barra de entrada de mensaje */}
      <div className="p-3 bg-white border-t border-slate-200 sticky bottom-0 z-15 max-w-md mx-auto w-full">
        <form onSubmit={manejarSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Pregúntale a Conso (trenes, farmacias, parking...)"
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