import React, { useState, useEffect } from 'react';

export default function TrenesUtrera() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [pestanaActiva, setPestanaActiva] = useState('sevilla'); // 'sevilla', 'cadiz', 'haciaUtrera'

  useEffect(() => {
    fetch('/api/trenes')
      .then(res => res.json())
      .then(data => {
        setDatos(data);
        setCargando(false);
      })
      .catch(err => {
        console.error("Error cargando trenes:", err);
        setCargando(false);
      });
  }, []);

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-12 text-slate-500 font-medium">
        Sincronizando estado de los trenes en Utrera...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 font-sans">
      {/* Cabecera */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 rounded-xl shadow-md">
        <h2 className="text-xl font-bold flex items-center justify-between">
          <span>Estación de Utrera</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-normal">
            En Directo
          </span>
        </h2>
        <p className="text-xs text-blue-200 mt-1">
          Actualizado: {datos?.actualizado || "Recién sincronizado"}
        </p>
      </div>

      {/* Avisos Operativos */}
      {datos?.avisosHoy && datos.avisosHoy.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-xl shadow-sm text-xs text-amber-900 space-y-1">
          <p className="font-bold flex items-center gap-1">⚠️ Avisos de Servicio</p>
          {datos.avisosHoy.map(aviso => (
            <p key={aviso.id}>{aviso.texto}</p>
          ))}
        </div>
      )}

      {/* Pestañas de Navegación */}
      <div className="flex rounded-lg bg-slate-200 p-1 text-xs font-semibold text-slate-700">
        <button
          onClick={() => setPestanaActiva('sevilla')}
          className={`flex-1 py-2 rounded-md transition-all ${pestanaActiva === 'sevilla' ? 'bg-white text-blue-700 shadow-sm' : 'hover:text-slate-900'}`}
        >
          Hacia Sevilla
        </button>
        <button
          onClick={() => setPestanaActiva('cadiz')}
          className={`flex-1 py-2 rounded-md transition-all ${pestanaActiva === 'cadiz' ? 'bg-white text-blue-700 shadow-sm' : 'hover:text-slate-900'}`}
        >
          Hacia Cádiz
        </button>
        <button
          onClick={() => setPestanaActiva('haciaUtrera')}
          className={`flex-1 py-2 rounded-md transition-all ${pestanaActiva === 'haciaUtrera' ? 'bg-white text-blue-700 shadow-sm' : 'hover:text-slate-900'}`}
        >
          Hacia Utrera
        </button>
      </div>

      {/* Listado de Trenes según pestaña */}
      <div className="space-y-2">
        {pestanaActiva === 'sevilla' && renderListaTrenes(datos?.salidasSevilla)}
        {pestanaActiva === 'cadiz' && renderListaTrenes(datos?.salidasCadiz)}
        {pestanaActiva === 'haciaUtrera' && renderListaTrenesHaciaUtrera(datos?.salidasHaciaUtrera)}
      </div>
    </div>
  );
}

function renderListaTrenes(trenes) {
  if (!trenes || trenes.length === 0) {
    return <p className="text-center text-xs text-slate-400 py-6">No hay servicios programados en este momento.</p>;
  }

  return trenes.map((t, idx) => (
    <div key={idx} className="bg-white border border-slate-100 p-3 rounded-xl shadow-xs flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-800">
            {String(t.h).padStart(2, '0')}:{String(t.m).padStart(2, '0')}
          </span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
            {t.via}
          </span>
        </div>
        <p className="text-xs font-semibold text-slate-600 mt-0.5">{t.destino}</p>
      </div>
      <div className="text-right">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          t.estado === 'A su hora' ? 'bg-emerald-50 text-emerald-700' :
          t.estado === 'Suprimido' ? 'bg-rose-50 text-rose-700 font-bold' :
          'bg-amber-50 text-amber-700'
        }`}>
          {t.estado}
        </span>
      </div>
    </div>
  ));
}

function renderListaTrenesHaciaUtrera(trenes) {
  if (!trenes || trenes.length === 0) {
    return <p className="text-center text-xs text-slate-400 py-6">No hay registros de trenes hacia Utrera.</p>;
  }

  return trenes.map((t, idx) => (
    <div key={idx} className="bg-white border border-slate-100 p-3 rounded-xl shadow-xs flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-800">
            {String(t.h).padStart(2, '0')}:{String(t.m).padStart(2, '0')}
          </span>
          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">
            Desde {t.origen}
          </span>
        </div>
        <p className="text-xs font-semibold text-slate-600 mt-0.5">Destino: {t.destino}</p>
      </div>
      <div className="text-right">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          t.estado === 'A su hora' ? 'bg-emerald-50 text-emerald-700' :
          'bg-amber-50 text-amber-700'
        }`}>
          {t.estado}
        </span>
      </div>
    </div>
  ));
}