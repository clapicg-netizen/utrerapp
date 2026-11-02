// src/components/LandingComercio.jsx
import React from 'react';

export default function LandingComercio({ comercio }) {
  return (
    <div className="bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 p-6 space-y-6 font-sans">
      
      {/* Cabecera Impactante */}
      <div className="text-center space-y-2">
        <span className="bg-amber-500/10 text-amber-400 text-xs font-black uppercase px-3 py-1 rounded-full border border-amber-500/20">
          ✨ Presentación Exclusiva
        </span>
        <h1 className="text-3xl font-black tracking-tight">{comercio.nombre}</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {comercio.descripcion || "Tu tienda de confianza en Utrera con las mejores ofertas y productos para el hogar."}
        </p>
      </div>

      {/* Galería / Ofertas Destacadas */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">🔥 Ofertas y Destacados</h3>
        <div className="grid grid-cols-3 gap-2">
          {comercio.galeria_urls && comercio.galeria_urls.length > 0 ? (
            comercio.galeria_urls.map((img, idx) => (
              <div key={idx} className="h-24 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800">
                <img src={img} alt="Oferta" className="w-full h-full object-cover hover:scale-105 transition duration-300" />
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-xs text-slate-500 py-4">Cargando catálogo visual...</div>
          )}
        </div>
      </div>

      {/* Botones de Acción Directa */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {comercio.carta_pdf_url && (
          <a
            href={comercio.carta_pdf_url}
            target="_blank"
            rel="noreferrer"
            className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition"
          >
            🌐 Web Oficial / Catálogo
          </a>
        )}
        
        {comercio.whatsapp && (
          <a
            href={`https://wa.me/${comercio.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3.5 px-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition"
          >
            💬 WhatsApp
          </a>
        )}

        {comercio.telefono && (
          <a
            href={`tel:${comercio.telefono}`}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3.5 px-3 rounded-2xl flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            📞 Llamar Ahora
          </a>
        )}
      </div>

      {/* Pie de Landing */}
      <div className="text-center pt-2 border-t border-slate-800">
        <p className="text-[10px] text-slate-500">📍 {comercio.direccion || 'Utrera, Sevilla'}</p>
      </div>

    </div>
  );
}