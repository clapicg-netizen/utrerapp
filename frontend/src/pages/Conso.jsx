import React, { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

export default function Conso() {
  const [mensaje, setMensaje] = useState('');
  const [chat, setChat] = useState([
    {
      origen: 'conso',
      texto: '¡Hola! Soy Conso, tu asistente de Utrera. 👋\nPregúntame por las farmacias de guardia o los horarios de Renfe.'
    }
  ]);

  const procesarRespuesta = (pregunta) => {
    const texto = pregunta.toLowerCase();

    if (texto.includes('farmacia') || texto.includes('guardia')) {
      return '💊 **FARMACIA DE GUARDIA HOY EN UTRERA**\n📅 *Viernes, 23 de octubre de 2026*\n\n**Farmacia Morales Guerrero, CB**\n📍 Dirección: Avda. Alcalde José Dorado, 5 - Bda. El Carmen\n📞 Teléfono: 954864924\n⏰ Horario: Noche (de 22:00 a 9:30) y turnos oficiales';
    }

    if (texto.includes('tren') || texto.includes('renfe') || texto.includes('horario')) {
      return '🚆 **CERCANÍAS LÍNEA C-1 (Utrera - Sevilla)**\n\n• Próximo tren hacia Sevilla Santa Justa: **12:42 h** (Directo - 25 min)\n• Siguiente tren: **13:10 h**\n\n*Recuerda consultar posibles retenciones en la estación central.*';
    }

    if (texto.includes('ayuntamiento') || texto.includes('alcalde')) {
      return '🏛️ **Ayuntamiento de Utrera**\n📍 Plaza de Gibaxa, 1\n📞 Teléfono: 955 86 45 00\nHorario de atención al ciudadano: 09:00 a 14:00 h.';
    }

    return `¡Entendido! Como asistente virtual de Utrerapp, sigo aprendiendo para ayudarte con la gestión local. Prueba a preguntarme por la **"farmacia de guardia"** o los **"trenes"**.`;
  };

  const enviarMensaje = (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;

    const textoUsuario = mensaje;
    const nuevoChat = [...chat, { origen: 'usuario', texto: textoUsuario }];
    setChat(nuevoChat);
    setMensaje('');

    setTimeout(() => {
      const respuestaConso = procesarRespuesta(textoUsuario);
      setChat((prev) => [...prev, { origen: 'conso', texto: respuestaConso }]);
    }, 500);
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

            <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm max-w-[80%] whitespace-pre-line ${
              msg.origen === 'usuario' 
                ? 'bg-rose-900 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              {msg.texto}
            </div>
          </div>
        ))}
      </div>

      {/* Barra de entrada de mensaje */}
      <div className="p-3 bg-white border-t border-slate-200 sticky bottom-0 z-10 max-w-md mx-auto w-full">
        <form onSubmit={enviarMensaje} className="flex gap-2">
          <input
            type="text"
            placeholder="Pregúntale a Conso (trenes, farmacias...)"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            className="flex-1 bg-slate-100 text-slate-900 placeholder-slate-400 px-4 py-3 rounded-2xl text-xs border border-slate-200 focus:outline-none focus:border-rose-900 transition-colors"
          />
          <button
            type="submit"
            className="bg-rose-900 text-white px-5 py-3 rounded-2xl text-xs font-bold hover:bg-rose-950 transition-colors shadow-md flex items-center gap-1.5"
          >
            <span>Enviar</span>
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}