import React, { useState } from "react";
import { Pill, Phone, MapPin, Clock, Search, HeartPulse } from "lucide-react";

export default function Farmacias() {
  const [busqueda, setBusqueda] = useState("");

  const farmaciasUtrera = [
    {
      id: 1,
      nombre: "Farmacia Morales Guerrero, CB",
      boticario: "Farmacia Morales Guerrero",
      direccion: "Avda. Alcalde José Dorado, 5 - Bda. El Carmen, Utrera",
      telefono: "954864924",
      horarioGuardia: "De Guardia Hoy (24 Horas)",
    },
    {
      id: 2,
      nombre: "Farmacia José Luis Algarín Pachón",
      boticario: "José Luis Algarín Pachón",
      direccion: "Corredera, 1, Utrera",
      telefono: "954860448",
      horarioGuardia: "De Guardia Hoy (24 Horas)",
    },
    {
      id: 3,
      nombre: "Farmacia Rafael González",
      boticario: "Rafael González",
      direccion: "Cristo de los Afligidos, 74, Utrera",
      telefono: "954860213",
      horarioGuardia: "De Guardia Hoy (24 Horas)",
    },
    {
      id: 4,
      nombre: "Farmacia Pablo Troncoso López",
      boticario: "Pablo Troncoso López (El Charco)",
      direccion: "Avda. María Auxiliadora, 95, Utrera",
      telefono: "954860196",
      horarioGuardia: "De Guardia Hoy (24 Horas)",
    },
    {
      id: 5,
      nombre: "Farmacia Ma Luz Ceballos Niebla",
      boticario: "Ma Luz Ceballos Niebla",
      direccion: "Avda. La Fontanilla, 38, Utrera",
      telefono: "955864368",
      horarioGuardia: "De Guardia Hoy (24 Horas)",
    },
    {
      id: 6,
      nombre: "Farmacia Antonio Valdés Arenas",
      boticario: "Antonio Valdés Arenas",
      direccion: "Av. S. Juan Bosco, 96, Utrera",
      telefono: "955864951",
      horarioGuardia: "De Guardia Hoy (24 Horas)",
    }
  ];

  // Cálculo preciso: ajustado para que el cambio de guardia sea a las 09:00 h
  const ahora = new Date();
  const horaAjustada = new Date(ahora.getTime() - (9 * 60 * 60 * 1000));
  const inicioAnio = new Date(horaAjustada.getFullYear(), 0, 0);
  const diff = horaAjustada - inicioAnio;
  const unDia = 1000 * 60 * 60 * 24;
  const diaTurno = Math.floor(diff / unDia);
  
  const indiceGuardiaHoy = diaTurno % farmaciasUtrera.length;

  const farmaciasConGuardiaDinamica = farmaciasUtrera.map((f, index) => ({
    ...f,
    deGuardia: index === indiceGuardiaHoy
  }));

  const filtradas = farmaciasConGuardiaDinamica.filter(f => 
    f.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    f.direccion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirMapa = (direccion) => {
    window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(direccion), "_blank");
  };

  const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaActualFormateada = ahora.toLocaleDateString('es-ES', opcionesFecha);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 font-sans">
      
      {/* Cabecera */}
      <div className="bg-emerald-900 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Pill size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Farmacias de Guardia</h1>
            <p className="text-xs text-emerald-200 mt-0.5 capitalize">Utrera · {fechaActualFormateada}</p>
          </div>
        </div>

        {/* Buscador */}
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Buscar por calle o farmacia..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-emerald-950/60 text-white placeholder-emerald-300 pl-10 pr-4 py-3 rounded-2xl text-xs border border-emerald-700/50 focus:outline-none focus:border-emerald-400"
          />
          <Search className="absolute left-3.5 top-3.5 text-emerald-300" size={16} />
        </div>
      </div>

      {/* Lista de Farmacias */}
      <div className="px-4 mt-5 space-y-4 max-w-lg mx-auto">
        {filtradas.map((farmacia) => (
          <div
            key={farmacia.id}
            className={`p-4 rounded-2xl bg-white border shadow-sm transition-all ${
              farmacia.deGuardia ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200"
            }`}
          >
            {farmacia.deGuardia && (
              <span className="inline-block bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase mb-2 shadow-sm">
                🚨 DE GUARDIA HOY (Cambio a las 09:00h)
              </span>
            )}

            <h3 className="font-bold text-slate-900 text-base">{farmacia.nombre}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{farmacia.boticario}</p>

            <p className="text-xs text-slate-600 mt-2 flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-400 flex-shrink-0" />
              <span>{farmacia.direccion}</span>
            </p>

            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <Clock size={14} className="text-slate-400 flex-shrink-0" />
              <span className="font-semibold text-emerald-700">{farmacia.horarioGuardia}</span>
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
              <a
                href={"tel:" + farmacia.telefono}
                className="py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-100"
              >
                <Phone size={14} /> Llamar
              </a>
              <button
                onClick={() => abrirMapa(farmacia.direccion)}
                className="py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200"
              >
                <MapPin size={14} /> Cómo Llegar
              </button>
            </div>

            {/* Mensaje de cortesía */}
            <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-center gap-1 text-[11px] font-medium text-slate-400 italic">
              <HeartPulse size={13} className="text-emerald-500" />
              <span>¡Que haya mejoría!</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}