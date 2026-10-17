import React, { useState, useEffect } from "react";
import { Phone, Navigation, Globe, Search, MapPin, ExternalLink } from "lucide-react";
import { obtenerComercios } from "../lib/comerciosService";

export default function Market() {
  const [comercios, setComercios] = useState([]);
  const [categoriaSel, setCategoriaSel] = useState("Todos");
  const [comercioSel, setComercioSel] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const categorias = ["Todos", "Hostelería", "Comercio", "Servicios", "Salud y Belleza"];

  useEffect(() => {
    cargarComercios();
  }, [categoriaSel]);

  const cargarComercios = async () => {
    setCargando(true);
    const data = await obtenerComercios(categoriaSel);
    setComercios(data || []);
    setCargando(false);
  };

  const comerciosFiltrados = comercios.filter((c) =>
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.subcategoria?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirMapa = (comercio) => {
    const direccionEscapada = encodeURIComponent(`${comercio.direccion || comercio.nombre}, Utrera`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${direccionEscapada}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-800 font-sans">
      
      {/* Cabecera */}
      <div className="bg-slate-900 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold">Guía Comercial Utrera</h1>
        <p className="text-xs text-slate-400 mt-1">Encuentra los mejores comercios y servicios locales</p>
        
        {/* Buscador */}
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Buscar comercio, servicio o producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-slate-800 text-white placeholder-slate-400 pl-10 pr-4 py-3 rounded-2xl text-sm border border-slate-700 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
        </div>
      </div>

      {/* Categorías */}
      <div className="px-4 mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaSel(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
              categoriaSel === cat
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista de Comercios */}
      <div className="px-4 mt-4 space-y-4 max-w-lg mx-auto">
        {cargando ? (
          <div className="text-center py-12 text-slate-400 text-sm">Cargando guía comercial...</div>
        ) : comerciosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-slate-500 font-medium text-sm">No se encontraron comercios</p>
          </div>
        ) : (
          comerciosFiltrados.map((comercio) => (
            <div
              key={comercio.id}
              onClick={() => setComercioSel(comercio)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            >
              {comercio.destacado && (
                <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow">
                  ⭐ PREMIUM
                </span>
              )}

              <div className="flex gap-4 items-start">
                <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                  <img
                    src={comercio.portada_url || comercio.logo_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
                    alt={comercio.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-base truncate">{comercio.nombre}</h3>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-0.5">
                    {comercio.subcategoria || comercio.categoria}
                  </p>
                  
                  {comercio.direccion && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 truncate">
                      <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{comercio.direccion}</span>
                    </p>
                  )}

                  {comercio.descripcion && (
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                      {comercio.descripcion}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setComercioSel(comercio);
                }}
                className="mt-3 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors text-center flex items-center justify-center gap-1.5"
              >
                👁️ Ver Ficha Completa
              </button>
            </div>
          ))
        )}
      </div>

      {/* MODAL FICHA COMPLETA */}
      {comercioSel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative p-5">
            
            {/* Botón Cerrar */}
            <button
              onClick={() => setComercioSel(null)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full w-8 h-8 flex items-center justify-center font-bold z-10"
            >
              ✕
            </button>

            {/* Imagen Principal / Portada */}
            <div className="h-48 bg-slate-100 rounded-2xl overflow-hidden relative mb-4 border border-slate-100">
              <img
                src={comercioSel.portada_url || comercioSel.logo_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
                alt={comercioSel.nombre}
                className="w-full h-full object-cover"
              />
              {comercioSel.destacado && (
                <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                  ⭐ PREMIUM
                </span>
              )}
            </div>

            {/* Cabecera con Logo y Nombre */}
            <div className="flex items-center gap-3">
              {comercioSel.logo_url && comercioSel.portada_url && (
                <img 
                  src={comercioSel.logo_url} 
                  alt="Logo" 
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0" 
                />
              )}
              <div>
                <h2 className="text-2xl font-bold text-slate-800 leading-tight">{comercioSel.nombre}</h2>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mt-0.5">
                  {comercioSel.subcategoria || comercioSel.categoria}
                </p>
              </div>
            </div>

            {/* Dirección */}
            {comercioSel.direccion && (
              <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                📍 {comercioSel.direccion}
              </p>
            )}

            {/* Horario */}
            {comercioSel.horario_texto && (
              <p className="text-xs text-slate-600 mt-1">
                ⏰ <span className="font-medium">{comercioSel.horario_texto}</span>
              </p>
            )}

            {/* Descripción */}
            {comercioSel.descripcion && (
              <p className="text-sm text-slate-600 mt-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {comercioSel.descripcion}
              </p>
            )}

            {/* Contacto Directo: WhatsApp y Llamada */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {comercioSel.whatsapp && (
                <a
                  href={`https://wa.me/${comercioSel.whatsapp.replace(/\+/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  💬 WhatsApp
                </a>
              )}

              {comercioSel.telefono && (
                <a
                  href={`tel:${comercioSel.telefono}`}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Phone size={14} className="text-emerald-600" /> Llamar
                </a>
              )}
            </div>

            {/* Botón Cómo Llegar */}
            <button
              onClick={() => abrirMapa(comercioSel)}
              className="mt-2 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Navigation size={14} className="text-sky-600" /> Cómo Llegar
            </button>

            {/* Sitios Web y Tienda Online */}
            <div className="mt-3 space-y-2">
              {(comercioSel.sitio_web || comercioSel.web_url) && (
                <a
                  href={(comercioSel.sitio_web || comercioSel.web_url).startsWith('http') ? (comercioSel.sitio_web || comercioSel.web_url) : `https://${comercioSel.sitio_web || comercioSel.web_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
                >
                  <Globe size={15} /> Sitio Web Oficial <ExternalLink size={12} />
                </a>
              )}

              {comercioSel.tienda_online && (
                <a
                  href={comercioSel.tienda_online.startsWith('http') ? comercioSel.tienda_online : `https://${comercioSel.tienda_online}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
                >
                  🛒 Tienda Online <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Redes Sociales (Facebook, Instagram, TikTok) */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 justify-center">
              {comercioSel.facebook && (
                <a
                  href={comercioSel.facebook.startsWith('http') ? comercioSel.facebook : `https://${comercioSel.facebook}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1"
                >
                  📘 Facebook
                </a>
              )}

              {comercioSel.instagram && (
                <a
                  href={comercioSel.instagram.startsWith('http') ? comercioSel.instagram : `https://instagram.com/${comercioSel.instagram.replace('@','')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-pink-50 text-pink-700 hover:bg-pink-100 text-xs font-bold flex items-center gap-1"
                >
                  📸 Instagram
                </a>
              )}

              {comercioSel.tiktok && (
                <a
                  href={comercioSel.tiktok.startsWith('http') ? comercioSel.tiktok : `https://tiktok.com/@${comercioSel.tiktok.replace('@','')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-bold flex items-center gap-1"
                >
                  🎵 TikTok
                </a>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}