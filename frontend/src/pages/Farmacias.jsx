// src/pages/Farmacias.jsx
import React, { useState, useEffect } from "react";
import { Pill, Phone, MapPin, Clock, Search, HeartPulse, Calendar, Sun, Moon, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const madridClock = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

function pharmacyClock(now) {
  const { year, month, day, hour, minute } = Object.fromEntries(
    madridClock.formatToParts(now).map(({ type, value }) => [type, value]),
  );
  const previous = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) - 1));
  return {
    today: `${year}-${month}-${day}`,
    yesterday: previous.toISOString().slice(0, 10),
    minutes: Number(hour) * 60 + Number(minute),
  };
}

function visiblePharmacyShifts(rows, { today, yesterday, minutes }) {
  return rows.flatMap(row => {
    if (!row.nombre_farmacia?.trim()) return [];
    const hours = row.horario?.trim().match(/^(\d{1,2}):(\d\d)\s*(?:a|[-–])\s*(\d{1,2}):(\d\d)\s*h?$/i);
    if (!hours) return [];
    const [sh, sm, eh, em] = hours.slice(1).map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    if (sh > 23 || eh > 23 || sm > 59 || em > 59 || start === end) return [];

    const overnight = end < start;
    if (row.fecha === yesterday && overnight && minutes < end) {
      return [{ ...row, overnight, active: true, carryover: true }];
    }
    if (row.fecha !== today) return [];
    return [{ ...row, overnight, active: minutes >= start && (overnight || minutes < end) }];
  });
}

export default function Farmacias({ setPaginaActual }) {
  const [registros, setRegistros] = useState({ fecha: null, filas: [] });
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  const [hoy, setHoy] = useState(() => new Date());
  const opcionesFecha = { weekday: 'long', timeZone: 'Europe/Madrid', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaActualFormateada = hoy.toLocaleDateString('es-ES', opcionesFecha);
  const reloj = pharmacyClock(hoy);
  const { today: fechaStr, yesterday: fechaAnterior } = reloj;
  const guardiasHoy = visiblePharmacyShifts(registros.filas, reloj);

  useEffect(() => {
    let timer;
    function actualizarReloj() {
      clearTimeout(timer);
      const ahora = new Date();
      setHoy(ahora);
      timer = setTimeout(actualizarReloj, 60000 - (ahora.getTime() % 60000));
    }
    actualizarReloj();
    window.addEventListener('focus', actualizarReloj);
    document.addEventListener('visibilitychange', actualizarReloj);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', actualizarReloj);
      document.removeEventListener('visibilitychange', actualizarReloj);
    };
  }, []);

  useEffect(() => {
    let vigente = true;
    async function cargarGuardias() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('farmacias_calendario')
          .select('id,fecha,turno,horario,nombre_farmacia,boticario,direccion,telefono')
          .in('fecha', [fechaAnterior, fechaStr]);

        if (error) throw error;

        if (vigente) setRegistros({ fecha: fechaStr, filas: data || [] });
      } catch (err) {
        if (vigente) setRegistros({ fecha: fechaStr, filas: [] });
      } finally {
        if (vigente) setLoading(false);
      }
    }
    cargarGuardias();
    return () => { vigente = false; };
  }, [fechaAnterior, fechaStr]);

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

  const farmaciasDia = farmaciasFiltradas.filter(f => !f.overnight);
  const farmaciasNoche = farmaciasFiltradas.filter(f => f.overnight)
    .sort((a, b) => Number(b.active) - Number(a.active));

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-slate-800 font-sans">
      
      {/* Cabecera */}
      <div className="bg-emerald-900 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-3">
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
              <Calendar size={12} /> Utrera · {fechaActualFormateada}
            </p>
          </div>
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
        
        {loading || registros.fecha !== fechaStr ? (
          <div className="text-center py-12 text-xs text-slate-500">Consultando registros oficiales...</div>
        ) : guardiasHoy.length === 0 ? (
          <div className="bg-white p-6 rounded-3xl border border-amber-200 text-center space-y-2 shadow-sm">
            <div className="text-2xl">⚠️</div>
            <p className="font-bold text-slate-800 text-sm">Sin registros disponibles</p>
            <p className="text-xs text-slate-500">No hay registros verificados para esta fecha.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* TURNO DE DÍA */}
            {farmaciasDia.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1 text-emerald-800 font-black text-xs uppercase tracking-wider">
                  <Sun size={15} className="text-amber-500" />
                  <span>Turno de día</span>
                </div>

                {farmaciasDia.map((farmacia, index) => (
                  <div key={farmacia.id || index} className="p-5 rounded-3xl bg-white border-2 border-emerald-500 shadow-md space-y-3 relative overflow-hidden">
                    <span className="inline-block bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-emerald-200">
                      {farmacia.active ? 'Guardia de día activa ahora' : 'Guardia oficial de día'}
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
                      <span className="font-bold text-emerald-700">{farmacia.horario}</span>
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
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-2 px-1 text-indigo-900 font-black text-xs uppercase tracking-wider">
                  <Moon size={15} className="text-indigo-600" />
                  <span>Turno de noche</span>
                </div>

                {farmaciasNoche.map((farmacia, index) => (
                  <div key={farmacia.id || index} className="p-5 rounded-3xl bg-white border-2 border-indigo-500 shadow-md space-y-3 relative overflow-hidden">
                    <span className="inline-block bg-indigo-50 text-indigo-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-indigo-200">
                      {farmacia.active ? 'Guardia de noche activa ahora' : 'Guardia oficial de noche'}
                    </span>
                    {farmacia.carryover && <p className="text-xs text-indigo-700">Iniciada anoche</p>}
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
                      <span className="font-bold text-indigo-700">{farmacia.horario}</span>
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
          </div>
        )}

        <div className="pt-4 pb-4 flex items-center justify-center gap-1 text-[11px] font-medium text-slate-400 italic">
          <HeartPulse size={13} className="text-emerald-500" />
          <span>¡Mucho ánimo y que haya mejoría! ❤️</span>
        </div>

      </div>
    </div>
  );
}
