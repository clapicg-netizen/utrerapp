import React, { useState } from "react";
import { Train, Clock, ArrowRight, ExternalLink, Compass, Bus, Navigation, MapPin } from "lucide-react";

export default function Transporte() {
  const [subSeccion, setSubSeccion] = useState("renfe");
  const [sentido, setSentido] = useState("sevilla");

  const horariosSevilla = [
    { hora: "06:15", tipo: "Cercanías C1", estado: "Puntual", destino: "Sevilla - Santa Justa" },
    { hora: "06:45", tipo: "Cercanías C1", estado: "Puntual", destino: "Sevilla - Santa Justa" },
    { hora: "07:15", tipo: "Cercanías C1", estado: "Puntual", destino: "Sevilla - Santa Justa" },
    { hora: "07:40", tipo: "Cercanías C1", estado: "Frecuente", destino: "Sevilla - Santa Justa" },
    { hora: "08:10", tipo: "Cercanías C1", estado: "Puntual", destino: "Sevilla - Santa Justa" },
    { hora: "08:45", tipo: "Cercanías C1", estado: "Puntual", destino: "Sevilla - Santa Justa" },
    { hora: "09:30", tipo: "Cercanías C1", estado: "Puntual", destino: "Sevilla - Santa Justa" },
    { hora: "10:15", tipo: "Cercanías C1", estado: "Puntual", destino: "Sevilla - Santa Justa" },
  ];

  const horariosUtrera = [
    { hora: "07:00", tipo: "Cercanías C1", estado: "Puntual", destino: "Utrera" },
    { hora: "08:00", tipo: "Cercanías C1", estado: "Puntual", destino: "Utrera" },
    { hora: "13:30", tipo: "Cercanías C1", estado: "Puntual", destino: "Utrera" },
    { hora: "14:15", tipo: "Cercanías C1", estado: "Puntual", destino: "Utrera" },
    { hora: "15:05", tipo: "Cercanías C1", estado: "Puntual", destino: "Utrera" },
    { hora: "17:30", tipo: "Cercanías C1", estado: "Puntual", destino: "Utrera" },
    { hora: "19:15", tipo: "Cercanías C1", estado: "Puntual", destino: "Utrera" },
    { hora: "21:30", tipo: "Cercanías C1", estado: "Puntual", destino: "Utrera" },
  ];

  const busesUrbana = [
    { id: 1, line: "L1", name: "Línea Urbana - Estación / Centro / Barriadas", frequency: "Cada 30 min en horas punta", next: ["08:00", "08:30", "09:00"] },
    { id: 2, line: "L2", name: "Línea Periférica - Polígonos y Zonas Deportivas", frequency: "Cada 45 min", next: ["08:15", "09:00", "09:45"] },
  ];

  const listaTrenes = sentido === "sevilla" ? horariosSevilla : horariosUtrera;

  return (
    <div className="max-w-md mx-auto p-4 pb-28 space-y-5 animate-fadeIn font-sans">
      
      {/* CABECERA */}
      <div className="bg-gradient-to-r from-sky-950 via-blue-900 to-sky-900 text-white p-6 shadow-xl rounded-3xl relative overflow-hidden space-y-2">
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl"></div>
        <div className="flex items-center justify-between relative z-10">
          <span className="bg-sky-400/20 text-sky-300 border border-sky-400/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Compass size={12} /> Movilidad Utrera
          </span>
          <span className="text-xs text-sky-200">Utrera 2026</span>
        </div>
        <h1 className="text-xl font-black tracking-tight relative z-10">Transporte y Conexiones</h1>
        <p className="text-xs text-sky-100 relative z-10">Consulta horarios de trenes, autobuses o planifica tu ruta exacta.</p>
      </div>

      {/* PESTAÑAS SELECTORAS */}
      <div className="grid grid-cols-3 gap-1.5 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={() => setSubSeccion("renfe")}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            subSeccion === "renfe" ? "bg-rose-900 text-white shadow" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Train size={14} /> Cercanías
        </button>
        <button
          onClick={() => setSubSeccion("bus")}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            subSeccion === "bus" ? "bg-rose-900 text-white shadow" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Bus size={14} /> Urbanos
        </button>
        <button
          onClick={() => setSubSeccion("moovit")}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            subSeccion === "moovit" ? "bg-rose-900 text-white shadow" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Navigation size={14} /> Rutas
        </button>
      </div>

      {/* CONTENIDO 1: CERCANÍAS RENFE */}
      {subSeccion === "renfe" && (
        <div className="space-y-4">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex gap-1">
            <button
              onClick={() => setSentido("sevilla")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                sentido === "sevilla" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>Utrera ➔ Sevilla</span> <ArrowRight size={12} />
            </button>
            <button
              onClick={() => setSentido("utrera")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                sentido === "utrera" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>Sevilla ➔ Utrera</span> <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-2.5">
            {listaTrenes.map((tren, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 text-white font-black text-xs px-2.5 py-2 rounded-xl">
                    {tren.hora}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900">{tren.tipo}</h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="text-blue-600" /> {tren.destino}
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {tren.estado}
                </span>
              </div>
            ))}
          </div>

          <a
            href="https://www.renfe.com/es/es/cercanias/cercanias-sevilla"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-white hover:bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-800 shadow-sm transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Train size={16} className="text-rose-600" /> Web Oficial Renfe Cercanías
            </span>
            <ExternalLink size={14} className="text-slate-400" />
          </a>
        </div>
      )}

      {/* CONTENIDO 2: AUTOBUSES URBANOS */}
      {subSeccion === "bus" && (
        <div className="space-y-3">
          {busesUrbana.map((bus) => (
            <div key={bus.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/10 text-amber-700 w-10 h-10 rounded-xl grid place-items-center font-black text-xs">
                  {bus.line}
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900">{bus.name}</h3>
                  <p className="text-[11px] text-slate-500">{bus.frequency}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {bus.next.map((t, i) => (
                  <div key={i} className="flex-1 text-center py-2 bg-slate-100 rounded-xl font-mono text-xs font-bold text-slate-700">
                    <Clock size={11} className="inline mr-1 text-amber-600" /> {t}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONTENIDO 3: PLANIFICADOR MOOVIT */}
      {subSeccion === "moovit" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-600 to-sky-700 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden space-y-4">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            
            <div className="flex items-center gap-2.5">
              <span className="bg-white/20 p-2.5 rounded-2xl text-white">
                <Navigation size={20} />
              </span>
              <div>
                <h3 className="text-sm font-black">Planificador de Trayectos</h3>
                <p className="text-[11px] text-sky-100">Utrera ➔ Sevilla / Plaza de Armas</p>
              </div>
            </div>

            <p className="text-xs text-sky-100 leading-relaxed">
              Calcula rutas combinadas de tren, autobús y metro en tiempo real con indicaciones paso a paso hasta tu destino.
            </p>

            <a
              href="https://moovitapp.com/tripplan/sevilla-3802/poi/Plaza%20de%20Armas/Utrera/en?fll=37.183365_-5.790053&tll=37.3929_-6.004052&utm_source=widget&utm_campaign=get_directions_button&widget_source_referrer=holautrera.com&o=1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white text-blue-700 hover:bg-sky-50 font-black text-xs py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Abrir Planificador en Moovit</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}

    </div>
  );
}