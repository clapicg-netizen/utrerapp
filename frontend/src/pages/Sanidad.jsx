// frontend/src/pages/Sanidad.jsx
import React from "react";
import { ArrowLeft, Phone, MapPin, MessageCircle, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";

export default function Sanidad({ setPaginaActual }) {
  const centrosPrivados = [
    {
      nombre: "Clínica Dental Sonrisa Utrera",
      categoria: "Odontología Avanzada",
      eslogan: "Tu sonrisa en las mejores manos",
      registroSanitario: "Reg. Sanitario: NICA 45123",
      imagen: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800",
      especialidades: ["Ortodoncia Invisible", "Implantes 3D", "Blanqueamiento LED"],
      tecnologia: "Escáner intraoral 3D sin radiación",
      medico: "Dr. Alejandro Pérez (Col. 41410)",
      financiacion: "Hasta 36 meses sin intereses",
      mutuas: "Sanitas, Adeslas, Asisa",
      direccion: "Av. San Juan Bosco, 45, Utrera",
      horario: "L-V: 9:00 - 14:00 y 16:30 - 20:30",
      whatsapp: "34600000000",
      telefono: "955000000",
      mapaUrl: "https://www.google.com/maps/search/?api=1&query=Av.+San+Juan+Bosco+45+Utrera"
    },
    {
      nombre: "Centro Médico y Estética Avanzada Utrera",
      categoria: "Estética y Bienestar Integral",
      eslogan: "Ciencia y belleza para tu bienestar",
      registroSanitario: "Reg. Sanitario: NICA 48992",
      imagen: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
      especialidades: ["Medicina Estética Facial", "Depilación Láser Diodo", "Nutrición y Dietética", "Dermatología"],
      tecnologia: "Plataforma Láser Médico de Alta Potencia",
      medico: "Dra. Carmen Roldán (Col. 41890)",
      financiacion: "Facilidades de pago fraccionado",
      mutuas: "Consulta Privada Exclusiva",
      direccion: "Calle Álvarez Hazañas 14, Utrera",
      horario: "L-V: 10:00 - 20:00 (Sábados con cita previa)",
      whatsapp: "34600000001",
      telefono: "955111111",
      mapaUrl: "https://www.google.com/maps/search/?api=1&query=Calle+Alvarez+Hazanas+14+Utrera"
    }
  ];

  return (
    <div className="max-w-md mx-auto p-4 pb-28 space-y-5 animate-fadeIn font-sans">
      
      {/* CABECERA */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-950 text-white p-6 shadow-xl rounded-3xl relative overflow-hidden space-y-3">
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl"></div>
        
        {setPaginaActual && (
          <button 
            onClick={() => setPaginaActual("home")}
            className="inline-flex items-center gap-1.5 text-xs text-teal-300 bg-teal-950/80 px-3 py-1.5 rounded-full border border-teal-500/30 font-bold hover:bg-teal-900 transition cursor-pointer relative z-10"
          >
            <ArrowLeft size={14} /> Volver al Inicio
          </button>
        )}

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-teal-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              Exclusivo
            </span>
            <span className="text-xs text-teal-300 font-bold">Utrera 2026</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Salud y Estética Privada</h1>
          <p className="text-xs text-teal-100/90">Centros médicos, clínicas dentales y estética avanzada verificados en Utrera.</p>
        </div>
      </div>

      {/* LISTADO DE FICHAS GRANDES Y COMPLETAS */}
      <div className="space-y-6">
        {centrosPrivados.map((centro, idx) => (
          <article key={idx} className="bg-white rounded-3xl shadow-lg border-2 border-teal-500/30 overflow-hidden space-y-0">
            
            {/* Imagen Principal y Badges */}
            <div className="relative">
              <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10 gap-2">
                <span className="bg-slate-900/90 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md shadow">
                  {centro.categoria}
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                  <ShieldCheck size={12} /> {centro.registroSanitario}
                </span>
              </div>

              <div className="relative h-48 bg-slate-100">
                <img 
                  src={centro.imagen} 
                  alt={centro.nombre} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-xs px-4 py-2.5 italic font-medium">
                  "{centro.eslogan}"
                </div>
              </div>
            </div>

            {/* Contenido de la Ficha */}
            <div className="p-5 space-y-4">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">{centro.nombre}</h2>

              {/* Especialidades */}
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-black">Especialidades Destacadas</p>
                <div className="flex flex-wrap gap-1.5">
                  {centro.especialidades.map((esp, i) => (
                    <span key={i} className="bg-teal-50 text-teal-800 border border-teal-200/60 text-xs px-3 py-1 rounded-xl font-semibold">
                      {esp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Caja de Datos Técnicos y Médicos */}
              <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl space-y-1.5 shadow-inner">
                <p><strong>🔬 Tecnología:</strong> {centro.tecnologia}</p>
                <p><strong>👨‍⚕️ Especialista:</strong> {centro.medico}</p>
              </div>

              {/* Financiación y Mutuas */}
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-2.5 rounded-xl font-bold flex items-center gap-2">
                  <span>💳</span>
                  <span>{centro.financiacion}</span>
                </div>
                <div className="bg-indigo-50 text-indigo-800 border border-indigo-200 p-2.5 rounded-xl font-bold flex items-center gap-2">
                  <span>🏥</span>
                  <span>{centro.mutuas}</span>
                </div>
              </div>

              {/* Dirección y Horarios */}
              <div className="text-xs text-slate-600 border-t border-slate-100 pt-3 space-y-1.5">
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-teal-700 shrink-0" />
                  <span className="font-medium">{centro.direccion}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-400 shrink-0" />
                  <span className="font-medium">{centro.horario}</span>
                </p>
              </div>
            </div>

            {/* Botones de Acción Directa inferior */}
            <div className="grid grid-cols-3 bg-slate-100 border-t border-slate-200 text-center text-xs font-black">
              <a 
                href={`https://wa.me/${centro.whatsapp}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="py-3.5 text-emerald-700 hover:bg-emerald-50 transition flex items-center justify-center gap-1"
              >
                <MessageCircle size={15} /> WhatsApp
              </a>
              <a 
                href={`tel:${centro.telefono}`} 
                className="py-3.5 text-sky-700 hover:bg-sky-50 transition flex items-center justify-center gap-1 border-x border-slate-200"
              >
                <Phone size={15} /> Llamar
              </a>
              <a 
                href={centro.mapaUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="py-3.5 text-slate-800 hover:bg-slate-200 transition flex items-center justify-center gap-1"
              >
                <MapPin size={15} /> Cómo llegar
              </a>
            </div>

          </article>
        ))}
      </div>

      {/* BOTÓN CONSO TE INFORMA */}
      {setPaginaActual && (
        <button
          onClick={() => setPaginaActual("conso")}
          className="w-full bg-gradient-to-r from-teal-950 to-teal-900 text-white hover:from-teal-900 hover:to-teal-800 p-4 rounded-2xl flex items-center justify-between text-xs font-black shadow-md transition-all cursor-pointer group"
        >
          <span className="flex items-center gap-2.5">
            <span className="bg-amber-400 text-slate-950 p-1.5 rounded-xl text-sm shadow">🤖</span>
            <div className="text-left">
              <p className="text-sm font-black text-white">Conso te informa</p>
              <p className="text-[10px] text-teal-200 font-medium">Consultas sobre clínicas y salud en Utrera</p>
            </div>
          </span>
          <Sparkles size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
        </button>
      )}

    </div>
  );
}