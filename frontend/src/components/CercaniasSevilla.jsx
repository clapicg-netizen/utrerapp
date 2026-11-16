import React, { useMemo, useState } from 'react';
import schedules from '../data/cercanias_sevilla_schedules.json';

const RENFE_URL = 'https://www.renfe.com/es/es/cercanias/cercanias-sevilla';
const UTRERA = '51200';
const SEVILLA = '51003';

function toMinutes(time) {
  if (!/^\d{2}:\d{2}:\d{2}$/.test(time || '')) return NaN;
  const [h, m] = time.split(':').map(Number);
  if (h > 23 || m > 59) return NaN;
  return h * 60 + m;
}

function formatTime(time) {
  return time.slice(0, 5);
}

function getTrips(direction) {
  return schedules.flatMap((trip) => {
    const stops = trip.stops || [];
    const originId = direction === 'ida' ? UTRERA : SEVILLA;
    const destinationId = direction === 'ida' ? SEVILLA : UTRERA;

    const originIndex = stops.findIndex(
      (stop) => String(stop.stop_id) === originId
    );
    const destinationIndex = stops.findIndex(
      (stop) => String(stop.stop_id) === destinationId
    );

    if (originIndex < 0 || destinationIndex <= originIndex) return [];

    const departure = stops[originIndex].departure_time;
    const arrival = stops[destinationIndex].arrival_time;
    const start = toMinutes(departure);
    const end = toMinutes(arrival);

    if (!Number.isFinite(start) || !Number.isFinite(end)) return [];

    const duration = end - start;

    // Excluimos datos incoherentes; no los corregimos inventando horas.
    if (duration < 20 || duration > 90) return [];

    return [{
      id: trip.trip_id,
      departure: formatTime(departure),
      arrival: formatTime(arrival),
      duration,
      sortTime: start
    }];
  }).sort((a, b) => a.sortTime - b.sortTime);
}

export default function CercaniasSevilla() {
  const [direction, setDirection] = useState('ida');
  const trips = useMemo(() => getTrips(direction), [direction]);

  const origin = direction === 'ida' ? 'Utrera' : 'Sevilla-Santa Justa';
  const destination = direction === 'ida' ? 'Sevilla-Santa Justa' : 'Utrera';

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <header className="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 text-white shadow-lg">
        <div className="text-xs font-bold uppercase tracking-widest text-blue-200">
          Utrerapp · Movilidad
        </div>
        <h1 className="mt-3 text-3xl font-black">Cercanías Sevilla</h1>
        <p className="mt-2 text-sm text-blue-100">
          Consulta de trayectos entre Utrera y Sevilla
        </p>
        <div className="mt-5 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
          Línea C-1 · Utrera
        </div>
      </header>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-bold text-amber-950">
          ⚠️ Horarios históricos sin verificar
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-amber-900">
          Estos datos proceden de un archivo local cuya vigencia y calendario
          de circulación no están confirmados. No representan necesariamente
          los trenes de hoy. No incluyen retrasos ni cancelaciones.
          Comprueba siempre tu viaje en Renfe.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Selecciona tu trayecto
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDirection('ida')}
            aria-pressed={direction === 'ida'}
            className={`rounded-xl px-3 py-3 text-sm font-bold ${
              direction === 'ida'
                ? 'bg-indigo-950 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Utrera → Sevilla
          </button>
          <button
            type="button"
            onClick={() => setDirection('vuelta')}
            aria-pressed={direction === 'vuelta'}
            className={`rounded-xl px-3 py-3 text-sm font-bold ${
              direction === 'vuelta'
                ? 'bg-indigo-950 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Sevilla → Utrera
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          {origin} → {destination}
        </p>

        <div className="mt-4 space-y-3">
          {trips.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              No hay horarios coherentes disponibles en el archivo local.
            </p>
          ) : (
            trips.map((trip) => (
              <div
                key={trip.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <div className="flex items-center gap-2 text-xl font-black text-slate-900">
                    <span>{trip.departure}</span>
                    <span className="text-sm text-slate-400">→</span>
                    <span>{trip.arrival}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Duración calculada: {trip.duration} min
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                  Sin verificar
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <a
        href={RENFE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center rounded-xl bg-indigo-950 px-5 py-4 text-sm font-bold text-white hover:bg-indigo-800"
      >
        Consultar horarios oficiales en Renfe ↗
      </a>

      <p className="text-center text-xs text-slate-500">
        Utrerapp no ofrece información ferroviaria en tiempo real.
      </p>
    </main>
  );
}
