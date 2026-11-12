import React, { useState } from 'react';
import routesData from '../data/cercanias_sevilla_routes.json';
import schedulesData from '../data/cercanias_sevilla_schedules.json';

export default function CercaniasSevilla() {
  const [selectedRoute, setSelectedRoute] = useState('30T0001C1');
  const [searchTerm, setSearchTerm] = useState('');

  const c1Routes = routesData.filter(r => r.route_id.startsWith('30T'));
  const filteredSchedules = schedulesData.filter(sch => sch.route_id === selectedRoute);

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24 text-gray-800">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="bg-blue-500 text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">Renfe Cercanías</span>
            <h1 className="text-2xl font-bold mt-2">Cercanías Sevilla & Utrera</h1>
            <p className="text-blue-100 text-sm mt-1">Horarios oficiales GTFS (Núcleo Sevilla - C-1)</p>
          </div>
          <div className="hidden sm:block text-4xl">🚆</div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Líneas del Núcleo</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {c1Routes.map(route => (
            <button
              key={route.route_id}
              onClick={() => setSelectedRoute(route.route_id)}
              className={`p-3 rounded-xl text-left transition-all border ${
                selectedRoute === route.route_id
                  ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-500/20'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "#78B4E1" }}
                />
                <span className="font-bold text-sm">Línea {route.route_short_name}</span>
              </div>
              <p className="text-xs text-gray-600 truncate mt-1">{route.route_long_name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Estación Principal: Utrera (ID: 51200)</h3>
            <p className="text-xs text-gray-500">Coordenadas: 37.1848178, -5.7907537 (Acceso PMR habilitado)</p>
          </div>
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="Filtrar por estación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Próximos Trayectos Disponibles (GTFS)</h4>
          {filteredSchedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No hay trayectos cargados para esta selección o línea en el set de datos estático actual.
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredSchedules.map((trip, idx) => {
                const utreraStop = trip.stops.find(s => s.stop_id === '51200');
                const firstStop = trip.stops[0];
                const lastStop = trip.stops[trip.stops.length - 1];

                return (
                  <div key={trip.trip_id || idx} className="bg-gray-50 hover:bg-blue-50/40 border border-gray-200 rounded-xl p-4 transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">
                          Trip: {trip.trip_id}
                        </span>
                        <span className="text-xs text-gray-500">Servicio ID: {trip.service_id}</span>
                      </div>
                      <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                        {utreraStop ? `Salida en Utrera: ${utreraStop.departure_time}` : `Paso por Utrera disponible`}
                      </div>
                    </div>

                    <div className="text-xs text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-200">
                      <div><strong className="text-gray-900">Origen:</strong> {firstStop.stop_name} ({firstStop.departure_time})</div>
                      <div><strong className="text-gray-900">Destino:</strong> {lastStop.stop_name} ({lastStop.arrival_time})</div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      <span>Paradas totales: {trip.stops.length} estaciones en ruta.</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 flex items-start space-x-3">
        <span className="text-lg">ℹ️</span>
        <div>
          <strong className="font-semibold">Nota de Auditoría Estructural GTFS:</strong> Los horarios mostrados proceden directamente del feed oficial de Fomento/Renfe y se mantienen con sus identificadores y coordenadas originales. Estado: <span className="underline font-bold">PENDIENTE_CONTRASTE_COMERCIAL</span> frente a folletos impresos de Renfe.
        </div>
      </div>
    </div>
  );
}