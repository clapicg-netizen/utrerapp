// src/pages/Teatro.jsx
import React, { useState } from "react";
import { ArrowLeft, ExternalLink, CalendarDays } from "lucide-react";

export default function Teatro({ setPaginaActual }) {
  const [cargando, setCargando] = useState(true);
  const urlGiglon = "https://www.giglon.com/todos?city=Utrera";

  return (
    <div className="flex flex-col bg-slate-50 font-sans text-slate-800 max-lg:min-h-[calc(100vh-5.5rem-env(safe-area-inset-bottom,0px))] max-lg:supports-[height:100dvh]:min-h-[calc(100dvh-5.5rem-env(safe-area-inset-bottom,0px))] lg:min-h-screen lg:pb-28">
      {/* CABECERA */}
      <div className="bg-slate-900 text-white p-5 rounded-b-3xl shadow-lg relative flex-shrink-0 max-lg:pt-[max(1.25rem,env(safe-area-inset-top,0px))] max-lg:pl-[max(1.25rem,env(safe-area-inset-left,0px))] max-lg:pr-[max(1.25rem,env(safe-area-inset-right,0px))]">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPaginaActual("menu-agenda")}
              className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <CalendarDays size={12} /> Cartelera Oficial
              </p>
              <h1 className="text-lg font-black mt-0.5">Teatro Enrique de la Cuadra</h1>
            </div>
          </div>

          <a
            href={urlGiglon}
            target="_blank"
            rel="noreferrer"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1 shadow transition-colors shrink-0"
          >
            Web <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* CONTENEDOR DEL IFRAME DE GIGLON */}
      <div className="mx-auto flex w-full flex-1 flex-col max-lg:pl-[env(safe-area-inset-left,0px)] max-lg:pr-[env(safe-area-inset-right,0px)] lg:mt-4 lg:max-w-md lg:px-4">
        <div className="relative w-full flex-1 bg-white max-lg:min-h-[16rem] lg:min-h-[70vh] lg:overflow-hidden lg:rounded-3xl lg:border lg:border-slate-200 lg:shadow-sm">
          {cargando && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-500 gap-2 z-10">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold">Cargando cartelera de Utrera...</p>
            </div>
          )}

          <iframe
            src={urlGiglon}
            title="Cartelera Teatro Utrera - Giglon"
            className="w-full h-full border-0 absolute inset-0"
            onLoad={() => setCargando(false)}
          />
        </div>
      </div>
    </div>
  );
}
