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

    if (texto.includes('farmacia') || texto.includes('guardia')) {
      try {
        const fechaStr = new Date().toISOString().split('T')[0];
        let { data: guardiasHoy, error } = await supabase
          .from('farmacias_calendario')
          .select('*')
          .eq('fecha', fechaStr);

        if (error) throw error;

        if (!guardiasHoy || guardiasHoy.length === 0) {
          const { data: fallback } = await supabase
            .from('farmacias_calendario')
            .select('*')
            .limit(5);
          guardiasHoy = fallback || [];
        }

        if (guardiasHoy.length === 0) {
          return "💊 No hay registros de farmacias disponibles en la base de datos en este momento.";
        }

        let resultadoTexto = `💊 FARMACIA DE GUARDIA OFICIAL\n📅 ${fechaHoyStr}\n\n`;
        guardiasHoy.forEach((f, idx) => {
          resultadoTexto += `${idx + 1}. *${f.nombre_farmacia}*\n📍 Dirección: ${f.direccion}\n📞 Teléfono: ${f.telefono}\n🕒 Horario: ${f.horario || 'Oficial 24h'}\n\n`;
        });
        return resultadoTexto;
      } catch (err) {
        console.error("Error consultando farmacias en Conso:", err);
        return "Lo siento, ha ocurrido un error al consultar las farmacias de guardia.";
      }
    }

    if (texto.includes('tren') || texto.includes('renfe') || texto.includes('horario')) {
      return "🚆 CERCANÍAS LÍNEA C-1 (Utrera ⇄ Sevilla)\nPuedes consultar los horarios oficiales actualizados en la web de Renfe Cercanías Sevilla.";
    }

    if (texto.includes('aparcamiento') || texto.includes('parking') || texto.includes('aparcar')) {
      return "🅿️ APARCAMIENTOS EN UTRERA\nPuedes consultar el mapa de plazas libres en tiempo real en holautrera.com/parking";
    }

    try {
      const respuestaIA = await consultarConsoIA(pregunta);
      return respuestaIA;
    } catch (err) {
      return "Disculpa, ahora mismo tengo problemas de conexión con el servidor de inteligencia artificial.";
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