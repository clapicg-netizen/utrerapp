
import React, { useState } from 'react';

const estaciones = [
  'Utrera',
  'Cantaelgallo',
  'Dos Hermanas',
  'Bellavista',
  'Jardines de Hércules',
  'Virgen del Rocío',
  'San Bernardo',
  'Sevilla-Santa Justa',
  'La Rinconada',
  'El Cáñamo',
  'Brenes',
  'Cantillana',
  'Los Rosales',
  'Guadajoz',
  'Lora del Río'
];

export default function CercaniasSevilla() {
  const [sentido, setSentido] = useState('sevilla');

  const recorrido = sentido === 'sevilla'
    ? [...estaciones].slice(0, 8)
    : [...estaciones].reverse();

  return (
    <div className="max-w-3xl mx-auto p-4 pb-28 space-y-5">

      <div className="bg-blue-900 text-white rounded-2xl p-6 shadow-lg">
        <p className="text-blue-200 text-sm font-semibold">
          UTRERAPP · TRANSPORTES
        </p>
        <h1 className="text-2xl font-extrabold mt-2">
          Cercanías Sevilla
        </h1>
        <p className="text-blue-100 mt-1">
          Línea C-1 · Estación de Utrera
        </p>
        <div className="mt-4 inline-flex bg-blue-700 px-3 py-2 rounded-full text-sm">
          🚆 Servicio programado
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <h2 className="text-lg font-bold text-slate-800">
          ¿Hacia dónde viajas?
        </h2>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => setSentido('sevilla')}
            className={`p-4 rounded-xl border-2 font-bold transition ${
              sentido === 'sevilla'
                ? 'border-blue-600 bg-blue-50 text-blue-800'
                : 'border-slate-200 text-slate-600'
            }`}
          >
            ↑ Sevilla
            <span className="block text-xs font-normal mt-1">
              Desde Utrera
            </span>
          </button>

          <button
            onClick={() => setSentido('utrera')}
            className={`p-4 rounded-xl border-2 font-bold transition ${
              sentido === 'utrera'
                ? 'border-blue-600 bg-blue-50 text-blue-800'
                : 'border-slate-200 text-slate-600'
            }`}
          >
            ↓ Utrera
            <span className="block text-xs font-normal mt-1">
              Desde Lora del Río
            </span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Recorrido de la línea C-1
        </h2>

        <div className="space-y-0">
          {recorrido.map((estacion, index) => (
            <div key={estacion} className="flex gap-3 min-h-12">
              <div className="flex flex-col items-center w-6">
                <div className={`w-3 h-3 rounded-full border-2 ${
                  estacion === 'Utrera'
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-blue-500'
                }`} />
                {index !== recorrido.length - 1 && (
                  <div className="w-0.5 flex-1 bg-blue-200" />
                )}
              </div>

              <div className={`text-sm pb-3 ${
                estacion === 'Utrera'
                  ? 'font-extrabold text-blue-800'
                  : 'text-slate-700'
              }`}>
                {estacion}
                {estacion === 'Utrera' && (
                  <span className="ml-2 text-xs text-blue-600">
                    Tu estación
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <h2 className="text-lg font-bold text-slate-800">
          Horarios de trenes
        </h2>

        <p className="text-sm text-slate-500 mt-2">
          Próximamente incorporaremos los horarios
          programados oficiales de Renfe, diferenciados
          por días laborables, sábados y festivos.
        </p>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-900">
            ⚠️ Horarios pendientes de verificación
          </p>
          <p className="text-xs text-amber-800 mt-1">
            Consulta Renfe para comprobar salidas,
            retrasos, cancelaciones e incidencias.
          </p>
        </div>

        <a
          href="https://www.renfe.com/es/es/cercanias/cercanias-sevilla"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl p-3 mt-4"
        >
          Consultar Renfe →
        </a>
      </div>

      <p className="text-center text-xs text-slate-400">
        UtrerApp · Información de transporte de Utrera
      </p>
    </div>
  );
}
