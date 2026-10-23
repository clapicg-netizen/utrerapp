import React, { useState, useEffect } from "react";
import { Search, MapPin, Pill, Building2, HeartPulse, CalendarDays, Landmark, UtensilsCrossed } from "lucide-react";

export default function Home({ setTab }) {
  const [slideActual, setSlideActual] = useState(0);

  const avisos = [
    {
      id: 1,
      tipo: "CONSO TE AYUDA 🤝",
      color_badge: "bg-rose-500 text-white",
      titulo: "Habla con Conso, tu asistente de Utrera",
      subtitulo: "Pregúntale horarios, teléfonos de interés y ayuda local",
      bg_gradient: "from-rose-600 to-pink-700",
      icono: "💬",
      accion_tab: "conso"
    },
    {
      id: 2,
      tipo: "JUEGO & PREMIOS 🏆",
      color_badge: "bg-amber-500 text-slate-900",
      titulo: "La Búsqueda del Mostachón",
      subtitulo: "Encuentra las pistas por los comercios y gana premios",
      bg_gradient: "from-amber-600 to-yellow-600",
      icono: "🧁",
      accion_tab: "juego-mostachon"
    },
    {
      id: 3,
      tipo: "OFERTA DEL DÍA ⚡",
      color_badge: "bg-amber-500 text-white",
      titulo: "Bar Alonsi: 2x1 en tapas de arroz",
      subtitulo: "Muestra la PWA Utrerapp al hacer tu pedido hoy",
      bg_gradient: "from-amber-600 to-orange-700",
      icono: "⚡",
      accion_tab: "market"
    },
    {
      id: 4,
      tipo: "PAELLA EN LA CHANA 🥘",
      color_badge: "bg-sky-500 text-white",
      titulo: "Hoy Domingo a partir de las 13:30 horas",
      subtitulo: "¿Te la vas a perder?",
      bg_gradient: "from-slate-800 to-slate-900",
      icono: "📢",
      accion_tab: "market"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideActual((prev) => (prev + 1) % avisos.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [avisos.length]);

  const cambiarPestana = (e, destino) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof setTab === "function") {
      setTab(destino);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 font-sans">
      {/* CABECERA */}
      <div className="bg-slate-900 text-white p-5 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div>
            <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <MapPin size={12} /> Utrera en tu bolsillo
            </p>
            <h1 className="text-2xl font-black mt-0.5">¡Hola, Utrera! 👋</h1>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg shadow-inner">
            🏰
          </div>
        </div>

        <div className="mt-4 relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="¿Qué buscas hoy en Utrera?"
            className="w-full bg-slate-800 text-white placeholder-slate-400 pl-10 pr-4 py-3 rounded-2xl text-xs border border-slate-700 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
        </div>
      </div>

      {/* 1. CARRUSEL DE BANNERS EN PORTADA */}
      <div className="px-4 mt-4 max-w-md mx-auto">
        <div className="relative overflow-hidden rounded-2xl shadow-md border border-slate-200">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${slideActual * 100}%)` }}
          >
            {avisos.map((aviso) => (
              <div 
                key={aviso.id}
                onClick={(e) => cambiarPestana(e, aviso.accion_tab)}
                className={`w-full flex-shrink-0 bg-gradient-to-r ${aviso.bg_gradient} p-4 text-white relative cursor-pointer min-h-[110px] flex flex-col justify-between active:opacity-90`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-sm ${aviso.color_badge}`}>
                    {aviso.tipo}
                  </span>
                  <span className="text-xl">{aviso.icono}</span>
                </div>

                <div className="mt-1">
                  <h3 className="font-bold text-sm leading-tight truncate">{aviso.titulo}</h3>
                  <p className="text-xs text-slate-200 mt-0.5 line-clamp-1">{aviso.subtitulo}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-2 right-3 flex gap-1 z-10">
            {avisos.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setSlideActual(idx);
                }}
                className={`h-1.5 rounded-full transition-all ${slideActual === idx ? "w-4 bg-white" : "w-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 2. TARJETA DE CONSO - ASISTENTE */}
      <div className="px-4 mt-4 max-w-md mx-auto">
        <div 
          onClick={(e) => cambiarPestana(e, "conso")}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950 via-rose-900 to-red-950 p-6 text-white shadow-xl border border-rose-800/50 cursor-pointer hover:scale-[0.99] transition-transform"
        >
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/30 rounded-full text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                <span>✨ IA Oficial</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                Conso, tu asistente 🤖
              </h2>
              <p className="text-xs text-rose-200/90 font-medium leading-relaxed max-w-[220px]">
                Conectada en directo con inteligencia artificial. Horarios, farmacias y gestión de Utrera al instante.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-rose-700 flex items-center justify-center text-3xl shadow-lg shadow-rose-950/60 border-2 border-white/25">
                🧠✨
              </div>
              <span className="text-[10px] font-bold text-amber-300 mt-1.5 uppercase tracking-wider">Utrerapp</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE SERVICIOS Y GUÍA */}
      <div className="px-4 mt-5 max-w-md mx-auto">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Servicios y Guía de Utrera
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Farmacias */}
          <button 
            type="button"
            onClick={(e) => cambiarPestana(e, "market")}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:shadow-md transition-all text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Pill size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-xs truncate">Farmacias</p>
              <p className="text-[10px] text-slate-500 truncate">Salud & Guardia</p>
            </div>
          </button>

          {/* Salud (ClicSalud+) */}
          <button 
            type="button"
            onClick={(e) => window.open("https://www.sspa.juntadeandalucia.es/servicioandaluzdesalud/clicsalud/", "_blank")}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:shadow-md transition-all text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
              <HeartPulse size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-xs truncate">Salud</p>
              <p className="text-[10px] text-slate-500 truncate">Centros & ClicSalud+</p>
            </div>
          </button>

          {/* Guía Útil */}
          <button 
            type="button"
            onClick={(e) => cambiarPestana(e, "market")}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:shadow-md transition-all text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Building2 size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-xs truncate">Guía Útil</p>
              <p className="text-[10px] text-slate-500 truncate">Ayto. & Colegios</p>
            </div>
          </button>

          {/* Qué Ver */}
          <button 
            type="button"
            onClick={(e) => cambiarPestana(e, "market")}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:shadow-md transition-all text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Landmark size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-xs truncate">Qué Ver</p>
              <p className="text-[10px] text-slate-500 truncate">Monumentos & Turismo</p>
            </div>
          </button>

          {/* Eventos y Teatro (Ocupa las 2 columnas) */}
          <button 
            type="button"
            onClick={(e) => cambiarPestana(e, "market")}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all text-left col-span-2"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                <CalendarDays size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-xs truncate">Agenda Cultural y Eventos</p>
                <p className="text-[10px] text-slate-500 truncate">Programación y Teatro Municipal</p>
              </div>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md flex-shrink-0 ml-2">Teatro</span>
          </button>
        </div>
      </div>

      {/* ZONA DE OCIO, JUEGOS Y HOSTELERÍA */}
      <div className="px-4 mt-5 max-w-md mx-auto">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Ocio y Entretenimiento
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Búsqueda del Mostachón */}
          <button 
            type="button"
            onClick={(e) => cambiarPestana(e, "juego-mostachon")}
            className="bg-gradient-to-br from-amber-500 to-orange-600 p-3.5 rounded-2xl text-white shadow-md flex items-center gap-3 text-left border border-amber-400/40 active:scale-[0.98] transition-transform"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner flex-shrink-0">
              🧁
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase font-black text-amber-200 tracking-wider">Interactivo</p>
              <h3 className="font-extrabold text-xs leading-tight truncate">Búsqueda Mostachón</h3>
            </div>
          </button>

          {/* Hostelería (Bares y Copas) */}
          <button 
            type="button"
            onClick={(e) => cambiarPestana(e, "market")}
            className="bg-gradient-to-br from-orange-600 to-red-600 p-3.5 rounded-2xl text-white shadow-md flex items-center gap-3 text-left border border-orange-500/40 active:scale-[0.98] transition-transform"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner flex-shrink-0">
              <UtensilsCrossed size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase font-black text-orange-200 tracking-wider">Gastronomía</p>
              <h3 className="font-extrabold text-xs leading-tight truncate">Bares, Tapas y Copas</h3>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}