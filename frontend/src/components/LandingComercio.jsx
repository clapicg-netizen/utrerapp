// src/components/LandingComercio.jsx
import React, { useState } from 'react';
import { Globe, ShoppingBag, MessageCircle, Phone, MapPin, Sparkles, ArrowRight, Navigation, LayoutGrid, Info, Layers } from 'lucide-react';

export default function LandingComercio({ comercio }) {
  // Estado para la pestaña activa ("general", "catalogo", "contacto")
  const [ pestañaActiva, setPestañaActiva ] = useState('general');

  // Estado para la imagen principal seleccionada desde la galería interactiva
  const portadaPorDefecto = comercio.portada_url && comercio.portada_url.trim() !== "" 
    ? comercio.portada_url 
    : "https://images.unsplash.com/photo-1555396273-367ea4eb4db5";

  const [ imagenPrincipal, setImagenPrincipal ] = useState(portadaPorDefecto);

  // Dirección limpia y enlace de Google Maps
  const direccionLimpia = comercio.direccion 
    ? comercio.direccion.split(',')[0].trim() + ", Utrera, Sevilla"
    : "Utrera, Sevilla";

  const urlGoogleMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(comercio.nombre + " " + direccionLimpia)}`;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 font-sans space-y-4 pb-6">
      
      {/* 1. CABECERA CORPORATIVA INTERACTIVA */}
      <div className="relative h-56 sm:h-64 w-full bg-slate-900 overflow-hidden">
        <img 
          src={imagenPrincipal} 
          alt={comercio.nombre} 
          className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
        
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
            <Sparkles size={12} /> Escaparate VIP
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">{comercio.nombre}</h1>
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wider drop-shadow">
            {comercio.subcategoria || comercio.categoria}
          </p>
        </div>
      </div>

      {/* 2. MENÚ DE PESTAÑAS INTERACTIVAS (ESTILO CORPORATIVO) */}
      <div className="px-5">
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setPestañaActiva('general')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              pestañaActiva === 'general' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Info size={14} /> Vista General
          </button>
          <button
            onClick={() => setPestañaActiva('catalogo')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              pestañaActiva === 'catalogo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers size={14} /> Catálogo ({comercio.galeria_urls?.length || 0})
          </button>
          <button
            onClick={() => setPestañaActiva('contacto')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              pestañaActiva === 'contacto' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin size={14} /> Ubicación
          </button>
        </div>
      </div>

      {/* 3. CONTENIDO DINÁMICO SEGÚN LA PESTAÑA SELECCIONADA */}
      <div className="px-5 space-y-4">

        {/* --- VISTA GENERAL --- */}
        {pestañaActiva === 'general' && (
          <div className="space-y-4 animate-fadeIn">
            {comercio.descripcion && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Acerca de nosotros</h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {comercio.descripcion}
                </p>
              </div>
            )}

            {/* Selector rápido de galería incrustado */}
            {comercio.galeria_urls && comercio.galeria_urls.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">📸 Pulsa para ver en grande</h3>
                  <button 
                    onClick={() => setPestañaActiva('catalogo')} 
                    className="text-[11px] font-bold text-amber-600 hover:underline cursor-pointer"
                  >
                    Ver todo →
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {comercio.galeria_urls.map((img, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setImagenPrincipal(img.trim())}
                      className={`h-20 rounded-2xl overflow-hidden border-2 cursor-pointer transition duration-200 ${
                        imagenPrincipal === img.trim() ? 'border-amber-500 shadow-md scale-95' : 'border-slate-200 hover:opacity-90'
                      }`}
                    >
                      <img src={img.trim()} alt="Miniatura" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- CATÁLOGO --- */}
        {pestañaActiva === 'catalogo' && (
          <div className="space-y-3 animate-fadeIn">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">🔥 Selecciona un producto del catálogo</h3>
            {comercio.galeria_urls && comercio.galeria_urls.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {comercio.galeria_urls.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      setImagenPrincipal(img.trim());
                      setPestañaActiva('general');
                    }}
                    className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 p-2 text-center cursor-pointer hover:border-amber-500 hover:shadow-md transition group"
                  >
                    <div className="h-28 rounded-xl overflow-hidden mb-2">
                      <img src={img.trim()} alt="Producto" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700">Ver en portada 🔍</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No hay elementos en el catálogo actualmente.</p>
            )}
          </div>
        )}

        {/* --- UBICACIÓN Y CONTACTO --- */}
        {pestañaActiva === 'contacto' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
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
          </div>
        )}

        {/* 4. BOTONES DE ACCIÓN PRINCIPALES (WEB Y TIENDA ONLINE) */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
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

        {/* 5. BOTONES DE CONTACTO DIRECTO (WHATSAPP Y LLAMAR) */}
        <div className="grid grid-cols-2 gap-2.5">
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