// src/pages/Farmacias.jsx
import React, { useState, useEffect } from "react";
import { Pill, Phone, MapPin, Clock, Search, HeartPulse } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Farmacias() {
  const [busqueda, setBusqueda] = useState("");
  const [farmacias, setFarmacias] = useState([]);
  const [loading, setLoading] = useState(true);

  const hoy = new Date();
  const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaActualFormateada = hoy.toLocaleDateString('es-ES', opcionesFecha);

  useEffect(() => {
    async function cargarFarmacias() {
      try {
        const { data, error } = await supabase
          .from('farmacias') // O tu tabla correspondiente en Supabase
          .select('*');

        if (error) throw error;
        if (data && data.length > 0) {
          setFarmacias(data);
        } else {
          // Datos de respaldo por si la tabla está vacía temporalmente
          setFarmacias([
            {
              id: 1,
              nombre: "Farmacia José Luis Algarín Pachón",
              boticario: "José Luis Algarín Pachón",
              direccion: "Corredera, 1, Utrera",
              telefono: "954860448",
              de_guardia: true,
              horario: "09:30 a 22:00 h (De Guardia)"
            },
            {
              id: 2,
              nombre: "Farmacia Ma Luz Ceballos Niebla",
              boticario: "Ma Luz Ceballos Niebla",
              direccion: "Avda. La Fontanilla, 38, Utrera",
              telefono: "955864368",
              de_guardia: false,
              horario: "09:30 a 22:00 h"
            },
            {
              id: 3,
              nombre: "Farmacia Rafael González",
              boticario: "Rafael González",
              direccion: "Cristo de los Afligidos, 74, Utrera",
              telefono: "954860213",
              de_guardia: false,
              horario: "09:30 a 22:00 h"
            },
            {
              id: 4,
              nombre: "Farmacia Pablo Troncoso López",
              boticario: "Pablo Troncoso López",
              direccion: "Avda. María Auxiliadora, 95, Utrera",
              telefono: "954860196",
              de_guardia: false,
              horario: "09:30 a 22:00 h"
            }
          ]);
        }
      } catch (err) {
        console.error("Error cargando farmacias:", err);
      } finally {
        setLoading(false);
      }
    }
    cargarFarmacias();
  }, []);

  const filtradas = farmacias.filter(f => 
    f.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    f.direccion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirMapa = (direccion) => {
    window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(direccion), "_blank");
  };

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
        {loading ? (
          <div className="text-center py-10 text-xs text-slate-500">Cargando farmacias...</div>
        ) : (
          filtradas.map((farmacia) => (
            <div
              key={farmacia.id}
              className={`p-4 rounded-2xl bg-white border shadow-sm transition-all ${
                farmacia.de_guardia ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200"
              }`}
            >
              {farmacia.de_guardia && (
                <span className="inline-block bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase mb-2 shadow-sm">
                  🚨 DE GUARDIA OFICIAL HOY
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
                <span className="font-semibold text-emerald-700">{farmacia.horario || "09:30 a 22:00 h"}</span>
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
          ))
        )}
      </div>

    </div>
  );
}