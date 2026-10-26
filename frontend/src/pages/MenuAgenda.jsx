// src/pages/MenuAgenda.jsx
import React from "react";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";

export default function MenuAgenda({ setPaginaActual }) {
  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 font-sans">
      {/* CABECERA */}
      <div className="bg-slate-900 text-white p-5 rounded-b-3xl shadow-lg relative">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <button
            onClick={() => setPaginaActual("home")}
            className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <CalendarDays size={12} /> Utrera Cultural
            </p>
            <h1 className="text-xl font-black mt-0.5">Agenda y Eventos</h1>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="px-4 mt-5 max-w-md mx-auto space-y-4">
        {/* TARJETA 1: TEATRO ENRIQUE DE LA CUADRA */}
        <div
          onClick={() => setPaginaActual("teatro")}
          className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 p-5 rounded-3xl text-white shadow-md border border-slate-800 cursor-pointer hover:scale-[0.99] transition-transform relative overflow-hidden flex items-center justify-between"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/20 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl shadow-inner font-black shrink-0">
              🎭
            </div>
            <div>
              <span className="text-[9px] uppercase font-black tracking-widest text-amber-400">Cartelera Oficial</span>
              <h3 className="font-bold text-base mt-0.5">Teatro Enrique de la Cuadra</h3>
              <p className="text-xs text-slate-300 mt-0.5">Programación y compra de entradas (Giglon)</p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 relative z-10">
            <ArrowRight size={16} />
          </div>
        </div>

        {/* TARJETA 2: EVENTOS CULTURALES GENERALES */}
        <div
          onClick={() => setPaginaActual("eventos")}
          className="bg-gradient-to-br from-purple-900 via-purple-950 to-slate-900 p-5 rounded-3xl text-white shadow-md border border-purple-800/50 cursor-pointer hover:scale-[0.99] transition-transform relative overflow-hidden flex items-center justify-between"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-500/20 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center text-xl shadow-inner font-black shrink-0">
              📅
            </div>
            <div>
              <span className="text-[9px] uppercase font-black tracking-widest text-purple-300">Agenda Local</span>
              <h3 className="font-bold text-base mt-0.5">Eventos Culturales</h3>
              <p className="text-xs text-purple-200 mt-0.5">Conciertos, exposiciones y festividades</p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 relative z-10">
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}