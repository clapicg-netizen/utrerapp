import React, { useState, useEffect } from "react";
import { Phone, Navigation, Globe, Search, MapPin, ExternalLink, Image, FileText, Video, Zap, Sparkles, Store, Utensils, ShoppingBag } from "lucide-react";
import { obtenerComercios } from "../lib/comerciosService";

export default function GuiaComercial() {
  const [comercios, setComercios] = useState([]);
  const [categoriaSel, setCategoriaSel] = useState("Todos");
  const [comercioSel, setComercioSel] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  // Estado para previsualizar una foto de la galería
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  // Estado para el carrusel automático de destacados (cambia cada 2 segundos)
  const [indiceCarrusel, setIndiceCarrusel] = useState(0);

  const categorias = ["Todos", "Hostelería", "Comercio", "Servicios", "Salud y Belleza"];

  useEffect(() => {
    cargarComercios();
  }, []);

  const cargarComercios = async () => {
    setCargando(true);
    try {
      const data = await obtenerComercios();
      setComercios(data || []);
    } catch (error) {
      console.error("Error al cargar los comercios:", error.message);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar comercios destacados para el carrusel
  const comerciosDestacados = comercios.filter(c => c.destacado);

  useEffect(() => {
    if (comerciosDestacados.length <= 1) return;
    const intervalo = setInterval(() => {
      setIndiceCarrusel((prev) => (prev + 1) % comerciosDestacados.length);
    }, 2000); // Rota cada 2 segundos exactos
    return () => clearInterval(intervalo);
  }, [comerciosDestacados.length]);

  // Función para normalizar texto (elimina tildes y convierte a minúsculas)
  const normalizar = (texto) =>
    (texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // Filtrado dual: por categoría seleccionada Y por texto de búsqueda
  const comerciosFiltrados = comercios.filter((c) => {
    const coincideCategoria =
      categoriaSel === "Todos" ||
      normalizar(c.categoria) === normalizar(categoriaSel) ||
      (c.subcategoria && normalizar(c.subcategoria).includes(normalizar(categoriaSel)));

    const coincideBusqueda =
      !busqueda.trim() ||
      normalizar(c.nombre).includes(normalizar(busqueda)) ||
      normalizar(c.descripcion).includes(normalizar(busqueda)) ||
      (c.subcategoria && normalizar(c.subcategoria).includes(normalizar(busqueda)));

    return coincideCategoria && coincideBusqueda;
  });

  const abrirMapa = (comercio) => {
    const direccionEscapada = encodeURIComponent((comercio.direccion || comercio.nombre) + ", Utrera");
    window.open("https://www.google.com/maps/search/?api=1&query=" + direccionEscapada, "_blank");
  };

  const obtenerYoutubeEmbed = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? "https://www.youtube.com/embed/" + match[2] : null;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 font-sans">
      
      {/* 🚀 CABECERA HERO PREMIUM */}
      <div className="bg-gradient-to-r from-rose-950 via-red-900 to-rose-900 text-white p-6 shadow-xl relative overflow-hidden rounded-b-[2.5rem]">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-rose-600/20 rounded-full blur-2xl"></div>
        <div className="max-w-md mx-auto relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} /> Directorio Oficial
            </span>
            <span className="text-xs text-rose-200 font-medium">Utrera 2026</span>
          </div>
          
          <h1 className="text-2xl font-black tracking-tight">Guía Comercial Utrera</h1>
          <p className="text-xs text-rose-100 leading-relaxed">
            Descubre el corazón comercial, bares y servicios de nuestra tierra en un solo lugar.
          </p>

          {/* Buscador Instantáneo */}
          <div className="relative pt-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Busca un bar, tienda, servicio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-md text-white placeholder-rose-200/70 pl-10 pr-4 py-3 rounded-2xl text-xs border border-white/20 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-5 space-y-6">

        {/* 🎠 CARRUSEL AUTOMÁTICO DE DESTACADOS (Cada 2 segundos) */}
        {comerciosDestacados.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles size={14} className="text-amber-500" /> Comercios Destacados
              </h2>
              <div className="flex gap-1">
                {comerciosDestacados.map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === indiceCarrusel ? 'w-5 bg-rose-900' : 'w-1.5 bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Tarjeta del Carrusel Activa */}
            <div 
              onClick={() => setComercioSel(comerciosDestacados[indiceCarrusel])}
              className="relative bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-200 transition-all duration-500 cursor-pointer hover:shadow-xl"
            >
              <div className="h-36 w-full relative overflow-hidden bg-slate-900">
                <img 
                  src={comerciosDestacados[indiceCarrusel].portada_url || comerciosDestacados[indiceCarrusel].logo_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"} 
                  alt={comerciosDestacados[indiceCarrusel].nombre}
                  className="w-full h-full object-cover opacity-85 transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow">
                  ⭐ PREMIUM
                </span>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-base font-bold">{comerciosDestacados[indiceCarrusel].nombre}</h3>
                  <p className="text-[11px] text-slate-200 truncate">{comerciosDestacados[indiceCarrusel].descripcion || comerciosDestacados[indiceCarrusel].subcategoria}</p>
                </div>
              </div>
              <div className="p-3 bg-white flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                  <MapPin size={12} className="text-rose-700 flex-shrink-0" /> {comerciosDestacados[indiceCarrusel].direccion || "Utrera"}
                </span>
                <span className="text-xs font-bold text-rose-900 bg-rose-50 px-3 py-1 rounded-xl">
                  Ver Ficha ➔
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 🗂️ CATEGORÍAS */}
        <div className="space-y-2">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Categorías</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSel(cat)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-sm cursor-pointer ${
                  categoriaSel === cat
                    ? "bg-rose-900 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 📋 LISTA DE COMERCIOS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Establecimientos ({comerciosFiltrados.length})
            </h2>
          </div>

          {cargando ? (
            <div className="text-center py-12 text-slate-400 text-sm">Cargando guía comercial...</div>
          ) : comerciosFiltrados.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <p className="text-slate-500 font-medium text-sm">No se encontraron comercios en esta categoría</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comerciosFiltrados.map((comercio) => (
                <div
                  key={comercio.id}
                  onClick={() => setComercioSel(comercio)}
                  className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                >
                  {comercio.destacado && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow">
                      ⭐ PREMIUM
                    </span>
                  )}

                  <div className="flex gap-4 items-start">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
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
              ))}
            </div>
          )}
        </div>

      </div>

      {/* MODAL FICHA DESPLEGABLE */}
      {comercioSel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl relative p-5 pb-24 sm:pb-8">
            
            <button
              onClick={() => setComercioSel(null)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full w-8 h-8 flex items-center justify-center font-bold z-10 cursor-pointer"
            >
              ✕
            </button>

            {/* Portada Principal */}
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

            {/* Cabecera con Logo */}
            <div className="flex items-center gap-3">
              {comercioSel.logo_url && comercioSel.logo_url !== "EMPTY" && (
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
                <MapPin size={14} className="text-slate-400" /> {comercioSel.direccion}
              </p>
            )}

            {/* Horario */}
            {comercioSel.horario_texto && comercioSel.horario_texto !== "EMPTY" && (
              <p className="text-xs text-slate-600 mt-1">
                ⏰ <span className="font-medium">{comercioSel.horario_texto}</span>
              </p>
            )}

            {/* OFERTA FLASH */}
            {comercioSel.oferta_flash && comercioSel.oferta_flash !== "EMPTY" && comercioSel.oferta_flash !== "NULL" && (
              <div className="mt-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3.5 rounded-2xl shadow-md border border-amber-400 flex items-start gap-3">
                <div className="bg-white/20 p-2 rounded-xl flex-shrink-0">
                  <Zap size={18} className="text-amber-100" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-100">
                    Oferta Flash / Promoción
                  </p>
                  <p className="text-xs font-bold leading-snug mt-0.5">
                    {comercioSel.oferta_flash}
                  </p>
                </div>
              </div>
            )}

            {/* Descripción */}
            {comercioSel.descripcion && (
              <p className="text-sm text-slate-600 mt-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {comercioSel.descripcion}
              </p>
            )}

            {/* VÍDEO PROMOCIONAL */}
            {comercioSel.video_story_url && comercioSel.video_story_url !== "EMPTY" && comercioSel.video_story_url !== "NULL" && (
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Video size={14} /> Vídeo Promocional
                </p>
                <div className="rounded-2xl overflow-hidden bg-black aspect-video relative shadow-md">
                  {obtenerYoutubeEmbed(comercioSel.video_story_url) ? (
                    <iframe
                      src={obtenerYoutubeEmbed(comercioSel.video_story_url)}
                      title="Vídeo promocional"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={comercioSel.video_story_url}
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            )}

            {/* GALERÍA DE FOTOS */}
            {comercioSel.galeria_urls && Array.isArray(comercioSel.galeria_urls) && comercioSel.galeria_urls.filter(url => url && url !== "EMPTY").length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Image size={14} /> Fotos de las instalaciones y productos
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                  {comercioSel.galeria_urls.map((url, i) => (
                    <div 
                      key={i} 
                      onClick={() => setFotoAmpliada(url)}
                      className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 cursor-pointer hover:opacity-90 snap-start"
                    >
                      <img src={url} alt={"Imagen " + i} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BOTÓN CARTA / MENÚ EN PDF */}
            {(comercioSel.carta_pdf_url || comercioSel.carta_pdf || comercioSel.carta_url || comercioSel.menu_pdf) && 
             (comercioSel.carta_pdf_url !== "EMPTY" && comercioSel.carta_pdf !== "EMPTY" && comercioSel.carta_url !== "EMPTY" && comercioSel.menu_pdf !== "EMPTY") && 
             (comercioSel.carta_pdf_url !== "NULL" && comercioSel.carta_pdf !== "NULL") && (
              <a
                href={comercioSel.carta_pdf_url || comercioSel.carta_pdf || comercioSel.carta_url || comercioSel.menu_pdf}
                target="_blank"
                rel="noreferrer"
                className="mt-4 w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <FileText size={16} /> Ver Carta / Menú en PDF <ExternalLink size={12} />
              </a>
            )}

            {/* Contactos */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {comercioSel.whatsapp && (
                <a
                  href={"https://wa.me/" + comercioSel.whatsapp.replace("+", "").replace(/\s/g, "")}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer"
                >
                  💬 WhatsApp
                </a>
              )}

              {comercioSel.telefono && (
                <a
                  href={"tel:" + comercioSel.telefono}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Phone size={14} className="text-emerald-600" /> Llamar
                </a>
              )}
            </div>

            {/* Mapa */}
            <button
              onClick={() => abrirMapa(comercioSel)}
              className="mt-2 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Navigation size={14} className="text-sky-600" /> Cómo Llegar
            </button>

            {/* Web */}
            <div className="mt-3 space-y-2">
              {(comercioSel.web_url || comercioSel.sitio_web) && (
                <a
                  href={comercioSel.web_url || comercioSel.sitio_web}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <Globe size={15} /> Sitio Web Oficial <ExternalLink size={12} />
                </a>
              )}
            </div>

          </div>
        </div>
      )}

      {/* AMPLIADOR DE FOTOGRAFÍAS */}
      {fotoAmpliada && (
        <div 
          onClick={() => setFotoAmpliada(null)}
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img src={fotoAmpliada} alt="Ampliación" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" />
        </div>
      )}

    </div>
  );
}