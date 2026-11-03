// frontend/src/pages/Salud.jsx
import React from "react";
import { HeartPulse, MapPin, Phone, Clock, ExternalLink, ShieldAlert, Sparkles, CalendarCheck, Stethoscope, MessageCircle } from "lucide-react";

export default function Salud({ setPaginaActual }) {
  // Clínicas Privadas (Socios Fundadores / Máxima Visibilidad)
  const centrosPrivados = [
    {
      nombre: "Clínica Médica y Dental Utrera",
      categoria: "Especialidades Médicas",
      eslogan: "Tu salud en manos expertas",
      imagen: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600",
      especialidades: ["Fisioterapia Avanzada", "Odontología Integral", "Dermatología", "Análisis Clínicos"],
      tecnologia: "Ecografía 4D y TAC Dental",
      medico: "Dr. Antonio Gómez / Cuadro Colegiado",
      financiacion: "Financiación a medida sin intereses",
      mutuas: "Privado y Principales Mutuas",
      direccion: "Calle San Fernando 12, Utrera",
      horario: "Lunes a Viernes de 9:00 a 21:00",
      whatsapp: "34600000000",
      telefono: "955000000",
      mapaUrl: "https://maps.google.com"
    },
    {
      nombre: "Centro de Estética Avanzada & Láser",
      categoria: "Estética y Bienestar",
      eslogan: "Belleza y salud en armonía",
      imagen: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600",
      especialidades: ["Medicina Estética Facial", "Depilación Láser Diodo", "Tratamientos Corporales"],
      tecnologia: "Láser de Última Generación",
      medico: "Dra. Carmen Roldán",
      financiacion: "Facilidades de pago por sesiones",
      mutuas: "Servicio Privado Exclusivo",
      direccion: "Av. Los Naranjos 45, Utrera",
      horario: "Lunes a Sábado de 10:00 a 20:00",
      whatsapp: "34600000001",
      telefono: "955111111",
      mapaUrl: "https://maps.google.com"
    }
  ];

  const centrosPublicos = [
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
            <HeartPulse size={12} /> Guía Sanitaria Utrera
          </span>
          <span className="text-xs text-rose-200">Utrera 2026</span>
        </div>
        <h1 className="text-xl font-black tracking-tight relative z-10">Sanidad y Centros Médicos</h1>
        <p className="text-xs text-rose-100 relative z-10">Asistencia pública, urgencias y cuadro médico privado de máxima categoría.</p>
      </div>

      {/* ======================================================== */}
      {/* SECCIÓN 1: SANIDAD PRIVADA (MÁXIMA VISIBILIDAD - SOCIOS) */}
      {/* ======================================================== */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Sanidad Privada y Estética</h2>
          </div>
          <span className="bg-teal-100 text-teal-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Destacado Premium</span>
        </div>

        {centrosPrivados.map((centro, idx) => (
          <article key={idx} className="bg-white rounded-3xl shadow-md border-2 border-teal-500/40 overflow-hidden space-y-0">
            {/* Cabecera Tarjeta Privada */}
            <div className="relative">
              <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10 gap-2">
                <span className="bg-slate-900/85 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {centro.categoria}
                </span>
                <span className="bg-teal-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                  🛡️ Socio Fundador
                </span>
              </div>
              <div className="relative h-40 bg-slate-100">
                <img 
                  src={centro.imagen} 
                  alt={centro.nombre} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs px-4 py-2 italic font-medium">
                  "{centro.eslogan}"
                </div>
              </div>
            </div>

            {/* Cuerpo de la Tarjeta */}
            <div className="p-4 space-y-3">
              <h3 className="text-base font-black text-slate-900">{centro.nombre}</h3>
              
              {/* Especialidades */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">Especialidades Destacadas</p>
                <div className="flex flex-wrap gap-1.5">
                  {centro.especialidades.map((esp, i) => (
                    <span key={i} className="bg-teal-50 text-teal-700 border border-teal-100 text-[11px] px-2.5 py-0.5 rounded-md font-medium">
                      {esp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Info técnica */}
              <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-1">
                <p><strong>Tecnología:</strong> {centro.tecnologia}</p>
                <p><strong>Especialista:</strong> {centro.medico}</p>
              </div>

              {/* Facilidades */}
              <div className="flex flex-wrap gap-2">
                <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-md font-medium">
                  💳 {centro.financiacion}
                </span>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-md font-medium">
                  🏥 {centro.mutuas}
                </span>
              </div>

              {/* Ubicación y Horarios */}
              <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 space-y-1">
                <p className="flex items-center gap-1">📍 {centro.direccion}</p>
                <p className="flex items-center gap-1">🕒 {centro.horario}</p>
              </div>
            </div>

            {/* Botones de Acción Directa */}
            <div className="grid grid-cols-3 bg-slate-50 border-t border-slate-200 text-center text-xs font-bold">
              <a href={`https://wa.me/${centro.whatsapp}`} target="_blank" rel="noopener noreferrer" className="py-3 text-emerald-600 hover:bg-slate-100 transition flex items-center justify-center gap-1">
                <MessageCircle size={14} /> WhatsApp
              </a>
              <a href={`tel:${centro.telefono}`} className="py-3 text-sky-600 hover:bg-slate-100 transition flex items-center justify-center gap-1 border-x border-slate-200">
                <Phone size={14} /> Llamar
              </a>
              <a href={centro.mapaUrl} target="_blank" rel="noopener noreferrer" className="py-3 text-slate-700 hover:bg-slate-100 transition flex items-center justify-center gap-1">
                <MapPin size={14} /> Cómo llegar
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* ======================================================== */}
      {/* SECCIÓN 2: SANIDAD PÚBLICA Y URGENCIAS                      */}
      {/* ======================================================== */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">Sanidad Pública y Urgencias</h2>

        {/* TARJETA DE CITA PREVIA MÉDICA SAS */}
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

        {/* LISTADO DE CENTROS PÚBLICOS */}
        {centrosPublicos.map((centro, idx) => (
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