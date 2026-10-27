// src/App.js
import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import GuiaComercial from './pages/GuiaComercial';
import Farmacias from './pages/Farmacias';
import Salud from './pages/Salud';
import AgendaGestiones from './pages/AgendaGestiones';
import QueVer from './pages/QueVer';
import MenuAgenda from './pages/MenuAgenda';
import Conso from './pages/Conso';
import Pasatiempos from './pages/Pasatiempos';
import PanelComercio from './pages/PanelComercio';
import Admin from './pages/Admin';
import Tablon from './pages/Tablon'; // <-- Importamos la página del tablón
import { Store, MessageSquare, Gamepad2, Home as HomeIcon, Newspaper } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [paginaActual, setPaginaActual] = useState('home');
  const [comercioIdUrl, setComercioIdUrl] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idComercio = params.get('id');
    if (idComercio) {
      setComercioIdUrl(idComercio);
      setPaginaActual('panel-comercio');
    }
  }, []);

  const renderizarPagina = () => {
    if (comercioIdUrl && paginaActual === 'panel-comercio') {
      return <PanelComercio comercioId={comercioIdUrl} setPaginaActual={setPaginaActual} />;
    }

    switch (paginaActual) {
      case 'home':
        return <Home setPaginaActual={setPaginaActual} />;
      case 'market':
      case 'hosteleria':
        return <GuiaComercial setPaginaActual={setPaginaActual} categoriaInicial={paginaActual === 'hosteleria' ? 'hosteleria' : null} />;
      case 'farmacias':
        return <Farmacias setPaginaActual={setPaginaActual} />;
      case 'salud':
        return <Salud setPaginaActual={setPaginaActual} />;
      case 'agenda-gestiones':
        return <AgendaGestiones setPaginaActual={setPaginaActual} />;
      case 'que-ver':
        return <QueVer setPaginaActual={setPaginaActual} />;
      case 'menu-agenda':
        return <MenuAgenda setPaginaActual={setPaginaActual} />;
      case 'conso':
        return <Conso setPaginaActual={setPaginaActual} />;
      case 'pasatiempos':
        return <Pasatiempos setPaginaActual={setPaginaActual} />;
      case 'tablon':
        return <Tablon setPaginaActual={setPaginaActual} />; // <-- Añadimos la ruta del tablón
      case 'admin':
        return <Admin setPaginaActual={setPaginaActual} />;
      default:
        return <Home setPaginaActual={setPaginaActual} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {renderizarPagina()}

      {/* BARRA DE NAVEGACIÓN INFERIOR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-2.5 px-6 flex justify-around items-center z-50 shadow-lg max-w-md mx-auto rounded-t-3xl">
        <button 
          onClick={() => setPaginaActual('home')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${paginaActual === 'home' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <HomeIcon size={20} />
          <span className="text-[10px]">Inicio</span>
        </button>

        <button 
          onClick={() => setPaginaActual('market')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${paginaActual === 'market' || paginaActual === 'hosteleria' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Store size={20} />
          <span className="text-[10px]">Comercio</span>
        </button>

        {/* Botón directo al Tablón en la barra inferior */}
        <button 
          onClick={() => setPaginaActual('tablon')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${paginaActual === 'tablon' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Newspaper size={20} />
          <span className="text-[10px]">Tablón</span>
        </button>

        <button 
          onClick={() => setPaginaActual('pasatiempos')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${paginaActual === 'pasatiempos' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Gamepad2 size={20} />
          <span className="text-[10px]">Juegos</span>
        </button>

        <button 
          onClick={() => setPaginaActual('conso')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${paginaActual === 'conso' ? 'text-rose-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <MessageSquare size={20} />
          <span className="text-[10px]">Conso IA</span>
        </button>
      </div>
    </div>
  );
}