import React, { useState } from 'react';

// ==========================================
// VISTAS DE UTRERAPP (Renovadas y Modernizadas)
// ==========================================

function VistaInicio({ setActiveTab }) {
  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pb-24">
      {/* Cabecera Principal Estilizada */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 p-6 text-white shadow-xl">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold tracking-wider bg-rose-700/60 rounded-full text-rose-100 uppercase">
            Tu ciudad en la palma de la mano
          </span>
          <h1 className="text-2xl font-black tracking-tight">Utrerapp ✨</h1>
          <p className="text-sm text-rose-200 mt-1">Servicios, comercio y agenda de Utrera actualizados.</p>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-32 h-32 bg-rose-600/20 rounded-full blur-2xl"></div>
      </div>

      {/* Cuadrícula de Accesos Directos con Diseño Moderno */}
      <div className="grid grid-cols-2 gap-4">
        {/* Guía Local */}
        <button 
          onClick={() => setActiveTab("market")}
          className="group flex flex-col items-start p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
            🏪
          </div>
          <span className="font-bold text-slate-800 text-base">Guía Local</span>
          <span className="text-xs text-slate-500 mt-0.5">Comercios y servicios</span>
        </button>

        {/* Asistente Conso */}
        <button 
          onClick={() => setActiveTab("conso")}
          className="group flex flex-col items-start p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
            🤖
          </div>
          <span className="font-bold text-slate-800 text-base">Asistente Conso</span>
          <span className="text-xs text-slate-500 mt-0.5">Farmacias y trenes</span>
        </button>

        {/* Nueva Sección: Agenda y Servicios Útiles */}
        <button 
          onClick={() => setActiveTab("agenda")}
          className="group flex flex-col items-start p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all text-left col-span-2 bg-gradient-to-br from-white to-rose-50/40"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform shadow-md shadow-rose-600/20">
            🏥
          </div>
          <span className="font-bold text-slate-800 text-base">Agenda y Urgencias (CHARE & ClicSalud)</span>
          <span className="text-xs text-slate-500 mt-0.5">Centros médicos, citas previas y teléfonos de interés</span>
        </button>

        {/* Tablón */}
        <button 
          onClick={() => setActiveTab("tablon")}
          className="group flex flex-col items-start p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
            📋
          </div>
          <span className="font-bold text-slate-800 text-base">Tablón</span>
          <span className="text-xs text-slate-500 mt-0.5">Anuncios locales</span>
        </button>

        {/* Farmacias */}
        <button 
          onClick={() => setActiveTab("farmacias")}
          className="group flex flex-col items-start p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
            💊
          </div>
          <span className="font-bold text-slate-800 text-base">Farmacias</span>
          <span className="text-xs text-slate-500 mt-0.5">De guardia</span>
        </button>
      </div>
    </div>
  );
}

function VistaGuiaComercial() {
  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Guía Comercial de Utrera</h2>
      <p className="text-sm text-slate-600">Directorio completo de comercios locales filtrados por categoría.</p>
      {/* Aquí irá el componente o lógica de Supabase */}
      <div className="p-6 bg-white rounded-2xl border border-slate-100 text-center text-slate-500">
        Cargando comercios desde Supabase...
      </div>
    </div>
  );
}

function VistaConso() {
  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-4">
      <div className="bg-gradient-to-r from-rose-700 to-red-800 p-5 rounded-2xl text-white shadow-md">
        <h2 className="text-lg font-bold flex items-center gap-2">🤖 Asistente Conso</h2>
        <p className="text-xs text-rose-100 mt-1">Pregúntame por farmacias, horarios de trenes o servicios médicos del pueblo.</p>
      </div>
      <div className="p-4 bg-white rounded-2xl border border-slate-100 min-h-[300px] flex flex-col justify-between">
        <div className="text-sm text-slate-600 space-y-2">
          <p className="bg-rose-50 p-3 rounded-xl text-rose-900">¡Hola, JuanRa! ¿En qué te puedo ayudar hoy en Utrera?</p>
        </div>
        <div className="mt-4 flex gap-2">
          <input type="text" placeholder="Escribe tu consulta..." className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-600" />
          <button className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-rose-700">Enviar</button>
        </div>
      </div>
    </div>
  );
}

function VistaAgendaUrgencias() {
  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Agenda y Urgencias</h2>
        <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Servicio Esencial</span>
      </div>
      <p className="text-sm text-slate-600">Acceso rápido a centros médicos, hospitales y trámites de salud en Utrera.</p>

      {/* Tarjeta CHARE */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base">CHARE de Utrera (Urgencias)</h3>
          <span className="text-2xl">🏥</span>
        </div>
        <p className="text-xs text-slate-500">Hospital de Alta Resolución. Atención de urgencias 24 horas.</p>
        <a href="tel:955000000" className="inline-block w-full text-center py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
          📞 Llamar a Urgencias / CHARE
        </a>
      </div>

      {/* Tarjeta ClicSalud+ */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base">Cita Previa ClicSalud+</h3>
          <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">SAS</span>
        </div>
        <p className="text-xs text-slate-500">Consulta tus citas médicas, recetas electrónicas y historiales del Servicio Andaluz de Salud.</p>
        <a href="https://www.sspa.juntadeandalucia.es/servicioandaluzdesalud/clicsalud/" target="_blank" rel="noreferrer" className="inline-block w-full text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors">
          🔗 Acceder a ClicSalud+
        </a>
      </div>

      {/* Teléfonos de Interés */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-800 text-base">Teléfonos de Emergencia</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <a href="tel:112" className="p-3 bg-slate-50 rounded-xl font-bold text-center text-slate-700 hover:bg-slate-100">🚨 112 Emergencias</a>
          <a href="tel:092" className="p-3 bg-slate-50 rounded-xl font-bold text-center text-slate-700 hover:bg-slate-100">👮 Policía Local</a>
        </div>
      </div>
    </div>
  );
}

function VistaTablon() {
  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Tablón de Anuncios</h2>
      <p className="text-sm text-slate-600">Avisos y tablón municipal.</p>
    </div>
  );
}

function VistaFarmacias() {
  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Farmacias de Guardia</h2>
      <p className="text-sm text-slate-600">Consulta las farmacias abiertas hoy en Utrera.</p>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL (App)
// ==========================================

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      <main className="flex-1">
        {activeTab === "home" && <VistaInicio setActiveTab={setActiveTab} />}
        {activeTab === "market" && <VistaGuiaComercial />}
        {activeTab === "conso" && <VistaConso />}
        {activeTab === "agenda" && <VistaAgendaUrgencias />}
        {activeTab === "tablon" && <VistaTablon />}
        {activeTab === "farmacias" && <VistaFarmacias />}
      </main>

      {/* Barra de Navegación Inferior (Dock Moderno) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/60 py-2 px-2 z-40 shadow-lg">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button 
            onClick={() => setActiveTab("home")} 
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${activeTab === "home" ? "text-rose-600 font-bold scale-105 bg-rose-50" : "text-slate-400 hover:text-slate-600"}`}
          >
            <span className="text-lg">🏠</span>
            <span className="text-[10px] mt-0.5">Inicio</span>
          </button>

          <button 
            onClick={() => setActiveTab("market")} 
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${activeTab === "market" ? "text-rose-600 font-bold scale-105 bg-rose-50" : "text-slate-400 hover:text-slate-600"}`}
          >
            <span className="text-lg">🏪</span>
            <span className="text-[10px] mt-0.5">Guía</span>
          </button>

          <button 
            onClick={() => setActiveTab("conso")} 
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${activeTab === "conso" ? "text-rose-600 font-bold scale-105 bg-rose-50" : "text-slate-400 hover:text-slate-600"}`}
          >
            <span className="text-lg">🤖</span>
            <span className="text-[10px] mt-0.5">Conso</span>
          </button>

          <button 
            onClick={() => setActiveTab("agenda")} 
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${activeTab === "agenda" ? "text-rose-600 font-bold scale-105 bg-rose-50" : "text-slate-400 hover:text-slate-600"}`}
          >
            <span className="text-lg">🏥</span>
            <span className="text-[10px] mt-0.5">Agenda</span>
          </button>

          <button 
            onClick={() => setActiveTab("tablon")} 
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${activeTab === "tablon" ? "text-rose-600 font-bold scale-105 bg-rose-50" : "text-slate-400 hover:text-slate-600"}`}
          >
            <span className="text-lg">📋</span>
            <span className="text-[10px] mt-0.5">Tablón</span>
          </button>
        </div>
      </nav>
    </div>
  );
}