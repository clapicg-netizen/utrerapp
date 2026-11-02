// src/components/LandingComercio.jsx
import React from 'react';
import { Globe, ShoppingBag, MessageCircle, Phone, MapPin, Sparkles, ArrowRight, Navigation } from 'lucide-react';

export default function LandingComercio({ comercio }) {
  const portadaValida = comercio.portada_url && comercio.portada_url.trim() !== "" 
    ? comercio.portada_url 
    : "https://images.unsplash.com/photo-1555396273-367ea4eb4db5";

  // Limpiar dirección duplicada si la hubiera
  const direccionLimpia = comercio.direccion 
    ? comercio.direccion.split(',')[0].trim() + ", Utrera, Sevilla"
    : "Utrera, Sevilla";

  const urlGoogleMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(comercio.nombre + " " + direccionLimpia)}`;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 font-sans space-y-5 pb-6">
      
      {/* 1. CABECERA CON IMAGEN DE PORTADA Y DEGRADADO */}
      <div className="relative h-48 sm:h-56 w-full bg-slate-900">
        <img 
          src={portadaValida} 
          alt={comercio.nombre} 
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
        
        <div className="absolute top-3 right-3">
          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
            <Sparkles size={12} /> Destacado VIP
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">{comercio.nombre}</h1>
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wider drop-shadow">
            {comercio.subcategoria && comercio.subcategoria.toLowerCase().includes('landing') ? 'Electrodomésticos, Tecnología, Descanso' : (comercio.subcategoria || comercio.categoria)}
          </p>
        </div>
      </div>

      <div className="px-5 space-y-5">

        {/* 2. DIRECCIÓN Y BOTÓN DE GEOLOCALIZACIÓN / CÓMO LLEGAR */}
        <div className="flex items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-600 min-w-0">
            <MapPin size={16} className="text-rose-600 flex-shrink-0" />
            <span className="font-medium truncate">{direccionLimpia}</span>
          </div>
          <a
            href={urlGoogleMaps}
            target="_blank"
            rel="noreferrer"
            className="bg-rose-900 hover:bg-rose-950 text-white text-[11px] font-bold py-2 px-3 rounded-xl flex items-center gap-1 shadow transition flex-shrink-0"
          >
            <Navigation size={12} /> Cómo llegar
          </a>
        </div>

        {/* 3. DESCRIPCIÓN */}
        {comercio.descripcion && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Sobre nosotros</h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
              {comercio.descripcion}
            </p>
          </div>
        )}

        {/* 4. GALERÍA / OFERTAS DESTACADAS */}
        {comercio.galeria_urls && comercio.galeria_urls.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">🔥 Catálogo y Ofertas</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {comercio.galeria_urls.map((img, idx) => (
                <div key={idx} className="h-24 sm:h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm hover:scale-[1.02] transition duration-300">
                  <img src={img.trim()} alt="Oferta" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. BOTONES DE ACCIÓN PRINCIPALES (WEB Y TIENDA ONLINE) */}
        <div className="space-y-2 pt-1">
          {comercio.web_url && (
            <a
              href={comercio.web_url.startsWith('http') ? comercio.web_url : `https://${comercio.web_url}`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold py-3.5 px-4 rounded-2xl flex items-center justify-between shadow-md transition group"
            >
              <span className="flex items-center gap-2">
                <Globe size={16} className="text-amber-400" /> Sitio Web Oficial
              </span>
              <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition" />
            </a>
          )}

          {comercio.tienda_url && (
            <a
              href={comercio.tienda_url.startsWith('http') ? comercio.tienda_url : `https://${comercio.tienda_url}`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-black py-3.5 px-4 rounded-2xl flex items-center justify-between shadow-md transition group"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag size={16} /> Tienda Online / E-commerce
              </span>
              <ArrowRight size={14} className="text-slate-950 group-hover:translate-x-1 transition" />
            </a>
          )}
        </div>

        {/* 6. BOTONES DE CONTACTO DIRECTO (WHATSAPP Y LLAMAR) */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {comercio.whatsapp && (
            <a
              href={`https://wa.me/${comercio.whatsapp.replace("+", "").replace(/\s/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          )}

          {comercio.telefono && (
            <a
              href={`tel:${comercio.telefono}`}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-3 px-3 rounded-2xl flex items-center justify-center gap-2 border border-slate-200 transition"
            >
              <Phone size={16} className="text-emerald-600" /> Llamar
            </a>
          )}
        </div>

      </div>

    </div>
  );
}