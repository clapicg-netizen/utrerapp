// src/pages/Home.jsx
import React from 'react';
import { Newspaper, Store, HeartPulse, Building2, MapPin, Gamepad2, CalendarDays, ShieldAlert } from 'lucide-react';

export default function Home({ setPaginaActual }) {
  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 font-sans">
      {/* CABECERA */}
      <div className="bg-slate-900 text-white p-6 rounded-b-3xl shadow-lg relative">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <MapPin size={12} /> Utrera (Sevilla)
            </p>
            <h1 className="text-xl font-black mt-1">Utrerapp</h1>
          </div>
          <button
            onClick={() => setPaginaActual('admin')}
            className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer text-xs"
            title="Panel de Administración"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* CONTENIDO DE ACCESOS DIRECTOS */}
      <div className="px-4 mt-6 max-w-md mx-auto">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">
          Accesos Directos
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {/* TARJETA DE NOTICIAS */}
          <button
            onClick={() => setPaginaActual('noticias')}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Newspaper size={24} />
            </div>
            <span className="text-sm font-bold text-slate-800">Noticias</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Prensa y actualidad</span>
          </button>

          {/* COMERCIO Y HOSTELERÍA */}
          <button
            onClick={() => setPaginaActual('market')}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Store size={24} />
            </div>
            <span className="text-sm font-bold text-slate-800">Comercio</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Guía local y tiendas</span>
          </button>

          {/* AGENDA Y TEATRO */}
          <button
            onClick={() => setPaginaActual('menu-agenda')}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CalendarDays size={24} />
            </div>
            <span className="text-sm font-bold text-slate-800">Agenda</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Teatro y eventos</span>
          </button>

          {/* SALUD Y FARMACIAS */}
          <button
            onClick={() => setPaginaActual('farmacias')}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <HeartPulse size={24} />
            </div>
            <span className="text-sm font-bold text-slate-800">Salud</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Farmacias y guardias</span>
          </button>

          {/* QUÉ VER */}
          <button
            onClick={() => setPaginaActual('que-ver')}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Building2 size={24} />
            </div>
            <span className="text-sm font-bold text-slate-800">Qué Ver</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Patrimonio y turismo</span>
          </button>

          {/* JUEGOS Y PASATIEMPOS */}
          <button
            onClick={() => setPaginaActual('pasatiempos')}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Gamepad2 size={24} />
            </div>
            <span className="text-sm font-bold text-slate-800">Juegos</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Pasatiempos locales</span>
          </button>
        </div>
      </div>
    </div>
  );
}