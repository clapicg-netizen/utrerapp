// src/pages/Farmacias.jsx
import React, { useState, useEffect } from "react";
import { Pill, Phone, MapPin, Clock, Search, HeartPulse, Calendar } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Farmacias() {
  const [guardiasHoy, setGuardiasHoy] = useState([]);
  const [todasFarmacias, setTodasFarmacias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  const hoy = new Date();
  const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaActualFormateada = hoy.toLocaleDateString('es-ES', opcionesFecha);

  // Obtener fecha actual en formato YYYY-MM-DD para consultar en Supabase
  const fechaStr = hoy.toISOString().split('T')[0];

  useEffect(() => {
    async function cargarDatosFarmacias() {
      try {
        setLoading(true);

        // 1. Cargar la guardia de hoy desde la tabla farmacias_calendario
        const { data: dataGuardia, error: errorGuardia } = await supabase
          .from('farmacias_calendario')
          .select('*')
          .eq('fecha', fechaStr);

        if (errorGuardia) throw errorGuardia;
        if (dataGuardia) setGuardiasHoy(dataGuardia);

        // 2. Cargar el listado general de farmacias de Utrera por si se busca alguna en concreto
        const { data: dataGeneral, error: errorGeneral } = await supabase
          .from('farmacias') // O tu tabla con el directorio general si la tienes
          .select('*');

        if (!errorGeneral && dataGeneral) {
          setTodasFarmacias(dataGeneral);
        }
      } catch (err) {
        console.error("Error al cargar las farmacias desde Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarDatosFarmacias();
  }, [fechaStr]);

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
            <p className="text-xs text-emerald-200 mt-0.5 capitalize flex items-center gap-1">
              <Calendar size={12} /> Utrera · {fechaActualFormateada}
            </p>
          </div>
        </div>

        {/* Buscador */}
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Buscar farmacia..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-emerald-950/60 text-white placeholder-emerald-300 pl-10 pr-4 py-3 rounded-2xl text-xs border border-emerald-700/50 focus:outline-none focus:border-emerald-400"
          />
          <Search className="absolute left-3.5 top-3.5 text-emerald-300" size={16} />
        </div>
      </div>

      <div className="px-4 mt-5 space-y-4 max-w-lg mx-auto">
        
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-500">Consultando guardia oficial...</div>
        ) : (
          <>
            {/* SECCIÓN DE GUARDIA OFICIAL DE HOY */}
            <div className="space-y-3">
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider px-1">
                🚨 Guardia Oficial para Hoy
              </h2>

              {guardiasHoy.length === 0 ? (
                <div className="bg-white p-6 rounded-3xl border border-amber-200 text-center space-y-2 shadow-sm">
                  <div className="text-2xl">⚠️</div>
                  <p className="font-bold text-slate-800 text-sm">No hay registro para la fecha de hoy</p>
                  <p className="text-xs text-slate-500">Asegúrate de haber introducido las filas en la tabla <code className="text-amber-600 font-mono">farmacias_calendario</code> en Supabase para el día <span className="font-bold">{fechaStr}</span>.</p>
                </div>
              ) : (
                guardiasHoy.map((farmacia) => (
                  <div
                    key={farmacia.id || farmacia.nombre_farmacia}
                    className="p-5 rounded-3xl bg-white border-2 border-emerald-500 shadow-md space-y-3 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-2xl uppercase tracking-wider">
                      Turno {farmacia.turno || 'Oficial'}
                    </div>

                    <span className="inline-block bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-emerald-200">
                      🚨 DE GUARDIA OFICIAL HOY
                    </span>

                    <div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight">{farmacia.nombre_farmacia}</h3>
                      {farmacia.boticario && <p className="text-xs text-slate-500 mt-0.5">Titular: {farmacia.boticario}</p>}
                    </div>

                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <MapPin size={14} className="text-emerald-600 flex-shrink-0" />
                      <span>{farmacia.direccion}</span>
                    </p>

                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Clock size={14} className="text-emerald-600 flex-shrink-0" />
                      <span className="font-bold text-emerald-700">{farmacia.horario || "09:30 a 22:00 h"}</span>
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <a
                        href={"tel:" + farmacia.telefono}
                        className="py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                      >
                        <Phone size={14} /> Llamar ({farmacia.telefono})
                      </a>
                      <button
                        onClick={() => abrirMapa(farmacia.direccion)}
                        className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MapPin size={14} /> Cómo Llegar
                      </button>
                    </div>

                    <div className="pt-1 flex items-center justify-center gap-1 text-[11px] font-medium text-slate-400 italic">
                      <HeartPulse size={13} className="text-emerald-500" />
                      <span>¡Que haya mejoría!</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}