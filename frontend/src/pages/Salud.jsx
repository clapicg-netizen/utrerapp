import React from "react";
import { HeartPulse, MapPin, Phone, Clock, ExternalLink, ShieldAlert, Sparkles, CalendarCheck } from "lucide-react";

export default function Salud({ setPaginaActual }) {
  const centros = [
    {
      nombre: "Hospital de Alta Resolución de Utrera",
      tipo: "Hospital / Urgencias 24h",
      direccion: "Av. Brigadas Internacionales, 0, 41710 Utrera, Sevilla",
      telefono: "955 83 90 01",
      horario: "Abierto 24 horas",
      badge: "Urgencias 24h",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      mapQuery: "Hospital de Alta Resolucion de Utrera"
    },
    {
      nombre: "Centro de Salud Utrera Norte 'Príncipe De Asturias'",
      tipo: "Centro de Salud",
      direccion: "C. Pablo Picasso, s/n, 41710 Utrera, Sevilla",
      telefono: "955 83 84 13",
      horario: "Lunes a Viernes (Apertura 8:00)",
      badge: "Atención Primaria",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      mapQuery: "Centro de Salud Utrera Norte Principe De Asturias"
    },
    {
      nombre: "Centro de Salud Utrera Sur",
      tipo: "Centro de Salud",
      direccion: "Gta. Pío XII, s/n, 41710 Utrera, Sevilla",
      telefono: "955 83 00 00",
      horario: "Lunes a Viernes (Apertura 8:00)",
      badge: "Atención Primaria",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      mapQuery: "Centro de Salud Utrera Sur"
    }
  ];

  return (
    <div className="max-w-md mx-auto p-4 pb-28 space-y-5 animate-fadeIn font-sans">
      
      {/* CABECERA */}
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 text-white p-6 shadow-xl rounded-3xl relative overflow-hidden space-y-2">
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl"></div>
        <div className="flex items-center justify-between relative z-10">
          <span className="bg-rose-400/20 text-rose-200 border border-rose-400/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <HeartPulse size={12} /> Sanidad Pública
          </span>
          <span className="text-xs text-rose-200">Utrera 2026</span>
        </div>
        <h1 className="text-xl font-black tracking-tight relative z-10">Centros de Salud y Urgencias</h1>
        <p className="text-xs text-rose-100 relative z-10">Consulta rápida de ubicaciones, teléfonos y atención médica en Utrera.</p>
      </div>

      {/* TARJETA DE CITA PREVIA MÉDICA */}
      <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-5 rounded-3xl shadow-lg space-y-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-28 h-28 bg-white/10 rounded-full blur-xl"></div>
        <div className="flex items-center gap-2.5 relative z-10">
          <span className="bg-emerald-500/20 text-emerald-300 p-2 rounded-xl">
            <CalendarCheck size={20} />
          </span>
          <div>
            <h3 className="text-sm font-black">Cita Previa Médica SAS</h3>
            <p className="text-[11px] text-emerald-200">Pide cita con tu médico de cabecera o enfermería</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 relative z-10">
          <a
            href="tel:955545060"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow"
          >
            <Phone size={14} />
            <span>Llamar Cita</span>
          </a>
          <a
            href="https://www.sspa.juntadeandalucia.es/servicioandaluzdesalud/clicsalud/pages/anonimo/agenda/pedirCita.jsf?opcionSeleccionada=MUPEDIRCITA"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow"
          >
            <span>ClicSalud+ Web</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* AVISO DE URGENCIAS */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
        <div className="bg-amber-500 text-white p-2 rounded-xl mt-0.5">
          <ShieldAlert size={18} />
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-black text-amber-900">¿Emergencia Sanitaria?</h3>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            En caso de urgencia vital extrema, llama directamente al servicio de emergencias o acude al Hospital de Alta Resolución.
          </p>
          <a
            href="tel:112"
            className="inline-block mt-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black px-4 py-2 rounded-xl shadow transition-colors"
          >
            📞 Llamar al 112 (Emergencias)
          </a>
        </div>
      </div>

      {/* LISTADO DE CENTROS */}
      <div className="space-y-4">
        {centros.map((centro, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border mb-1.5 ${centro.badgeColor}`}>
                  {centro.badge}
                </span>
                <h3 className="text-sm font-black text-slate-900">{centro.nombre}</h3>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p className="flex items-start gap-2">
                <MapPin size={14} className="text-rose-700 shrink-0 mt-0.5" />
                <span>{centro.direccion}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400 shrink-0" />
                <span>{centro.horario}</span>
              </p>
            </div>

            {/* BOTONES DE ACCIÓN (LLAMAR Y CÓMO LLEGAR) */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <a
                href={`tel:${centro.telefono.replace(/\s+/g, '')}`}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone size={13} className="text-rose-700" />
                <span>{centro.telefono}</span>
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(centro.mapQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-rose-900 hover:bg-rose-950 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Cómo llegar</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* BOTÓN CONSO TE INFORMA */}
      {setPaginaActual && (
        <button
          onClick={() => setPaginaActual("conso")}
          className="w-full bg-gradient-to-r from-rose-950 to-rose-900 text-white hover:from-rose-900 hover:to-rose-800 p-4 rounded-2xl flex items-center justify-between text-xs font-black shadow-md transition-all cursor-pointer group"
        >
          <span className="flex items-center gap-2.5">
            <span className="bg-amber-400 text-slate-950 p-1.5 rounded-xl text-sm shadow">🤖</span>
            <div className="text-left">
              <p className="text-sm font-black text-white">Conso te informa</p>
              <p className="text-[10px] text-rose-200 font-medium">Asistencia y consultas de salud en Utrera</p>
            </div>
          </span>
          <Sparkles size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
        </button>
      )}

    </div>
  );
}