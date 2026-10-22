import React, { useState } from 'react';
import Home from './pages/Home';
import GuiaComercial from './pages/GuiaComercial';
import Bares from './pages/Bares';
import Farmacias from './pages/Farmacias';
import Eventos from './pages/Eventos';
import Teatro from './pages/Teatro';
import Transporte from './pages/Transporte';
import Urgencias from './pages/Urgencias';
import Conso from './pages/Conso';
import Tablon from './pages/Tablon';
import Vivienda from './pages/Vivienda';
import UtreraTV from './pages/UtreraTV';
import Admin from './pages/Admin';
import DashboardAdmin from './pages/DashboardAdmin';
import PanelComercio from './pages/PanelComercio';
import Market from './pages/Market';

function App() {
  const [paginaActual, setPaginaActual] = useState('home');

  const renderizarPagina = () => {
    switch (paginaActual) {
      case 'home':
        return <Home setPaginaActual={setPaginaActual} />;
      case 'guia':
        return <GuiaComercial />;
      case 'market':
        return <Market />;
      case 'bares':
        return <Bares />;
      case 'farmacias':
        return <Farmacias />;
      case 'eventos':
        return <Eventos />;
      case 'teatro':
        return <Teatro />;
      case 'transporte':
        return <Transporte />;
      case 'urgencias':
        return <Urgencias />;
      case 'conso':
        return <Conso />;
      case 'tablon':
        return <Tablon />;
      case 'vivienda':
        return <Vivienda />;
      case 'utreratv':
        return <UtreraTV />;
      case 'admin':
        return <Admin />;
      case 'dashboard-admin':
        return <DashboardAdmin />;
      case 'panel-comercio':
        return <PanelComercio />;
      default:
        return <Home setPaginaActual={setPaginaActual} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans pb-20">
      {/* Contenido dinámico según la sección seleccionada */}
      <main className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative overflow-hidden flex flex-col justify-between">
        <div className="flex-1 overflow-y-auto">
          {renderizarPagina()}
        </div>

        {/* Barra de navegación inferior fija */}
        <nav className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 flex justify-around items-center z-50 shadow-lg">
          <button 
            onClick={() => setPaginaActual('home')}
            className={`flex flex-col items-center gap-1 transition-colors ${paginaActual === 'home' ? 'text-rose-900 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span className="text-xl">🏠</span>
            <span className="text-[10px]">Inicio</span>
          </button>
          
          <button 
            onClick={() => setPaginaActual('guia')}
            className={`flex flex-col items-center gap-1 transition-colors ${paginaActual === 'guia' ? 'text-rose-900 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span className="text-xl">🏪</span>
            <span className="text-[10px]">Comercio</span>
          </button>

          <button 
            onClick={() => setPaginaActual('market')}
            className={`flex flex-col items-center gap-1 transition-colors ${paginaActual === 'market' ? 'text-rose-900 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span className="text-xl">🛍️</span>
            <span className="text-[10px]">Market</span>
          </button>

          <button 
            onClick={() => setPaginaActual('conso')}
            className={`flex flex-col items-center gap-1 transition-colors ${paginaActual === 'conso' ? 'text-rose-900 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span className="text-xl">🤖</span>
            <span className="text-[10px]">Conso IA</span>
          </button>

          <button 
            onClick={() => setPaginaActual('transporte')}
            className={`flex flex-col items-center gap-1 transition-colors ${paginaActual === 'transporte' ? 'text-rose-900 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span className="text-xl">🚆</span>
            <span className="text-[10px]">Trenes</span>
          </button>
        </nav>
      </main>
    </div>
  );
}

export default App;