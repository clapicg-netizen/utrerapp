import React, { useState } from 'react';
import Home from './pages/Home';
import Farmacias from './pages/Farmacias';
import Conso from './pages/Conso';

export default function App() {
  const [paginaActual, setPaginaActual] = useState('home');

  const renderizarPagina = () => {
    switch (paginaActual) {
      case 'home':
        return <Home setPaginaActual={setPaginaActual} />;
      case 'farmacias':
        return <Farmacias />;
      case 'conso':
        return <Conso />;
      case 'market':
      case 'guia':
        return (
          <div className="min-h-screen bg-slate-50 p-6 pb-28">
            <div className="max-w-md mx-auto bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h1 className="text-xl font-bold text-slate-900 mb-2">🛍️ Guía Comercial de Utrera</h1>
              <p className="text-xs text-slate-500 mb-4">Directorio oficial de comercios y establecimientos locales.</p>
              
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-sm text-slate-800">Bar Alonsi</h3>
                  <p className="text-xs text-slate-500">Hostelería y tapas locales.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-sm text-slate-800">Comercios de la Zona Centro</h3>
                  <p className="text-xs text-slate-500">Moda, alimentación y servicios.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'transporte':
        return (
          <div className="min-h-screen bg-slate-50 p-6 pb-28">
            <div className="max-w-md mx-auto bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h1 className="text-xl font-bold text-slate-900 mb-2">🚆 Transporte y Trenes</h1>
              <p className="text-xs text-slate-500 mb-4">Horarios de Cercanías Línea C-1 Utrera - Sevilla.</p>
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-xs text-sky-900 font-medium space-y-1">
                <p>• Dirección Lora del Río: Vía 1 (16:07 h)</p>
                <p>• Dirección Sevilla-Santa Justa: Vía 3 (16:25 h)</p>
              </div>
            </div>
          </div>
        );
      default:
        return <Home setPaginaActual={setPaginaActual} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between">
      <div className="flex-1">
        {renderizarPagina()}
      </div>

      {/* Barra de navegación inferior fija */}
      <nav className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 flex justify-around items-center z-50 shadow-lg">
        <button 
          onClick={() => setPaginaActual('home')}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${paginaActual === 'home' ? 'text-rose-900 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <span className="text-xl">🏠</span>
          <span className="text-[10px]">Inicio</span>
        </button>
        
        <button 
          onClick={() => setPaginaActual('market')}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${paginaActual === 'market' || paginaActual === 'guia' ? 'text-rose-900 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <span className="text-xl">🛍️</span>
          <span className="text-[10px]">Guía Comercial</span>
        </button>

        <button 
          onClick={() => setPaginaActual('conso')}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${paginaActual === 'conso' ? 'text-rose-900 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <span className="text-xl">🤖</span>
          <span className="text-[10px]">Conso IA</span>
        </button>

        <button 
          onClick={() => setPaginaActual('transporte')}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${paginaActual === 'transporte' ? 'text-rose-900 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <span className="text-xl">🚆</span>
          <span className="text-[10px]">Trenes</span>
        </button>
      </nav>
    </div>
  );
}