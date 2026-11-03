// frontend/src/pages/Sanidad.jsx
import React, { useState } from "react";
import { ArrowLeft, Phone, MapPin, MessageCircle, ShieldCheck, Sparkles, Stethoscope, Smile, HeartPulse, Scissors, Settings } from "lucide-react";

export default function Sanidad({ setPaginaActual }) {
  const [categoriaActiva, setCategoriaActiva] = useState("todas");

  const categorias = [
    { id: "todas", label: "🌟 Ver Todo" },
    { id: "clinicas", label: "🏥 Clínicas" },
    { id: "dental", label: "🦷 Dentales" },
    { id: "estetica", label: "✨ Estética" },
  ];

  const centrosPrivados = [
    {
      id: 1,
      tipo: "dental",
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
      id: 2,
      tipo: "estetica",
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
    },
    {
      id: 3,
      tipo: "clinicas",
      nombre: "Policlínica San Francisco de Asís",
      categoria: "Especialidades Médicas",
      eslogan: "Especialistas en el cuidado de tu familia",
      registroSanitario: "Reg. Sanitario: NICA 51204",
      imagen: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
      especialidades: ["Traumatología", "Fisioterapia y Rehabilitación", "Cardiología", "Pediatría"],
      tecnologia: "Ecografía de Alta Resolución y Rayos X",
      medico: "Dr. Manuel Torres (Director Médico)",
      financiacion: "Planes de salud familiares adaptados",
      mutuas: "Principales Aseguradoras Médicas",
      direccion: "Paseo de Consolación 8, Utrera",
      horario: "L-V: 8:30 - 21:00",
      whatsapp: "34600000002",
      telefono: "955222222",
      mapaUrl: "https://www.google.com/maps/search/?api=1&query=Paseo+de+Consolacion+8+Utrera"
    }
  ];

  const centrosFiltrados = categoriaActiva === "todas" 
    ? centrosPrivados 
    : centrosPrivados.filter(c => c.tipo === categoriaActiva);

  return (
    <div className="max-w-md mx-auto p-4 pb-28 space-y-5 font-sans">
      
      {/* CABECERA */}
      <div className="bg-slate-900 text-white p-6 shadow-xl rounded-3xl relative overflow-hidden space-y-3">
        
        {/* BOTONES SUPERIORES: VOLVER Y GESTIÓN */}
        <div className="flex items-center justify-between relative z-10">
          {setPaginaActual && (
            <button 
              onClick={() => setPaginaActual("home")}
              className="inline-flex items-center gap-1.5 text-xs text-teal-300 bg-teal-950/80 px-3 py-1.5 rounded-full border border-teal-500/30 font-bold hover:bg-teal-900 transition cursor-pointer"
            >
              <ArrowLeft size={14} /> Volver al Inicio
            </button>
          )}

          {setPaginaActual && (
            <button 
              onClick={() => setPaginaActual("admin-sanidad")}
              className="inline-flex items-center gap-1 text-xs text-amber-300 bg-amber-950/80 px-3 py-1.5 rounded-full border border-amber-500/30 font-bold hover:bg-amber-900 transition cursor-pointer shadow"
            >
              <Settings size={13} /> Gestionar Clientes
            </button>
          )}
        </div>

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-teal-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              Exclusivo
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Sanidad y Estética Privada</h1>
          <p className="text-xs text-slate-300">Cuadro médico verificado y centros especializados en Utrera.</p>
        </div>
      </div>

      {/* NAVEGADOR DE CATEGORÍAS */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoriaActiva(cat.id)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              categoriaActiva === cat.id
                ? "bg-teal-900 text-white border border-teal-700"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* LISTADO DE FICHAS */}
      <div className="space-y-6">
        {centrosFiltrados.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl text-center space-y-2 border border-slate-200 shadow-sm">
            <p className="text-sm font-bold text-slate-800">No hay centros en esta categoría</p>
          </div>
        ) : (
          centrosFiltrados.map((centro) => (
            <article key={centro.id} className="bg-white rounded-3xl shadow-lg border-2 border-teal-500/30 overflow-hidden space-y-0">
              
              <div className="relative h-48 bg-slate-100">
                <img 
                  src={centro.imagen} 
                  alt={centro.nombre} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                  {centro.categoria}
                </div>
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {centro.registroSanitario}
                </div>
              </div>

              <div className="p-5 space-y-3">
                <h2 className="text-lg font-black text-slate-900">{centro.nombre}</h2>
                <p className="text-xs italic text-slate-600">"{centro.eslogan}"</p>

                <div className="flex flex-wrap gap-1">
                  {centro.especialidades.map((esp, i) => (
                    <span key={i} className="bg-teal-50 text-teal-800 text-xs px-2.5 py-1 rounded-lg font-medium">
                      {esp}
                    </span>
                  ))}
                </div>

                <div className="text-xs bg-slate-50 p-3 rounded-xl space-y-1 text-slate-700">
                  <p><strong>Tecnología:</strong> {centro.tecnologia}</p>
                  <p><strong>Especialista:</strong> {centro.medico}</p>
                  <p><strong>Financiación:</strong> {centro.financiacion}</p>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>📍 {centro.direccion}</p>
                  <p>🕒 {centro.horario}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 bg-slate-100 border-t border-slate-200 text-center text-xs font-black">
                <a href={`https://wa.me/${centro.whatsapp}`} target="_blank" rel="noopener noreferrer" className="py-3 text-emerald-700 hover:bg-emerald-50 flex items-center justify-center gap-1">
                  <MessageCircle size={14} /> WhatsApp
                </a>
                <a href={`tel:${centro.telefono}`} className="py-3 text-sky-700 hover:bg-sky-50 flex items-center justify-center gap-1 border-x border-slate-200">
                  <Phone size={14} /> Llamar
                </a>
                <a href={centro.mapaUrl} target="_blank" rel="noopener noreferrer" className="py-3 text-slate-800 hover:bg-slate-200 flex items-center justify-center gap-1">
                  <MapPin size={14} /> Cómo llegar
                </a>
              </div>

            </article>
          ))
        )}
      </div>

    </div>
  );
}