import React from "react";
import { Compass, Trophy, MapPin, Gift, Star } from "lucide-react";

export default function JuegoMostachon() {
  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 font-sans">
      {/* Cabecera */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/20">
            🧁
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">
              Juego Interactivo
            </span>
            <h1 className="text-xl font-black mt-1">La Búsqueda del Mostachón</h1>
          </div>
        </div>
        <p className="text-xs text-amber-100 mt-3 leading-relaxed">
          Explora Utrera, resuelve acertijos en comercios locales y escanea códigos QR para acumular puntos y ganar recompensas.
        </p>
      </div>

      {/* Contenido Principal */}
      <div className="px-4 mt-5 space-y-4 max-w-lg mx-auto">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
            <Trophy size={18} className="text-amber-500" /> ¿Cómo Funciona?
          </h2>
          <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Visita los comercios adheridos de Utrera.</li>
            <li>Encuentra la pista o el código oculto en el establecimiento.</li>
            <li>Escanea la pista con tu móvil para desbloquear tu mostachón digital.</li>
            <li>¡Canjea tus mostachones acumulados por vales y descuentos!</li>
          </ol>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className="text-amber-600" size={24} />
            <div>
              <p className="font-bold text-xs text-amber-900">Tus Mostachones</p>
              <p className="text-[11px] text-amber-700">0 descifrados de 10</p>
            </div>
          </div>
          <button className="bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:bg-amber-700">
            Escanear QR
          </button>
        </div>
      </div>
    </div>
  );
}