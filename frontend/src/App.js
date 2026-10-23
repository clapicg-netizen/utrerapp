import React, { useState, useEffect } from "react";
import Home from "./pages/Home";
import Farmacias from "./pages/Farmacias";
import Conso from "./pages/Conso";
// Importa aquí tus otras páginas o componentes según los tengas organizados

export default function App() {
  const [paginaActual, setPaginaActual] = useState('home');

  // Atajo de teclado secreto: Ctrl + Shift + A para abrir el panel admin de forma oculta
  useEffect(() => {
    const manejarAtajo = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setPaginaActual('dashboard-admin');
      }
    };
    window.addEventListener('keydown', manejarAtajo);
    return () => window.removeEventListener('keydown', manejarAtajo);
  }, []);

  // Renderizado condicional de páginas
  const renderizarPagina = () => {
    switch (paginaActual) {
      case 'home':
        return <Home setPaginaActual={setPaginaActual} />;
      case 'farmacias':
        return <Farmacias />;
      case 'conso':
        return <Conso />;
      case 'dashboard-admin':
        return (
          <div className="min-h-screen bg-slate-100 p-6 pb-28">
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h1 className="text-xl font-bold text-slate-900 mb-2">⚙️ Panel de Administración (Utrerapp)</h1>
              <p className="text-xs text-slate-500 mb-6">Área privada de gestión de comercios e inmobiliaria.</p>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-sm text-slate-800 mb-1">🏪 Alta / Gestión de Comercios</h3>
                  <p className="text-xs text-slate-500 mb-3">Añade los nuevos establecimientos y sus datos comerciales.</p>
                  <button 
                    onClick={() => alert("Formulario de alta de comercio listo para usar")}
                    className="bg-rose-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-950 cursor-pointer"
                  >
                    + Nuevo Comercio
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-sm text-slate-800 mb-1">🏠 Gestión Inmobiliaria</h3>
                  <p className="text-xs text-slate-500 mb-3">Publica o actualiza los inmuebles de la zona.</p>
                  <button 
                    onClick={() => alert("Formulario de inmobiliaria listo para usar")}
                    className="bg-rose-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-950 cursor-pointer"
                  >
                    + Nuevo Inmueble
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={() => setPaginaActual('home')}
                  className="text-xs text-slate-600 underline cursor-pointer font-medium"
                >
                  ← Volver a la App Principal
                </button>
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
      {/* Contenido principal de la página actual */}
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