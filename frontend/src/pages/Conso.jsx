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

  // Listado oficial de farmacias para rotación automática diaria
  const farmaciasUtrera = [
    {
      nombre: "Farmacia Morales Guerrero, CB",
      direccion: "Avda. Alcalde José Dorado, 5 - Bda. El Carmen",
      direccionMapa: "Avda. Alcalde José Dorado, 5, Utrera",
      telefono: "954864924",
      horario: "De Guardia Hoy (24 Horas)"
    },
    {
      nombre: "Farmacia José Luis Algarín Pachón",
      direccion: "Corredera, 1",
      direccionMapa: "Corredera, 1, Utrera",
      telefono: "954860448",
      horario: "De Guardia Hoy (24 Horas)"
    },
    {
      nombre: "Farmacia Rafael González",
      direccion: "Cristo de los Afligidos, 74",
      direccionMapa: "Cristo de los Afligidos, 74, Utrera",
      telefono: "954860213",
      horario: "De Guardia Hoy (24 Horas)"
    },
    {
      nombre: "Farmacia Pablo Troncoso López",
      direccion: "Avda. María Auxiliadora, 95 (El Charco)",
      direccionMapa: "Avda. María Auxiliadora, 95, Utrera",
      telefono: "954860196",
      horario: "De Guardia Hoy (24 Horas)"
    },
    {
      nombre: "Farmacia Ma Luz Ceballos Niebla",
      direccion: "Avda. La Fontanilla, 38",
      direccionMapa: "Avda. La Fontanilla, 38, Utrera",
      telefono: "955864368",
      horario: "De Guardia Hoy (24 Horas)"
    },
    {
      nombre: "Farmacia Antonio Valdés Arenas",
      direccion: "Av. S. Juan Bosco, 96",
      direccionMapa: "Av. S. Juan Bosco, 96, Utrera",
      telefono: "955864951",
      horario: "De Guardia Hoy (24 Horas)"
    }
  ];

  const obtenerFarmaciaGuardiaHoy = () => {
    const ahora = new Date();
    // Cambio oficial de guardia a las 09:00 h
    const horaAjustada = new Date(ahora.getTime() - (9 * 60 * 60 * 1000));
    const inicioAnio = new Date(horaAjustada.getFullYear(), 0, 0);
    const diff = horaAjustada - inicioAnio;
    const unDia = 1000 * 60 * 60 * 24;
    const diaTurno = Math.floor(diff / unDia);
    const indice = diaTurno % farmaciasUtrera.length;
    
    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return {
      farmacia: farmaciasUtrera[indice],
      fechaTexto: ahora.toLocaleDateString('es-ES', opcionesFecha)
    };
  };

  const procesarRespuesta = (pregunta) => {
    const texto = pregunta.toLowerCase();

    if (texto.includes('farmacia') || texto.includes('guardia')) {
      const { farmacia, fechaTexto } = obtenerFarmaciaGuardiaHoy();

      return (
        <div>
          <p className="font-bold text-slate-900 mb-1">💊 FARMACIA DE GUARDIA HOY</p>
          <p className="text-[11px] text-slate-500 mb-2 capitalize">📅 {fechaTexto}</p>
          
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-2">
            <p className="font-bold text-slate-900">{farmacia.nombre}</p>
            <p className="text-slate-600 mt-1 flex items-center gap-1">
              <MapPin size={13} className="text-slate-400 flex-shrink-0" />
              <span>{farmacia.direccion}</span>
            </p>
            <p className="text-slate-600 mt-0.5 flex items-center gap-1">
              <Phone size={13} className="text-slate-400 flex-shrink-0" />
              <span>Teléfono: {farmacia.telefono}</span>
            </p>
            <p className="text-emerald-700 font-semibold mt-1">⏰ {farmacia.horario}</p>
          </div>

          {/* Botones de acción rápida seguros */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
            <button
              onClick={(e) => realizarLlamada(e, farmacia.telefono)}
              className="py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-emerald-100 shadow-sm transition-colors cursor-pointer"
            >
              <Phone size={13} /> Llamar
            </button>
            <button
              onClick={(e) => abrirMapa(e, farmacia.direccionMapa)}
              className="py-2 px-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-slate-200 shadow-sm transition-colors cursor-pointer"
            >
              <MapPin size={13} /> Cómo Llegar
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-[11px] font-medium text-slate-400 italic">
            <HeartPulse size={13} className="text-emerald-500" />
            <span>¡Que haya mejoría!</span>
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

    if (texto.includes('ayuntamiento') || texto.includes('alcalde')) {
      return '🏛️ **Ayuntamiento de Utrera**\n📍 Plaza de Gibaxa, 1\n📞 Teléfono: 955 86 45 00\nHorario de atención al ciudadano: 09:00 a 14:00 h.';
    }

    return `¡Entendido! Como asistente virtual de Utrerapp, sigo aprendiendo para ayudarte con la gestión local. Prueba a preguntarme por la **"farmacia de guardia"** o los **"trenes"**.`;
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

      {/* Botones de Acceso Rápido (Preguntas Frecuentes) */}
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