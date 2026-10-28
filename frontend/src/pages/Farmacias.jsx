// src/pages/Farmacias.jsx
import React, { useState, useEffect } from "react";
import { Pill, Phone, MapPin, Clock, Search, HeartPulse, Calendar, Sun, Moon, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Farmacias({ setPaginaActual }) {
  const [guardiasHoy, setGuardiasHoy] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");

  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  const fechaHoyStr = `${year}-${month}-${day}`;

  useEffect(() => {
    // Si no hay fecha seleccionada, por defecto cargamos la de hoy
    if (!fechaSeleccionada) {
      setFechaSeleccionada(fechaHoyStr);
    }
  }, [fechaHoyStr, fechaSeleccionada]);

  useEffect(() => {
    async function cargarGuardiasRango() {
      if (!fechaSeleccionada) return;
      try {
        setLoading(true);
        
        // Consulta robusta: Busca exactamente el día seleccionado en el calendario de Supabase
        const { data, error } = await supabase
          .from('farmacias_calendario')
          .select('*')
          .eq('fecha', fechaSeleccionada);

        if (error) throw error;
        setGuardiasHoy(data || []);
      } catch (err) {
        console.error("Error al cargar el calendario de farmacias:", err);
      } finally {
        setLoading(false);
      }
    }
    cargarGuardiasRango();
  }, [fechaSeleccionada]);

  const abrirMapa = (direccion) => {
    window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(direccion), "_blank");
  };

  const farmaciasFiltradas = guardiasHoy.filter(f => {
    const texto = busqueda.toLowerCase();
    const nombre = (f.nombre_farmacia || "").toLowerCase();
    const direccion = (f.direccion || "").toLowerCase();
    const boticario = (f.boticario || "").toLowerCase();
    return nombre.includes(texto) || direccion.includes(texto) || boticario.includes(texto);
  });

  // Modelo definitivo de separación por turnos
  const farmaciasDia = farmaciasFiltradas.filter(f => {
    const horario = (f.horario || "").toLowerCase();
    const turno = (f.turno || "").toLowerCase();
    if (horario.includes('22:00 a 9:30') || turno.includes('noche')) return false;
    return true;
  });

  const farmaciasNoche = farmaciasFiltradas.filter(f => {
    const horario = (f.horario || "").toLowerCase();
    const turno = (f.turno || "").toLowerCase();
    return horario.includes('22:00 a 9:30') || turno.includes('noche');
  });

  const fechaFormateadaUI = new Date(fechaSeleccionada + 'T00:00:00').toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 font-sans">
      
      {/* Cabecera */}
      <div className="bg-emerald-900 text-white p-6 rounded-b-3xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {setPaginaActual && (
              <button
                onClick={() => setPaginaActual('home')}
                className="w-9 h-9 rounded-xl bg-emerald-800/80 border border-emerald-700 flex items-center justify-center text-emerald-200 hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Pill size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Farmacias de Guardia</h1>
              <p className="text-xs text-emerald-200 mt-0.5 capitalize flex items-center gap-1">
                <Calendar size={12} /> Utrera · {fechaFormateadaUI}
              </p>
            </div>
          </div>
        </div>

        {/* SELECTOR DE FECHA (Permite consultar cualquier día hasta el 31 de diciembre) */}
        <div className="flex items-center gap-2 bg-emerald-950/60 p-2.5 rounded-2xl border border-emerald-700/50">
          <Calendar size={16} className="text-emerald-300 ml-1 shrink-0" />
          <span className="text-xs text-emerald-200 font-medium">Cambiar día:</span>
          <input
            type="date"
            value={fechaSeleccionada}
            min={fechaHoyStr}
            max="2026-12-31"
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            className="bg-emerald-900 text-white text-xs px-3 py-1.5 rounded-xl border border-emerald-600 focus:outline-none cursor-pointer font-mono"
          />
        </div>

        {/* Buscador */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar farmacia por nombre o calle..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-emerald-950/60 text-white placeholder-emerald-300 pl-10 pr-4 py-3 rounded-2xl text-xs border border-emerald-700/50 focus:outline-none focus:border-emerald-400"
          />
          <Search className="absolute left-3.5 top-3.5 text-emerald-300" size={16} />
        </div>
      </div>

      <div className="px-4 mt-5 space-y-6 max-w-lg mx-auto">
        
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-500">Consultando calendario oficial en Supabase...</div>
        ) : guardiasHoy.length === 0 ? (
          <div className="bg-white p-6 rounded-3xl border border-amber-200 text-center space-y-2 shadow-sm">
            <div className="text-2xl">⚠️</div>
            <p className="font-bold text-slate-800 text-sm">Sin registros para esta fecha</p>
            <p className="text-xs text-slate-500">No hay farmacias metidas en Supabase para el día <span className="font-bold">{fechaSeleccionada}</span>.</p>
          </div>
        ) : (
          <>
            {/* TURNO DE DÍA */}
            {farmaciasDia.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1 text-emerald-800 font-black text-xs uppercase tracking-wider">
                  <Sun size={15} className="text-amber-500" />
                  <span>Turno de Día (9:30 a 22:00 h)</span>
                </div>

                {farmaciasDia.map((farmacia, index) => (
                  <div key={farmacia.id || index} className="p-5 rounded-3xl bg-white border-2 border-emerald-500 shadow-md space-y-3 relative overflow-hidden">
                    <span className="inline-block bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-emerald-200">
                      🚨 GUARDIA OFICIAL DÍA
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
                      <a href={"tel:" + farmacia.telefono} className="py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors">
                        <Phone size={14} /> Llamar
                      </a>
                      <button onClick={() => abrirMapa(farmacia.direccion)} className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
                        <MapPin size={14} /> Mapa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TURNO DE NOCHE */}
            {farmaciasNoche.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 px-1 text-indigo-900 font-black text-xs uppercase tracking-wider">
                  <Moon size={15} className="text-indigo-600" />
                  <span>Turno de Noche (22:00 a 9:30 h)</span>
                </div>

                {farmaciasNoche.map((farmacia, index) => (
                  <div key={farmacia.id || index} className="p-5 rounded-3xl bg-white border-2 border-indigo-500 shadow-md space-y-3 relative overflow-hidden">
                    <span className="inline-block bg-indigo-50 text-indigo-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-indigo-200">
                      🌙 GUARDIA OFICIAL NOCHE
                    </span>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight">{farmacia.nombre_farmacia}</h3>
                      {farmacia.boticario && <p className="text-xs text-slate-500 mt-0.5">Titular: {farmacia.boticario}</p>}
                    </div>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <MapPin size={14} className="text-indigo-600 flex-shrink-0" />
                      <span>{farmacia.direccion}</span>
                    </p>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Clock size={14} className="text-indigo-600 flex-shrink-0" />
                      <span className="font-bold text-indigo-700">{farmacia.horario || "22:00 a 9:30 h"}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <a href={"tel:" + farmacia.telefono} className="py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors">
                        <Phone size={14} /> Llamar
                      </a>
                      <button onClick={() => abrirMapa(farmacia.direccion)} className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
                        <MapPin size={14} /> Mapa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="pt-2 flex items-center justify-center gap-1 text-[11px] font-medium text-slate-400 italic">
          <HeartPulse size={13} className="text-emerald-500" />
          <span>¡Mucho ánimo y que haya mejoría! ❤️</span>
        </div>

      </div>
    </div>
  );
}