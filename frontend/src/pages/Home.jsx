import React, { useState, useEffect } from "react";
import { Store, Pill, Bus, Search, MapPin, Utensils, HeartHandshake, Compass } from "lucide-react";

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

      {/* CARRUSEL DE BANNERS EN PORTADA */}
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

      {/* BANNER DESTACADO DE "LA BÚSQUEDA DEL MOSTACHÓN" */}
      <div className="px-4 mt-4 max-w-md mx-auto">
        <button 
          type="button"
          onClick={(e) => cambiarPestana(e, "juego-mostachon")}
          className="w-full text-left bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 p-4 rounded-2xl text-white shadow-md flex items-center justify-between border border-amber-400/40 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
              🧁
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-amber-200 tracking-wider">Juego Interactivo</p>
              <h2 className="font-extrabold text-sm">La Búsqueda del Mostachón</h2>
              <p className="text-[11px] text-amber-100 mt-0.5">¡Encuentra tesoros en los negocios locales!</p>
            </div>
          </div>
          <Compass size={20} className="text-amber-200 flex-shrink-0 ml-2" />
        </button>
      </div>

      {/* SERVICIOS DESTACADOS */}
      <div className="px-4 mt-5 max-w-md mx-auto">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Servicios Destacados
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={(e) => cambiarPestana(e, "market")}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:shadow-md transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Store size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">Comercios</p>
              <p className="text-[10px] text-slate-500">Guía & Ofertas</p>
            </div>
          </button>

          <button 
            type="button"
            onClick={(e) => cambiarPestana(e, "conso")}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:shadow-md transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
              <HeartHandshake size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">Conso</p>
              <p className="text-[10px] text-slate-500">Asistente Local</p>
            </div>
          </button>

          <button 
            type="button"
            onClick={(e) => cambiarPestana(e, "market")}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:shadow-md transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
              <Utensils size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">Hostelería</p>
              <p className="text-[10px] text-slate-500">Bares y Tapas</p>
            </div>
          </button>

          <button 
            type="button"
            onClick={(e) => cambiarPestana(e, "market")}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:shadow-md transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Pill size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">Farmacias</p>
              <p className="text-[10px] text-slate-500">Salud & Guardia</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}