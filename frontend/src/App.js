import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Farmacias from './pages/Farmacias';
import Conso from './pages/Conso';
import GuiaComercial from './pages/GuiaComercial';
import DashboardAdmin from './pages/DashboardAdmin';
import PanelComercio from './pages/PanelComercio';
import Transporte from './pages/Transporte';
import Salud from './pages/Salud';
import AgendaGestiones from './pages/AgendaGestiones';
import QueVer from './pages/QueVer';
import MuroComunidad from './pages/MuroComunidad';
import MenuAgenda from './pages/MenuAgenda';
import Teatro from './pages/Teatro';

export default function App() {
  const [paginaActual, setPaginaActual] = useState('home');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idComercio = params.get('id');
    const path = window.location.pathname;

    if (idComercio || path.includes('/panel')) {
      setPaginaActual('panel-comercio');
    }
  }, []);

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
        return <GuiaComercial />;
      case 'hosteleria':
        return <GuiaComercial categoriaInicial="Hostelería" />; // <-- Abre la guía directamente en Hostelería
      case 'admin':
        return <DashboardAdmin />;
      case 'panel-comercio':
        return <PanelComercio />;
      case 'transporte':
        return <Transporte setPaginaActual={setPaginaActual} />;
      case 'salud':
        return <Salud setPaginaActual={setPaginaActual} />;
      case 'agenda-gestiones':
        return <AgendaGestiones setPaginaActual={setPaginaActual} />;
      case 'que-ver':
        return <QueVer setPaginaActual={setPaginaActual} />;
      case 'muro-comunidad':
        return <MuroComunidad setPaginaActual={setPaginaActual} />;
      case 'menu-agenda':
        return <MenuAgenda setPaginaActual={setPaginaActual} />;
      case 'teatro':
        return <Teatro setPaginaActual={setPaginaActual} />;
      default:
        return <Home setPaginaActual={setPaginaActual} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between">
      <div className="flex-1">
        {renderizarPagina()}
      </div>

      {paginaActual !== 'panel-comercio' && (
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
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${paginaActual === 'market' || paginaActual === 'guia' || paginaActual === 'hosteleria' ? 'text-rose-900 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
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
            <span className="text-xl">🧭</span>
            <span className="text-[10px]">Transporte</span>
          </button>
        </nav>
      )}
    </div>
  );
}