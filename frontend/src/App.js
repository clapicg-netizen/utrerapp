
import React, { useState, useEffect } from 'react';

import Home from './pages/Home';
import GuiaComercial from './pages/GuiaComercial';
import Farmacias from './pages/Farmacias';
import Salud from './pages/Salud';
import Sanidad from './pages/Sanidad';
import AdminSanidad from './pages/AdminSanidad';
import AgendaGestiones from './pages/AgendaGestiones';
import QueVer from './pages/QueVer';
import MenuAgenda from './pages/MenuAgenda';
import Conso from './pages/Conso';
import PanelComercio from './pages/PanelComercio';
import Admin from './pages/Admin';
import Tablon from './pages/Tablon';
import Teatro from './pages/Teatro';
import Noticias from './pages/Noticias';
import CajaHerramientas from './pages/CajaHerramientas';
import Gasolineras from './pages/Gasolineras';

import TrenesUtrera from './components/TrenesUtrera';
import CercaniasSevilla from './components/CercaniasSevilla';

import {
  Store,
  MessageSquare,
  Home as HomeIcon,
  Train,
  Wrench,
  Fuel,
  Calendar
} from 'lucide-react';

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
      return;
    }

    const vistaParam = params.get('vista');

    if (vistaParam === 'trenes') {
      setPaginaActual('trenes');
    }

    if (vistaParam === 'cercanias') {
      setPaginaActual('cercanias');
    }
  }, []);

  const renderizarContenidoPrincipal = () => {
    if (comercioIdUrl && paginaActual === 'panel-comercio') {
      return (
        <PanelComercio
          comercioId={comercioIdUrl}
          setPaginaActual={setPaginaActual}
        />
      );
    }

    switch (paginaActual) {
      case 'home':
        return (
          <Home
            setPaginaActual={setPaginaActual}
            setTab={setPaginaActual}
          />
        );

      case 'market':
      case 'hosteleria':
        return (
          <GuiaComercial
            setPaginaActual={setPaginaActual}
            categoriaInicial={
              paginaActual === 'hosteleria' ? 'hosteleria' : null
            }
          />
        );

      case 'farmacias':
        return <Farmacias setPaginaActual={setPaginaActual} />;

      case 'salud':
        return <Salud setPaginaActual={setPaginaActual} />;

      case 'sanidad':
        return <Sanidad setPaginaActual={setPaginaActual} />;

      case 'admin-sanidad':
        return (
          <AdminSanidad
            setPaginaActual={setPaginaActual}
            supabase={supabase}
          />
        );

      case 'agenda-gestiones':
        return <AgendaGestiones setPaginaActual={setPaginaActual} />;

      case 'que-ver':
        return <QueVer setPaginaActual={setPaginaActual} />;

      case 'menu-agenda':
        return <MenuAgenda setPaginaActual={setPaginaActual} />;

      case 'teatro':
        return <Teatro setPaginaActual={setPaginaActual} />;

      case 'noticias':
        return <Noticias setPaginaActual={setPaginaActual} />;

      case 'conso':
        return <Conso setPaginaActual={setPaginaActual} />;

      case 'caja-herramientas':
        return <CajaHerramientas setPaginaActual={setPaginaActual} />;

      case 'gasolineras':
        return <Gasolineras setPaginaActual={setPaginaActual} />;

      case 'tablon':
        return <Tablon setPaginaActual={setPaginaActual} />;

      case 'admin':
        return <Admin setPaginaActual={setPaginaActual} />;

      case 'trenes':
        return (
          <div className="max-w-md mx-auto p-4 pb-24 lg:max-w-2xl">
            <div className="flex items-center justify-between mb-2 pt-2">
              <button
                onClick={() => setPaginaActual('home')}
                className="text-xs bg-slate-200 hover:bg-slate-300 px-3 py-1.5 rounded-lg font-medium text-slate-700 transition"
              >
                ← Volver
              </button>

              <h2 className="font-bold text-slate-800 text-sm">
                Estado del Tren
              </h2>

              <div className="w-12"></div>
            </div>

            <TrenesUtrera />
          </div>
        );

      case 'cercanias':
        return (
          <div className="w-full">
            <div className="max-w-3xl mx-auto px-4 pt-3">
              <button
                onClick={() => setPaginaActual('home')}
                className="text-xs bg-slate-200 hover:bg-slate-300 px-3 py-2 rounded-lg font-medium text-slate-700 transition"
              >
                ← Volver al inicio
              </button>
            </div>

            <CercaniasSevilla />
          </div>
        );

      default:
        return (
          <Home
            setPaginaActual={setPaginaActual}
            setTab={setPaginaActual}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col lg:flex-row">

      {/* BARRA LATERAL DE ESCRITORIO */}

      <aside className="hidden lg:flex lg:w-72 bg-white border-r border-slate-200 flex-col justify-between p-6 shrink-0 sticky top-0 h-screen shadow-sm">

        <div>

          <div
            className="flex items-center gap-3 mb-8 cursor-pointer"
            onClick={() => setPaginaActual('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
              U
            </div>

            <div>
              <h1 className="font-extrabold text-slate-900 text-lg leading-tight">
                UTRERAPP
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Tu guía local digital
              </p>
            </div>
          </div>

          <nav className="space-y-1.5">

            <button
              onClick={() => setPaginaActual('home')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                paginaActual === 'home'
                  ? 'bg-amber-50 text-amber-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <HomeIcon size={18} />
              <span>Inicio / Portada</span>
            </button>

            <button
              onClick={() => setPaginaActual('market')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                paginaActual === 'market' || paginaActual === 'hosteleria'
                  ? 'bg-amber-50 text-amber-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Store size={18} />
              <span>Guía Comercial</span>
            </button>

            <button
              onClick={() => setPaginaActual('trenes')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                paginaActual === 'trenes'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Train size={18} />
              <span>Trenes Utrera</span>
            </button>

            <button
              onClick={() => setPaginaActual('cercanias')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                paginaActual === 'cercanias'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Train size={18} />
              <span>Cercanías Sevilla</span>
            </button>

            <button
              onClick={() => setPaginaActual('caja-herramientas')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                paginaActual === 'caja-herramientas'
                  ? 'bg-amber-50 text-amber-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Wrench size={18} />
              <span>Caja de herramientas</span>
            </button>

            <button
              onClick={() => setPaginaActual('gasolineras')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                paginaActual === 'gasolineras'
                  ? 'bg-amber-50 text-amber-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Fuel size={18} />
              <span>Gasolineras</span>
            </button>

            <button
              onClick={() => setPaginaActual('teatro')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                paginaActual === 'teatro'
                  ? 'bg-amber-50 text-amber-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calendar size={18} />
              <span>Eventos (Teatro / Fiestas)</span>
            </button>

            <button
              onClick={() => setPaginaActual('conso')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                paginaActual === 'conso'
                  ? 'bg-rose-50 text-rose-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MessageSquare size={18} />
              <span>Conso IA</span>
            </button>

          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
          Utrerapp v2.0 • Escritorio & Móvil
        </div>

      </aside>

      {/* CONTENIDO PRINCIPAL */}

      <main className="flex-1 pb-24 lg:pb-0 overflow-y-auto">
        {renderizarContenidoPrincipal()}
      </main>

      {/* NAVEGACIÓN INFERIOR MÓVIL */}

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-2.5 px-4 flex justify-around items-center z-50 shadow-lg max-w-md mx-auto rounded-t-3xl lg:hidden">

        <button
          onClick={() => setPaginaActual('home')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            paginaActual === 'home'
              ? 'text-amber-600 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <HomeIcon size={20} />
          <span className="text-[10px]">Inicio</span>
        </button>

        <button
          onClick={() => setPaginaActual('market')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            paginaActual === 'market'
              ? 'text-amber-600 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Store size={20} />
          <span className="text-[10px]">Comercio</span>
        </button>

        <button
          onClick={() => setPaginaActual('caja-herramientas')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            paginaActual === 'caja-herramientas'
              ? 'text-amber-600 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Wrench size={20} />
          <span className="text-[10px]">Herramientas</span>
        </button>

        <button
          onClick={() => setPaginaActual('trenes')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            paginaActual === 'trenes'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Train size={20} />
          <span className="text-[10px]">Trenes</span>
        </button>

        <button
          onClick={() => setPaginaActual('cercanias')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            paginaActual === 'cercanias'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Train size={20} />
          <span className="text-[10px]">Cercanías</span>
        </button>

        <button
          onClick={() => setPaginaActual('conso')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            paginaActual === 'conso'
              ? 'text-rose-600 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <MessageSquare size={20} />
          <span className="text-[10px]">Conso IA</span>
        </button>

      </div>
    </div>
  );
}
