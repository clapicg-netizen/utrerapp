// src/pages/MenuAgenda.jsx
import React from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { Ticket, CalendarDays, ArrowRight } from "lucide-react";

export default function MenuAgenda({ setPaginaActual }) {
  return (
    <div className="app-shell pb-24" data-testid="menu-agenda-page">
      <TopBar title="Agenda Cultural y Eventos" back testId="menu-agenda-topbar" />

      <div className="mt-4 mb-6 px-1">
        <h2 className="text-lg font-black text-slate-900">Cultura en Utrera</h2>
        <p className="text-xs text-slate-500">Selecciona una categoría para ver la programación oficial</p>
      </div>

      <div className="space-y-4 px-1">
        {/* TARJETA 1: TEATRO ENRIQUE DE LA CUADRA (ENLAZA AL GIGLON) */}
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

      <BottomNav />
    </div>
  );
}