import React from 'react';

const RENFE_URL = 'https://www.renfe.com/es/es/cercanias/cercanias-sevilla';

export default function CercaniasSevilla() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <header className="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 text-white shadow-lg">
        <div className="text-xs font-bold uppercase tracking-widest text-blue-200">
          Utrerapp · Movilidad
        </div>

        <h1 className="mt-3 text-3xl font-black">
          Cercanías Sevilla
        </h1>

        <p className="mt-2 text-sm text-blue-100">
          Información ferroviaria de la estación de Utrera
        </p>

        <div className="mt-5 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
          Línea C-1 · Utrera
        </div>
      </header>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">⚠️</span>
          <div>
            <h2 className="font-bold text-amber-950">
              Horarios pendientes de verificación
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-900">
              Para evitar errores, Utrerapp no muestra horarios, retrasos,
              cancelaciones ni estados de circulación que no estén
              respaldados por información oficial verificada.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Consulta los horarios oficiales
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Consulta en Renfe las salidas, llegadas, horarios e información
          de servicio de Cercanías de Sevilla.
        </p>

        <a
          href={RENFE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-800"
        >
          Consultar Cercanías en Renfe
          <span aria-hidden="true">↗</span>
        </a>

        <p className="mt-3 text-xs text-slate-500">
          Se abrirá la página oficial de Renfe en una nueva pestaña.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-slate-900">
          Información importante
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>• Los horarios programados no garantizan que un tren circule.</li>
          <li>• Las incidencias y cancelaciones deben comprobarse en Renfe.</li>
          <li>• Utrerapp no presentará estimaciones como datos en tiempo real.</li>
        </ul>
      </section>
    </main>
  );
}
