// src/pages/Teatro.jsx
import React, { useState } from "react";
import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
import { ExternalLink } from "lucide-react";

export default function Teatro() {
  const [cargando, setCargando] = useState(true);
  const urlGiglon = "https://www.giglon.com/todos?city=Utrera";

  return (
    <div className="app-shell pb-24" data-testid="teatro-page">
      <TopBar title="Teatro Enrique de la Cuadra" back testId="teatro-topbar" />

      {/* CABECERA HERO */}
      <div className="mt-4 rounded-3xl overflow-hidden relative h-36 shadow-md" data-testid="teatro-hero">
        <img
          src="https://images.unsplash.com/photo-1761359841098-8e84b7cf3661?crop=entropy&cs=srgb&fm=jpg&w=800&q=80"
          alt="Teatro"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 text-white flex justify-between items-end w-full">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/80">Cartelera Oficial</p>
            <h2 className="font-display font-extrabold text-lg leading-tight">Enrique de la Cuadra</h2>
            <p className="text-xs text-white/80">C/ Rodrigo Caro, 16 · Utrera</p>
          </div>
          <a
            href={urlGiglon}
            target="_blank"
            rel="noreferrer"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 shadow transition-colors mb-1"
          >
            Abrir Web <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <p className="mt-5 mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold px-1">
        Programación en Directo (Giglon)
      </p>

      {/* CONTENEDOR DEL IFRAME DE GIGLON */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden relative shadow-sm h-[60vh] w-full">
        {cargando && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card text-muted-foreground gap-2 z-10">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold">Cargando eventos de Utrera...</p>
          </div>
        )}

        <iframe
          src={urlGiglon}
          title="Cartelera Teatro Utrera - Giglon"
          className="w-full h-full border-0"
          onLoad={() => setCargando(false)}
        />
      </div>

      <BottomNav />
    </div>
  );
}