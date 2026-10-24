import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, HeartPulse, Pill, Train, Phone, MapPin } from 'lucide-react';

export default function Conso() {
  const [mensaje, setMensaje] = useState('');
  const [chat, setChat] = useState([
    {
      origen: 'conso',
      texto: '¡Hola! Soy Conso, tu asistente de Utrera. 👋\nPregúntame por las farmacias de guardia o los horarios de Renfe.'
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
        <div>
          <p className="font-bold text-slate-900 mb-1">🚆 CERCANÍAS LÍNEA C-1 (Utrera - Sevilla)</p>
          <p className="text-[11px] text-slate-500 mb-2">📅 Horarios Oficiales Actualizados</p>
          
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
            <p>• Dirección Lora del Río: <span className="font-bold text-slate-900">Vía 1 (16:07 h)</span></p>
            <p>• Dirección Sevilla-Santa Justa: <span className="font-bold text-slate-900">Vía 3 (16:25 h)</span></p>
            <p>• Frecuencia habitual: Cada 30 min</p>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 italic">
            • Recuerda validar tu abono en canceladoras antes de acceder al andén.
          </div>
        </div>
      );
    }

    return `¡Entendido! Como Conso, tu asistente de Utrera, sigo procesando toda la información local. Prueba a preguntarme por la **"farmacia de guardia"** o los **"trenes"**.`;
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
      <div className="px-4 py-2 max-w-md mx-auto w-full flex gap-2">
        <button
          type="button"
          onClick={() => enviarMensaje("Farmacia de guardia")}
          className="flex-1 bg-rose-50 border border-rose-200 text-rose-900 hover:bg-rose-100 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
        >
          <Pill size={14} className="text-rose-700" />
          <span>Farmacia de Guardia</span>
        </button>
        <button
          type="button"
          onClick={() => enviarMensaje("Horario de trenes")}
          className="flex-1 bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
        >
          <Train size={14} className="text-slate-600" />
          <span>Horario de Trenes</span>
        </button>
      </div>

      {/* Barra de entrada de mensaje */}
      <div className="p-3 bg-white border-t border-slate-200 sticky bottom-0 z-15 max-w-md mx-auto w-full">
        <form onSubmit={manejarSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Pregúntale a Conso (trenes, farmacias...)"
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