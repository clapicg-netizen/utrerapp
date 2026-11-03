// src/components/TarjetaSanidad.jsx
import React from 'react';

export default function TarjetaSanidad({ centro }) {
  return (
    <article className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden max-w-xl mx-auto my-4 font-sans text-slate-800">
      {/* Cabecera y Badges */}
      <div className="relative">
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10 gap-2">
          <span className="bg-slate-900/85 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
            {centro.categoria || 'Clínica Médica'}
          </span>
          <span className="bg-emerald-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
            🛡️ Reg. Sanitario: {centro.registroSanitario || 'Verificado'}
          </span>
        </div>
        <div className="relative h-44 bg-slate-100">
          <img 
            src={centro.imagen || "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600"} 
            alt={centro.nombre} 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-sm px-4 py-3 italic">
            "{centro.eslogan || 'Tu salud en manos expertas'}"
          </div>
        </div>
      </div>

      {/* Cuerpo de la Tarjeta */}
      <div className="p-5">
        <h2 className="text-xl font-bold text-slate-900 mb-3">{centro.nombre}</h2>
        
        {/* Especialidades */}
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Especialidades Destacadas</p>
          <div className="flex flex-wrap gap-1.5">
            {centro.especialidades?.map((esp, index) => (
              <span key={index} className="bg-sky-50 text-sky-600 border border-sky-100 text-xs px-2.5 py-1 rounded-md font-medium">
                {esp}
              </span>
            ))}
          </div>
        </div>

        {/* Info técnica / Cuadro médico */}
        <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg mb-4 space-y-1">
          <p><strong>Tecnología:</strong> {centro.tecnologia || 'Equipamiento de última generación'}</p>
          <p><strong>Especialista:</strong> {centro.medico || 'Cuadro médico colegiado'}</p>
        </div>

        {/* Facilidades */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-md font-medium">
            💳 {centro.financiacion || 'Financiación a medida'}
          </span>
          <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-md font-medium">
            🏥 {centro.mutuas || 'Mutuas y Privado'}
          </span>
        </div>

        {/* Ubicación y Horarios */}
        <div className="text-xs text-slate-500 border-t border-slate-100 pt-3 space-y-1">
          <p>📍 {centro.direccion || 'Utrera'}</p>
          <p>🕒 {centro.horario || 'Lunes a Viernes'}</p>
        </div>
      </div>

      {/* Botones de Acción Directa (Móvil) */}
      <div className="grid grid-cols-3 bg-slate-50 border-t border-slate-200 text-center text-xs font-semibold">
        <a href={`https://wa.me/${centro.whatsapp || '34000000000'}`} target="_blank" rel="noopener noreferrer" className="py-3 text-emerald-600 hover:bg-slate-100 transition flex items-center justify-center gap-1">
          💬 WhatsApp
        </a>
        <a href={`tel:${centro.telefono || '000000000'}`} className="py-3 text-sky-600 hover:bg-slate-100 transition flex items-center justify-center gap-1 border-x border-slate-200">
          📞 Llamar
        </a>
        <a href={centro.mapaUrl || '#'} target="_blank" rel="noopener noreferrer" className="py-3 text-slate-600 hover:bg-slate-100 transition flex items-center justify-center gap-1">
          🗺️ Cómo llegar
        </a>
      </div>
    </article>
  );
}