import React from 'react';

export default function TrenesUtrera() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 font-sans">
      <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold">Estación de Utrera</h1>
        <p className="text-sm opacity-80 mt-2">
          Cercanías Sevilla · Línea C1
        </p>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl">
        <h2 className="font-bold text-amber-900">
          Información ferroviaria pendiente de verificación
        </h2>
        <p className="text-sm text-amber-900 mt-2">
          No mostramos horarios, retrasos, cancelaciones ni incidencias
          hasta disponer de datos oficiales interpretados y verificados.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md space-y-3">
        <h2 className="text-lg font-bold text-gray-800">
          Consulta oficial de Renfe
        </h2>
        <p className="text-sm text-gray-600">
          Consulta los horarios y avisos actualizados directamente
          en los canales oficiales de Cercanías Sevilla.
        </p>
        <a
          href="https://www.renfe.com/es/es/cercanias/cercanias-sevilla"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-indigo-900 text-white px-5 py-3 rounded-xl font-semibold text-sm"
        >
          Consultar Renfe →
        </a>
      </div>
    </div>
  );
}
