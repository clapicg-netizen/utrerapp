import React, { useEffect, useState } from "react";
import { Newspaper, Clock, ArrowLeft, ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const SOURCE_COLORS = {
  "Utrera al Día": "bg-rose-100 text-rose-700",
  "Utrera Información": "bg-indigo-100 text-indigo-700",
  "Diario de Utrera": "bg-emerald-100 text-emerald-700",
  "Sevilla Este": "bg-amber-100 text-amber-800",
};

export default function Noticias({ setPaginaActual }) {
  const [news, setNews] = useState([]);
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);

  useEffect(() => {
    async function cargarNoticias() {
      try {
        // Intentamos cargar desde Supabase si existe la tabla 'noticias'
        const { data, error } = await supabase
          .from('noticias')
          .select('*')
          .order('published_at', { ascending: false });

        if (data && data.length > 0) {
          setNews(data);
        } else {
          // Datos de respaldo por si la tabla aún está vacía
          setNews([
            {
              id: 1,
              source: "Utrera al Día",
              category: "Local",
              headline: "Utrera se prepara for una nueva edición cultural",
              summary: "Las calles del centro histórico acogerán diversas actividades durante el fin de semana con gran expectación vecinal.",
              published_at: "2026-10-28",
              url: "#"
            },
            {
              id: 2,
              source: "Utrera Información",
              category: "Ayuntamiento",
              headline: "Nuevas mejoras en los transportes y líneas urbanas",
              summary: "El consistorio anuncia optimizaciones en los horarios de autobuses para facilitar la conexión con las barriadas.",
              published_at: "2026-10-27",
              url: "#"
            }
          ]);
        }
      } catch (err) {
        console.error("Error cargando noticias:", err);
      }
    }
    cargarNoticias();
  }, []);

  const sources = [...new Set(news.map((n) => n.source))];

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
            <h1 className="text-lg font-black">Titulares de Utrera</h1>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 max-w-md mx-auto">
        {/* FILTROS DE FUENTES */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <span className="text-[11px] px-3 py-1.5 rounded-full bg-amber-600 text-white font-semibold shrink-0 cursor-pointer">
            Todos
          </span>
          {sources.map((s) => (
            <span key={s} className="text-[11px] px-3 py-1.5 rounded-full bg-white text-slate-600 border border-slate-200 shrink-0 cursor-pointer shadow-sm">
              {s}
            </span>
          ))}
        </div>

        {/* LISTADO DE NOTICIAS */}
        <div className="mt-3 space-y-2.5">
          {news.map((n) => (
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
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${SOURCE_COLORS[n.source] || "bg-slate-100 text-slate-700"}`}>
                    {n.source}
                  </span>
                  <span className="text-[10px] text-slate-400">{n.category}</span>
                </div>
                <h3 className="font-bold text-[14px] leading-tight mt-1.5 text-slate-900">{n.headline}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.summary}</p>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                  <Clock size={10} /> {n.published_at ? n.published_at.slice(0, 10) : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MODAL / DIÁLOGO DE DETALLE */}
      {noticiaSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 ${SOURCE_COLORS[noticiaSeleccionada.source] || "bg-slate-100 text-slate-700"}`}>
              {noticiaSeleccionada.source}
            </span>
            <h2 className="text-lg font-black text-slate-900 leading-tight">
              {noticiaSeleccionada.headline}
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              {noticiaSeleccionada.summary}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setNoticiaSeleccionada(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}