// src/pages/Pasatiempos.jsx
import React, { useState } from 'react';
import { Gamepad2, Sparkles, Brain, Trophy, ArrowLeft } from 'lucide-react';

export default function Pasatiempos({ setPaginaActual }) {
  const [juegoActivo, setJuegoActivo] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 font-sans">
      
      {/* CABECERA HERO */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-purple-900 text-white p-6 shadow-xl relative overflow-hidden rounded-b-[2.5rem]">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-600/20 rounded-full blur-2xl"></div>
        <div className="max-w-md mx-auto relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setPaginaActual('home')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={14} /> Volver
            </button>
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} /> Zona Relax
            </span>
          </div>
          
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Gamepad2 className="text-amber-400" size={28} /> Pasatiempos Utrerapp
          </h1>
          <p className="text-xs text-purple-100 leading-relaxed">
            Ideal para salas de espera, ratos libres o para desconectar un rato. ¡Elige tu juego y a pasar el rato!
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-4">
        
        {juegoActivo === null ? (
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Elige un Pasatiempo</h2>

            {/* Tarjeta Sudoku */}
            <div 
              onClick={() => setJuegoActivo('sudoku')}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black group-hover:scale-105 transition-transform flex-shrink-0">
                🔢
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-base">Sudoku clásico</h3>
                <p className="text-xs text-slate-500 mt-0.5">Ejercita la mente rellenando la cuadrícula numérica.</p>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl">Jugar</span>
            </div>

            {/* Tarjeta Sopa de Letras */}
            <div 
              onClick={() => setJuegoActivo('sopa')}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-2xl font-black group-hover:scale-105 transition-transform flex-shrink-0">
                🔠
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-base">Sopa de Letras Utrerana</h3>
                <p className="text-xs text-slate-500 mt-0.5">Encuentra palabras ocultas relacionadas con nuestra tierra.</p>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl">Jugar</span>
            </div>

            {/* Tarjeta Memoria / Parejas */}
            <div 
              onClick={() => setJuegoActivo('memoria')}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl font-black group-hover:scale-105 transition-transform flex-shrink-0">
                🧠
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-base">Reto de Memoria</h3>
                <p className="text-xs text-slate-500 mt-0.5">Empareja cartas de monumentos y símbolos de Utrera.</p>
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl">Jugar</span>
            </div>

          </div>
        ) : (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
            <div className="text-4xl">🚧</div>
            <h3 className="text-lg font-black text-slate-900">
              {juegoActivo === 'sudoku' && 'Sudoku en construcción'}
              {juegoActivo === 'sopa' && 'Sopa de Letras en construcción'}
              {juegoActivo === 'memoria' && 'Reto de Memoria en construcción'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Estamos programando el tablero interactivo para que funcione de manera súper fluida en tu móvil. ¡En breve lo tendrás disponible!
            </p>
            <button
              onClick={() => setJuegoActivo(null)}
              className="w-full bg-purple-900 text-white font-bold text-xs py-3 rounded-xl shadow hover:bg-purple-800 transition-colors cursor-pointer"
            >
              Volver a la lista de juegos
            </button>
          </div>
        )}

      </div>
    </div>
  );
}