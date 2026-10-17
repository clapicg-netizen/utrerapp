import React, { useState, useEffect, useRef } from "react";
import { 
  Store, ShieldCheck, HeartHandshake, Send, Bot, User, Sparkles, 
  Trophy, QrCode, CheckCircle2, Lock, List, X, Compass, MapPin, Phone
} from "lucide-react";

import Home from "./pages/Home";
import GuiaComercial from "./pages/GuiaComercial";
import Admin from "./pages/DashboardAdmin";

// Icono Casita SVG
const HomeIcon = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

// -------------------------------------------------------------
// BBDD OFICIAL DE FARMACIAS DE GUARDIA EN UTRERA (2026)
// -------------------------------------------------------------
const farmaciasGuardiaOficiales = {
  // OCTUBRE 2026
  "2026-10-02": { farmacia: "José Luis Algarín Pachón", dir: "Corredera, 1", tel: "954860448" },
  "2026-10-03": { farmacia: "Pablo Troncoso López", dir: "Avda. María Auxiliadora, 95", tel: "954860196" },
  "2026-10-04": { farmacia: "Mª Carmen Martín García", dir: "Las Mujeres, 13", tel: "954861922" },
  "2026-10-05": { farmacia: "José González Mena", dir: "Avda. Blas Infante, 7", tel: "954861763" },
  "2026-10-06": { farmacia: "Rafael González-González", dir: "Cristo de los Afligidos, 74", tel: "954860213" },
  "2026-10-07": { farmacia: "Mª Luz Ceballos Niebla", dir: "Avda. La Fontanilla, 38", tel: "955864368" },
  "2026-10-08": { farmacia: "Farmacia Morales Guerrero", dir: "Avda. Alcalde José Dorado, 5", tel: "954864924" },
  "2026-10-09": { farmacia: "Antonio Valdés Arenas", dir: "Av. San Juan Bosco, 96", tel: "955864951" },
  "2026-10-10": { farmacia: "Andrés Díaz - Araceli Díaz", dir: "Virgen de Consolación, 9", tel: "954860180" },
  "2026-10-11": { farmacia: "Jesús Ceballos Torres", dir: "Sevilla, 8", tel: "954860269" },
  "2026-10-12": { farmacia: "Alfonso y Rosa Jiménez López", dir: "Molares, 41", tel: "955867744" },
  "2026-10-13": { farmacia: "Francisco Javier González Mancha", dir: "Real, 29", tel: "954861840" },
  "2026-10-14": { farmacia: "Rocío Martagón Barrero", dir: "Cristóbal Colón, 49", tel: "954861653" },
  "2026-10-19": { farmacia: "Víctor Espada Varela", dir: "Álvarez Quintero, 55", tel: "954860257" },
  "2026-10-20": { farmacia: "Pablo Troncoso López", dir: "Avda. María Auxiliadora, 95", tel: "954860196" },
  "2026-10-21": { farmacia: "Mª Carmen Martín García", dir: "Las Mujeres, 13", tel: "954861922" },
  "2026-10-22": { farmacia: "José González Mena", dir: "Avda. Blas Infante, 7", tel: "954861763" },
  "2026-10-23": { farmacia: "Mª Luz Ceballos Niebla", dir: "Avda. La Fontanilla, 38", tel: "955864368" },
  "2026-10-24": { farmacia: "Farmacia Morales Guerrero", dir: "Avda. Alcalde José Dorado, 5", tel: "954864924" },
  "2026-10-25": { farmacia: "Antonio Valdés Arenas", dir: "Av. San Juan Bosco, 96", tel: "955864951" },
  "2026-10-26": { farmacia: "Andrés Díaz - Araceli Díaz", dir: "Virgen de Consolación, 9", tel: "954860180" },
  "2026-10-27": { farmacia: "Jesús Ceballos Torres", dir: "Sevilla, 8", tel: "954860269" },
  "2026-10-28": { farmacia: "Alfonso y Rosa Jiménez López", dir: "Molares, 41", tel: "955867744" },
  "2026-10-29": { farmacia: "Rocío Martagón Barrero", dir: "Cristóbal Colón, 49", tel: "954861653" },
  "2026-10-30": { farmacia: "Ramón Ramírez M.", dir: "Doña Catalina de Perea, 14", tel: "954861077" },
  "2026-10-31": { farmacia: "Carolina Sousa - Ángel Cebolla", dir: "Álvarez Hazañas, 4", tel: "954861440" },

  // NOVIEMBRE 2026
  "2026-11-01": { farmacia: "José Luis Algarín Pachón", dir: "Corredera, 1", tel: "954860448" },
  "2026-11-02": { farmacia: "Víctor Espada Varela", dir: "Álvarez Quintero, 55", tel: "954860257" },
  "2026-11-03": { farmacia: "Pablo Troncoso López", dir: "Avda. María Auxiliadora, 95", tel: "954860196" },
  "2026-11-04": { farmacia: "Mª Carmen Martín García", dir: "Las Mujeres, 13", tel: "954861922" },
  "2026-11-05": { farmacia: "José González Mena", dir: "Avda. Blas Infante, 7", tel: "954861763" },
  "2026-11-06": { farmacia: "Mª Luz Ceballos Niebla", dir: "Avda. La Fontanilla, 38", tel: "955864368" },
  "2026-11-07": { farmacia: "Farmacia Morales Guerrero", dir: "Avda. Alcalde José Dorado, 5", tel: "954864924" },
  "2026-11-08": { farmacia: "Antonio Valdés Arenas", dir: "Av. San Juan Bosco, 96", tel: "955864951" },
  "2026-11-09": { farmacia: "Andrés Díaz - Araceli Díaz", dir: "Virgen de Consolación, 9", tel: "954860180" },
  "2026-11-10": { farmacia: "Jesús Ceballos Torres", dir: "Sevilla, 8", tel: "954860269" },
  "2026-11-11": { farmacia: "Alfonso y Rosa Jiménez López", dir: "Molares, 41", tel: "955867744" },
  "2026-11-12": { farmacia: "Francisco Javier González Mancha", dir: "Real, 29", tel: "954861840" },
  "2026-11-13": { farmacia: "Rocío Martagón Barrero", dir: "Cristóbal Colón, 49", tel: "954861653" },
  "2026-11-14": { farmacia: "Ramón Ramírez M.", dir: "Doña Catalina de Perea, 14", tel: "954861077" },
  "2026-11-15": { farmacia: "Carolina Sousa - Ángel Cebolla", dir: "Álvarez Hazañas, 4", tel: "954861440" },
  "2026-11-16": { farmacia: "José Luis Algarín Pachón", dir: "Corredera, 1", tel: "954860448" },
  "2026-11-17": { farmacia: "Víctor Espada Varela", dir: "Álvarez Quintero, 55", tel: "954860257" },
  "2026-11-18": { farmacia: "Pablo Troncoso López", dir: "Avda. María Auxiliadora, 95", tel: "954860196" },
  "2026-11-19": { farmacia: "Mª Carmen Martín García", dir: "Las Mujeres, 13", tel: "954861922" },
  "2026-11-20": { farmacia: "José González Mena", dir: "Avda. Blas Infante, 7", tel: "954861763" },
  "2026-11-21": { farmacia: "Rafael González-González", dir: "Cristo de los Afligidos, 74", tel: "954860213" },
  "2026-11-22": { farmacia: "Mª Luz Ceballos Niebla", dir: "Avda. La Fontanilla, 38", tel: "955864368" },
  "2026-11-23": { farmacia: "Farmacia Morales Guerrero", dir: "Avda. Alcalde José Dorado, 5", tel: "954864924" },
  "2026-11-24": { farmacia: "Antonio Valdés Arenas", dir: "Av. San Juan Bosco, 96", tel: "955864951" },
  "2026-11-25": { farmacia: "Andrés Díaz - Araceli Díaz", dir: "Virgen de Consolación, 9", tel: "954860180" },
  "2026-11-26": { farmacia: "Jesús Ceballos Torres", dir: "Sevilla, 8", tel: "954860269" },
  "2026-11-27": { farmacia: "Alfonso y Rosa Jiménez López", dir: "Molares, 41", tel: "955867744" },
  "2026-11-28": { farmacia: "Francisco Javier González Mancha", dir: "Real, 29", tel: "954861840" },
  "2026-11-29": { farmacia: "Rocío Martagón Barrero", dir: "Cristóbal Colón, 49", tel: "954861653" },
  "2026-11-30": { farmacia: "Ramón Ramírez M.", dir: "Doña Catalina de Perea, 14", tel: "954861077" },

  // DICIEMBRE 2026
  "2026-12-01": { farmacia: "Carolina Sousa - Ángel Cebolla", dir: "Álvarez Hazañas, 4", tel: "954861440" },
  "2026-12-02": { farmacia: "José Luis Algarín Pachón", dir: "Corredera, 1", tel: "954860448" },
  "2026-12-03": { farmacia: "Víctor Espada Varela", dir: "Álvarez Quintero, 55", tel: "954860257" },
  "2026-12-04": { farmacia: "Pablo Troncoso López", dir: "Avda. María Auxiliadora, 95", tel: "954860196" },
  "2026-12-05": { farmacia: "Mª Carmen Martín García", dir: "Las Mujeres, 13", tel: "954861922" },
  "2026-12-06": { farmacia: "José González Mena", dir: "Avda. Blas Infante, 7", tel: "954861763" },
  "2026-12-07": { farmacia: "Rafael González-González", dir: "Cristo de los Afligidos, 74", tel: "954860213" },
  "2026-12-08": { farmacia: "Mª Luz Ceballos Niebla", dir: "Avda. La Fontanilla, 38", tel: "955864368" },
  "2026-12-09": { farmacia: "Farmacia Morales Guerrero", dir: "Avda. Alcalde José Dorado, 5", tel: "954864924" },
  "2026-12-10": { farmacia: "Antonio Valdés Arenas", dir: "Av. San Juan Bosco, 96", tel: "955864951" },
  "2026-12-11": { farmacia: "Andrés Díaz - Araceli Díaz", dir: "Virgen de Consolación, 9", tel: "954860180" },
  "2026-12-12": { farmacia: "Jesús Ceballos Torres", dir: "Sevilla, 8", tel: "954860269" },
  "2026-12-13": { farmacia: "Alfonso y Rosa Jiménez López", dir: "Molares, 41", tel: "955867744" },
  "2026-12-14": { farmacia: "Francisco Javier González Mancha", dir: "Real, 29", tel: "954861840" },
  "2026-12-15": { farmacia: "Rocío Martagón Barrero", dir: "Cristóbal Colón, 49", tel: "954861653" },
  "2026-12-16": { farmacia: "Ramón Ramírez M.", dir: "Doña Catalina de Perea, 14", tel: "954861077" },
  "2026-12-17": { farmacia: "Carolina Sousa - Ángel Cebolla", dir: "Álvarez Hazañas, 4", tel: "954861440" },
  "2026-12-18": { farmacia: "José Luis Algarín Pachón", dir: "Corredera, 1", tel: "954860448" },
  "2026-12-19": { farmacia: "Víctor Espada Varela", dir: "Álvarez Quintero, 55", tel: "954860257" },
  "2026-12-20": { farmacia: "Pablo Troncoso López", dir: "Avda. María Auxiliadora, 95", tel: "954860196" },
  "2026-12-21": { farmacia: "Mª Carmen Martín García", dir: "Las Mujeres, 13", tel: "954861922" },
  "2026-12-22": { farmacia: "José González Mena", dir: "Avda. Blas Infante, 7", tel: "954861763" },
  "2026-12-23": { farmacia: "Rafael González-González", dir: "Cristo de los Afligidos, 74", tel: "954860213" },
  "2026-12-24": { farmacia: "Mª Luz Ceballos Niebla", dir: "Avda. La Fontanilla, 38", tel: "955864368" },
  "2026-12-25": { farmacia: "Farmacia Morales Guerrero", dir: "Avda. Alcalde José Dorado, 5", tel: "954864924" },
  "2026-12-26": { farmacia: "Antonio Valdés Arenas", dir: "Av. San Juan Bosco, 96", tel: "955864951" },
  "2026-12-27": { farmacia: "Andrés Díaz - Araceli Díaz", dir: "Virgen de Consolación, 9", tel: "954860180" },
  "2026-12-28": { farmacia: "Jesús Ceballos Torres", dir: "Sevilla, 8", tel: "954860269" }
};

// -------------------------------------------------------------
// COMPONENTE VISTA CONSO
// -------------------------------------------------------------
function VistaConso() {
  const [mensajes, setMensajes] = useState([
    {
      id: 1,
      remitente: "conso",
      texto: "¡Hola! Soy Conso, tu asistente de Utrera. 👋 Pregúntame por las farmacias de guardia o los horarios de Renfe y te llevaré directamente.",
      botones: []
    }
  ]);
  const [input, setInput] = useState("");
  const [pensando, setPensando] = useState(false);
  const chatEndRef = useRef(null);

  const opcionesRapidas = [
    "🏥 Farmacia de Guardia hoy",
    "🚆 Próximo Cercanías Renfe C1",
    "🚌 Autobús Urbano",
    "🥘 Comercios y Hostelería"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, pensando]);

  const responderConso = (consulta) => {
    const q = consulta.toLowerCase();

    if (q.includes("farmacia") || q.includes("guardia") || q.includes("salud")) {
      const hoy = new Date();
      const año = hoy.getFullYear();
      const mes = String(hoy.getMonth() + 1).padStart(2, "0");
      const dia = String(hoy.getDate()).padStart(2, "0");
      const fechaClave = `${año}-${mes}-${dia}`;
      
      const fechaTexto = hoy.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

      const turno = farmaciasGuardiaOficiales[fechaClave] || {
        farmacia: "Francisco Javier González Mancha",
        dir: "Real, 29",
        tel: "954861840"
      };

      const queryMaps = encodeURIComponent(`${turno.farmacia} ${turno.dir} Utrera`);

      return {
        texto: `🏥 **FARMACIA DE GUARDIA HOY EN UTRERA**\n📅 *${fechaTexto.toUpperCase()}*\n\n**Ldo/a. ${turno.farmacia}**\n📍 Dirección: ${turno.dir}\n📞 Teléfono: ${turno.tel}\n⏱️ Horarios: Turno de Guardia 24 horas`,
        botones: [
          {
            texto: `🗺️ Te llevo a ${turno.farmacia}`,
            icono: "mapa",
            url: `https://www.google.com/maps/search/?api=1&query=${queryMaps}`
          },
          {
            texto: `📞 Llamar a ${turno.farmacia} (${turno.tel})`,
            icono: "telefono",
            url: `tel:${turno.tel}`
          }
        ]
      };
    }

    if (q.includes("renfe") || q.includes("cercanias") || q.includes("tren") || q.includes("c1") || q.includes("sevilla") || q.includes("utrera")) {
      // Detección de sentido: DESDE Sevilla/Virgen del Rocío HACIA Utrera
      if (q.includes("desde sevilla") || q.includes("para utrera") || q.includes("a utrera") || q.includes("virgen del rocio") || q.includes("san bernardo") || q.includes("santa justa")) {
        return {
          texto: `🚆 **CERCANÍAS RENFE LÍNEA C1 (Sevilla ↔ Utrera)**\n\n• **Próximas salidas desde Sevilla hacia Utrera:**\n  - 10:20 h (Cercanías C1)\n  - 10:50 h (Cercanías C1)\n  - 11:20 h (Cercanías C1)\n  - 11:50 h (Cercanías C1)\n\n📍 **Estaciones de origen:** Santa Justa / San Bernardo / Virgen del Rocío\n⏱️ **Tiempo estimado de trayecto:** 26-32 min.`,
          botones: [
            { 
              texto: "🗺️ Te llevo a la Estación de Virgen del Rocío", 
              icono: "mapa",
              url: "https://www.google.com/maps/search/?api=1&query=Estacion+Sevilla+Virgen+del+Rocio" 
            },
            { 
              texto: "📱 Consultar horarios oficiales Renfe", 
              icono: "web",
              url: "https://www.renfe.com/es/es/cercanias/cercanias-sevilla/horarios" 
            }
          ]
        };
      }

      // Por defecto: salidas DESDE Utrera HACIA Sevilla
      return {
        texto: `🚆 **CERCANÍAS RENFE LÍNEA C1 (Utrera ↔ Sevilla)**\n\n• **Próximas salidas Utrera dirección Sevilla:**\n  - 09:35 h (Cercanías C1)\n  - 09:58 h (Media Distancia)\n  - 10:20 h (Cercanías C1)\n  - 10:50 h (Cercanías C1)\n\n📍 **Estación de Trenes de Utrera:** Plaza de la Estación, s/n\n⏱️ **Tiempo estimado a San Bernardo:** 32 min.`,
        botones: [
          { 
            texto: "🗺️ Te llevo a la Estación de Renfe", 
            icono: "mapa",
            url: "https://www.google.com/maps/search/?api=1&query=Estacion+de+Tren+Utrera" 
          },
          { 
            texto: "📱 Consultar horarios oficiales Renfe", 
            icono: "web",
            url: "https://www.renfe.com/es/es/cercanias/cercanias-sevilla/horarios" 
          }
        ]
      };
    }

    if (q.includes("bus") || q.includes("autobus") || q.includes("urbano")) {
      return {
        texto: "🚌 **AUTOBÚS URBANO DE UTRERA**\n\n• Línea 1: Renfe - El Tinte\n• Línea 2: Hospital High Tech - La Fontanilla\n\n📍 Parada Central: Plaza del Altozano",
        botones: [
          { 
            texto: "🗺️ Te llevo a la Parada Central (Altozano)", 
            icono: "mapa",
            url: "https://www.google.com/maps/search/?api=1&query=Plaza+del+Altozano+Utrera" 
          }
        ]
      };
    }

    return {
      texto: `Entendido. Sobre "${consulta}", estoy consultando la guía local de Utrera para darte la información exacta.`,
      botones: []
    };
  };

  const enviarMensaje = (textoAEnviar) => {
    const txt = textoAEnviar || input;
    if (!txt.trim()) return;

    const msgUser = { id: Date.now(), remitente: "usuario", texto: txt, botones: [] };
    setMensajes((prev) => [...prev, msgUser]);
    if (!textoAEnviar) setInput("");
    setPensando(true);

    setTimeout(() => {
      const res = responderConso(txt);
      setMensajes((prev) => [
        ...prev, 
        { id: Date.now() + 1, remitente: "conso", texto: res.texto, botones: res.botones }
      ]);
      setPensando(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-slate-800 font-sans flex flex-col">
      <div className="bg-rose-900 text-white p-5 rounded-b-3xl shadow-lg sticky top-0 z-20">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/30 flex items-center justify-center text-rose-300 text-2xl border border-rose-400/30">
            🤝
          </div>
          <div>
            <h1 className="text-xl font-black flex items-center gap-1.5">
              Conso <Sparkles size={16} className="text-amber-300" />
            </h1>
            <p className="text-xs text-rose-200">Asistente Virtual de Utrera</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 max-w-md mx-auto w-full">
        <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Consultas frecuentes:</p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {opcionesRapidas.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => enviarMensaje(opt)}
              className="bg-white border border-rose-200 text-rose-800 text-xs px-3 py-1.5 rounded-xl whitespace-nowrap shadow-sm hover:bg-rose-50 active:scale-95 transition-all font-medium"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-w-md mx-auto w-full">
        {mensajes.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2 ${m.remitente === "usuario" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 shadow-sm ${
                m.remitente === "usuario" ? "bg-amber-500 text-white" : "bg-rose-600 text-white"
              }`}
            >
              {m.remitente === "usuario" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm whitespace-pre-line ${
                m.remitente === "usuario"
                  ? "bg-amber-500 text-white rounded-tr-none font-medium"
                  : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
              }`}
            >
              {m.texto}

              {m.botones && m.botones.length > 0 && (
                <div className="mt-3 space-y-2 pt-2 border-t border-slate-100">
                  {m.botones.map((btn, bIdx) => (
                    <a
                      key={bIdx}
                      href={btn.url}
                      target={btn.url.startsWith("tel:") ? "_self" : "_blank"}
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between font-extrabold px-3 py-2.5 rounded-xl text-[11px] shadow active:scale-95 transition-all ${
                        btn.icono === "telefono"
                          ? "bg-emerald-600 text-white hover:bg-emerald-500"
                          : "bg-amber-500 text-slate-950 hover:bg-amber-400"
                      }`}
                    >
                      <span>{btn.texto}</span>
                      {btn.icono === "telefono" ? (
                        <Phone size={14} className="flex-shrink-0 ml-1" />
                      ) : (
                        <MapPin size={14} className="flex-shrink-0 ml-1" />
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {pensando && (
          <div className="flex items-center gap-2 text-rose-600 text-xs p-2">
            <Bot size={16} className="animate-bounce" />
            <span>Conso está consultando la información...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-slate-200 fixed bottom-16 left-0 right-0 z-30 shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enviarMensaje();
          }}
          className="max-w-md mx-auto flex gap-2"
        >
          <input
            type="text"
            placeholder="Escribe tu consulta a Conso..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-100 text-slate-800 placeholder-slate-400 px-4 py-3 rounded-2xl text-xs border border-slate-200 focus:outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            className="bg-rose-600 text-white p-3 rounded-2xl hover:bg-rose-700 active:scale-95 transition-all shadow-md flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENTE VISTA JUEGO MOSTACHÓN
// -------------------------------------------------------------
function VistaJuegoMostachon() {
  const [nick, setNick] = useState(localStorage.getItem("utrera_nick") || "");
  const [inputNick, setInputNick] = useState("");
  const [mostrarModalNick, setMostrarModalNick] = useState(!localStorage.getItem("utrera_nick"));
  const [mostrarRanking, setMostrarRanking] = useState(false);
  const [vistaActual, setVistaActual] = useState("mapa");
  
  const [encontrados, setEncontrados] = useState([1, 3]);
  const [puntos, setPuntos] = useState(200);

  const listaMostachones = [
    { id: 1, comercio: "Bar Alonsi", pista: "Junto al plato de arroz", premio: "2x1 en Tapas" },
    { id: 2, comercio: "Bar La Chana", pista: "En el salón interior", premio: "Bebida Gratis" },
    { id: 3, comercio: "Pastelería Diego Vázquez", pista: "Mostrador principal de mostachones", premio: "Caja de Mostachones" },
    { id: 4, comercio: "Farmacia Corredera", pista: "Escaparate exterior", premio: "100 Puntos Extra" },
    { id: 5, comercio: "Mercado de Abastos", pista: "Puesto central de verduras", premio: "Bolsa Reutilizable" },
    { id: 6, comercio: "Modas Carmen", pista: "Zona de ropa de temporada", premio: "5€ de Descuento" },
    { id: 7, comercio: "Librería Anaya", pista: "Estantería de cultura local", premio: "Marcapáginas Utrerapp" },
    { id: 8, comercio: "Cafetería La Plaza", pista: "Terraza exterior", premio: "Café Cortesía" },
    { id: 9, comercio: "Calzados Pepe", pista: "Sección calzado deportivo", premio: "10% dto." },
    { id: 10, comercio: "Zapatería Ruíz", pista: "Mostrador de caja", premio: "Llavero Exclusivo" }
  ];

  const rankingUsuarios = [
    { posicion: 1, nick: "Manuel_Utrera", puntos: 1000, encontrados: 10 },
    { posicion: 2, nick: "MariCarmen_77", puntos: 800, encontrados: 8 },
    { posicion: 3, nick: nick || "Usuario", puntos: puntos, encontrados: encontrados.length },
    { posicion: 4, nick: "Alonso_Bar", puntos: 100, encontrados: 1 }
  ];

  const guardarNick = (e) => {
    e.preventDefault();
    const nombre = inputNick.trim() || "Usuario";
    setNick(nombre);
    localStorage.setItem("utrera_nick", nombre);
    setMostrarModalNick(false);
  };

  const simularCaptura = (id) => {
    if (!encontrados.includes(id)) {
      setEncontrados((prev) => [...prev, id]);
      setPuntos((prev) => prev + 100);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-28 text-slate-800 font-sans relative flex flex-col">
      <div className="bg-[#4a2306] text-amber-100 p-3 shadow-xl z-20 border-b border-amber-900/60">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200">
            <User size={14} className="text-amber-400" />
            <span className="truncate max-w-[90px]">{nick || "Usuario"}</span>
          </div>

          <div className="text-center">
            <p className="font-extrabold text-sm text-white flex items-center justify-center gap-1">
              🔎 La Búsqueda del Mostachón
            </p>
            <p className="text-[10px] text-amber-300 font-bold mt-0.5">
              Puntos: <span className="text-white">{puntos}</span> | Encontrados: <span className="text-white">{encontrados.length}/10</span>
            </p>
          </div>

          <button
            onClick={() => setMostrarRanking(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 text-[11px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 active:scale-95 transition-transform"
          >
            <Trophy size={12} /> Ranking
          </button>
        </div>
      </div>

      <div className="bg-[#361904] px-4 py-2 flex justify-center gap-2 z-20 border-b border-amber-900/40">
        <button
          onClick={() => setVistaActual("mapa")}
          className={`flex-1 max-w-[180px] py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            vistaActual === "mapa"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-amber-950/60 text-amber-300 border border-amber-800/50"
          }`}
        >
          <Compass size={14} /> Mapa Interactivo
        </button>

        <button
          onClick={() => setVistaActual("lista")}
          className={`flex-1 max-w-[180px] py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            vistaActual === "lista"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-amber-950/60 text-amber-300 border border-amber-800/50"
          }`}
        >
          <List size={14} /> Lista y QR ({encontrados.length}/10)
        </button>
      </div>

      <div className="flex-1 relative min-h-[500px]">
        {vistaActual === "mapa" ? (
          <div className="w-full h-full min-h-[550px] relative bg-slate-800 overflow-hidden">
            <iframe
              title="Mapa Juego Utrera"
              className="w-full h-full min-h-[550px] border-0"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-5.7920%2C37.1750%2C-5.7700%2C37.1890&amp;layer=mapnik"
            />

            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-full h-full max-w-md mx-auto">
                {listaMostachones.map((m, idx) => {
                  const des = encontrados.includes(m.id);
                  const positions = [
                    { top: "45%", left: "48%" },
                    { top: "52%", left: "42%" },
                    { top: "38%", left: "55%" },
                    { top: "60%", left: "50%" },
                    { top: "32%", left: "40%" },
                    { top: "58%", left: "35%" },
                    { top: "40%", left: "62%" },
                    { top: "48%", left: "38%" },
                    { top: "65%", left: "45%" },
                    { top: "30%", left: "52%" }
                  ];

                  return (
                    <button
                      key={m.id}
                      onClick={() => simularCaptura(m.id)}
                      style={positions[idx % positions.length]}
                      className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group"
                    >
                      <div
                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 active:scale-90 ${
                          des
                            ? "bg-emerald-600 border-white text-white"
                            : "bg-[#b85e19] border-amber-200 text-amber-100 animate-bounce"
                        }`}
                      >
                        <span className="text-base">🧁</span>
                      </div>
                      <span className="bg-slate-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap block mt-0.5 -ml-2">
                        {m.comercio}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-4 max-w-md mx-auto bg-slate-50 text-slate-800 min-h-screen">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg shadow-inner">
                  {encontrados.length}/10
                </div>
                <div>
                  <p className="font-extrabold text-xs text-slate-900">Mostachones Coleccionados</p>
                  <p className="text-[10px] text-slate-500">
                    {encontrados.length === 10 ? "¡Has completado la ruta!" : `Faltan ${10 - encontrados.length} negocios por visitar`}
                  </p>
                </div>
              </div>
              <Trophy className="text-amber-500" size={26} />
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800 text-center">
              <QrCode size={38} className="mx-auto text-amber-400 mb-2" />
              <h2 className="font-bold text-sm">Validación de Código QR</h2>
              <p className="text-xs text-slate-400 mt-1 mb-3">
                Usa el botón para probar el escaneo en el negocio local donde estés:
              </p>

              <div className="grid grid-cols-2 gap-2">
                {listaMostachones.slice(0, 4).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => simularCaptura(m.id)}
                    className={`text-[11px] py-2 px-2 rounded-xl font-bold border transition-all ${
                      encontrados.includes(m.id)
                        ? "bg-emerald-950/80 border-emerald-600 text-emerald-300"
                        : "bg-amber-600/20 border-amber-500/40 text-amber-300 hover:bg-amber-600/40"
                    }`}
                  >
                    {encontrados.includes(m.id) ? "✓ CAPTURADO" : `📷 ${m.comercio}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-3">
                Ruta de Mostachones en Utrera
              </h2>

              <div className="space-y-2.5">
                {listaMostachones.map((m) => {
                  const des = encontrados.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                        des ? "bg-emerald-50/60 border-emerald-200" : "bg-slate-50 border-slate-200 opacity-80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                            des ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {des ? <CheckCircle2 size={18} /> : <Lock size={16} />}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900">{m.comercio}</p>
                          <p className="text-[10px] text-slate-500">
                            {des ? `Premio: ${m.premio}` : `Pista: ${m.pista}`}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          des ? "bg-emerald-200 text-emerald-900" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {des ? "DESBLOQUEADO" : "PENDIENTE"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL NICK */}
      {mostrarModalNick && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl border border-amber-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center text-2xl mb-3 shadow-inner">
              🔎
            </div>
            <h2 className="font-extrabold text-amber-900 text-base leading-snug">
              ¡Bienvenido a La Búsqueda del Mostachón!
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Elige tu apodo para competir en el Ranking Real de Utrera:
            </p>

            <form onSubmit={guardarNick} className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Tu Apodo / Nick"
                value={inputNick}
                onChange={(e) => setInputNick(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 border-2 border-amber-700/60 rounded-xl py-2.5 px-3 text-xs font-bold text-center focus:outline-none focus:border-amber-600"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                ¡EMPEZAR A BUSCAR!
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RANKING */}
      {mostrarRanking && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl relative">
            <button
              onClick={() => setMostrarRanking(false)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Trophy className="text-amber-500" size={20} />
              <h3 className="font-black text-sm text-slate-900">Ranking Real de Utrera</h3>
            </div>

            <div className="space-y-2">
              {rankingUsuarios.map((r) => (
                <div
                  key={r.posicion}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                    r.nick === (nick || "Usuario")
                      ? "bg-amber-50 border-amber-300 text-amber-900"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-slate-400 text-[10px]">#{r.posicion}</span>
                    <span>{r.nick}</span>
                  </div>
                  <span className="text-[11px] text-amber-600 font-extrabold">{r.puntos} pts</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setMostrarRanking(false)}
              className="w-full mt-4 bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// -------------------------------------------------------------
// CONTENEDOR PRINCIPAL
// -------------------------------------------------------------
export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  const navItems = [
    { id: "home", label: "Inicio", icon: HomeIcon },
    { id: "market", label: "Guía", icon: Store },
    { id: "conso", label: "Conso", icon: HeartHandshake },
    { id: "gestion-privada-utrerapp", label: "Admin", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1">
        {activeTab === "home" && <Home setTab={setActiveTab} />}
        {activeTab === "market" && <GuiaComercial />}
        {activeTab === "conso" && <VistaConso />}
        {activeTab === "juego-mostachon" && <VistaJuegoMostachon />}
        {activeTab === "gestion-privada-utrerapp" && <Admin />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 z-40 shadow-lg">
        <div className="max-w-md mx-auto flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-full py-1 transition-all ${
                  isActive ? "text-amber-600 scale-105" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon size={20} className={isActive ? "stroke-[2.5]" : "stroke-[1.8]"} />
                <span className={`text-[10px] mt-1 font-bold ${isActive ? "text-amber-600" : "text-slate-500"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}