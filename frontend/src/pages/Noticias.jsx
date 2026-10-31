import React, { useState } from "react";
import { Newspaper, Clock, ArrowLeft, ExternalLink, Tv, Radio } from "lucide-react";

const MEDIA_SOURCES = [
  {
    name: "Utrera Digital",
    color: "bg-rose-100 text-rose-700",
    url: "https://www.utreradigital.com/web/"
  },
  {
    name: "Utrera Web",
    color: "bg-indigo-100 text-indigo-700",
    url: "https://www.utreraweb.com/"
  },
  {
    name: "Uvitel Online",
    color: "bg-emerald-100 text-emerald-700",
    url: "https://uvitelonline.com/"
  },
  {
    name: "Utrera al Día",
    color: "bg-amber-100 text-amber-800",
    url: "https://www.utreraaldia.com"
  }
];

export default function Noticias({ setPaginaActual }) {
  const [pestanaActiva, setPestanaActiva] = useState("todos"); // 'todos', 'Utrera Digital', 'Utrera Web', 'Uvitel Online', 'Utrera al Día', 'tv'
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);

  // Noticias principales con enlaces directos a sus respectivas fuentes oficiales
  const [news] = useState([
    {
      id: 1,
      source: "Utrera Digital",
      category: "Actualidad",
      headline: "Utrera encara los preparativos para las próximas citas culturales",
      summary: "Las distintas delegaciones municipales coordinan la agenda de eventos que llenarán de actividad las plazas y teatros de la localidad.",
      published_at: "2026-10-28",
      url: "https://www.utreradigital.com/web/"
    },
    {
      id: 2,
      source: "Utrera Web",
      category: "Local",
      headline: "Nuevas actuaciones de mejora en infraestructuras y viales",
      summary: "El plan de acondicionamiento de barriadas avanza con intervenciones en pavimentación, acerado y señalización.",
      published_at: "2026-10-28",
      url: "https://www.utreraweb.com/"
    },
    {
      id: 3,
      source: "Uvitel Online",
      category: "Cultura y Sociedad",
      headline: "Repaso a la actualidad comarcal y programación de televisión",
      summary: "Toda la información de Utrera y los municipios vecinos recogida en los boletines informativos y magazines de la jornada.",
      published_at: "2026-10-27",
      url: "https://uvitelonline.com/"
    },
    {
      id: 4,
      source: "Utrera al Día",
      category: "Actualidad",
      headline: "Accede a la portada y última hora de Utrera al Día",
      summary: "Consulta en directo la información diaria, reportajes y la actualidad de nuestro municipio desde su edición oficial.",
      published_at: "2026-10-31",
      url: "https://www.utreraaldia.com"
    }
  ]);

  const noticiasFiltradas = pestanaActiva === "todos" 
    ? news 
    : news.filter(n => n.source === pestanaActiva);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 font-sans">
      {/* CABECERA */}
      <div className="bg-slate-900 text-white p-5 rounded-b-3xl shadow-lg relative">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPaginaActual('home')}
              className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-black">Titulares y TV Utrera</h1>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 max-w-md mx-auto">
        {/* PESTAÑAS DE FILTRADO Y TV EN DIRECTO */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setPestanaActiva("todos")}
            className={`text-[11px] px-3 py-1.5 rounded-full font-semibold shrink-0 cursor-pointer transition-colors ${pestanaActiva === 'todos' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            📰 Todos
          </button>
          
          {MEDIA_SOURCES.map((m) => (
            <button
              key={m.name}
              onClick={() => setPestanaActiva(m.name)}
              className={`text-[11px] px-3 py-1.5 rounded-full font-semibold shrink-0 cursor-pointer transition-colors ${pestanaActiva === m.name ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              {m.name}
            </button>
          ))}

          <button
            onClick={() => setPestanaActiva("tv")}
            className={`text-[11px] px-3 py-1.5 rounded-full font-bold shrink-0 cursor-pointer flex items-center gap-1 transition-colors ${pestanaActiva === 'tv' ? 'bg-rose-600 text-white shadow-md animate-pulse' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}
          >
            <Tv size={12} /> TV en Directo
          </button>
        </div>

        {/* CONTENIDO SEGÚN PESTAÑA */}
        {pestanaActiva === "tv" ? (
          /* REPRODUCTOR TV EN DIRECTO (UVITEL ONLINE) */
          <div className="mt-4 bg-white rounded-3xl p-5 shadow-sm border border-slate-200 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              Uvitel TV En Directo
            </div>
            
            <p className="text-xs text-slate-500">
              Disfruta de la señal de televisión en streaming de Utrera en tiempo real.
            </p>

            <div className="relative rounded-2xl overflow-hidden shadow-inner bg-slate-900 aspect-video flex items-center justify-center">
              <iframe 
                src="https://uvitelonline.com/en-directo/" 
                title="Uvitel TV en Directo"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <a
              href="https://uvitelonline.com/en-directo/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors shadow-md"
            >
              Abrir reproductor a pantalla completa <ExternalLink size={14} />
            </a>
          </div>
        ) : (
          /* LISTADO DE NOTICIAS FILTRADAS */
          <div className="mt-3 space-y-2.5">
            {noticiasFiltradas.map((n) => {
              const fuenteInfo = MEDIA_SOURCES.find(m => m.name === n.source);
              return (
                <button
                  key={n.id}
                  onClick={() => setNoticiaSeleccionada(n)}
                  className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Newspaper size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${fuenteInfo?.color || "bg-slate-100 text-slate-700"}`}>
                        {n.source}
                      </span>
                      <span className="text-[10px] text-slate-400">{n.category}</span>
                    </div>
                    <h3 className="font-bold text-[14px] leading-tight mt-1.5 text-slate-900">{n.headline}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.summary}</p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                      <Clock size={10} /> {n.published_at}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL / DIÁLOGO DE DETALLE CON ENLACE AL MEDIO ORIGINAL */}
      {noticiaSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 space-y-4">
            <div>
              <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 ${MEDIA_SOURCES.find(m => m.name === noticiaSeleccionada.source)?.color || "bg-slate-100 text-slate-700"}`}>
                {noticiaSeleccionada.source}
              </span>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                {noticiaSeleccionada.headline}
              </h2>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              {noticiaSeleccionada.summary}
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setNoticiaSeleccionada(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cerrar
              </button>

              <a
                href={noticiaSeleccionada.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-md"
              >
                Leer en {noticiaSeleccionada.source} <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}