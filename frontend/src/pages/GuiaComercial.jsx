// src/pages/GuiaComercial.jsx
import React, { useState, useEffect } from "react";
import { Phone, Navigation, Globe, Search, MapPin, ExternalLink, Image, FileText, Video, Zap, Sparkles, ShoppingBag } from "lucide-react";
import { obtenerComercios } from "../lib/comerciosService";

export default function GuiaComercial() {
  const [comercios, setComercios] = useState([]);
  const [categoriaSel, setCategoriaSel] = useState("Todos");
  const [comercioSel, setComercioSel] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [fotoAmpliada, setFotoAmpliada] = useState(null);
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

  const comerciosCarrusel = comercios.length > 0 ? comercios : [];

  useEffect(() => {
    if (comerciosCarrusel.length <= 1) return;
    const intervalo = setInterval(() => {
      setIndiceCarrusel((prev) => (prev + 1) % comerciosCarrusel.length);
    }, 2000);
    return () => clearInterval(intervalo);
  }, [comerciosCarrusel.length]);

  const normalizar = (texto) =>
    (texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

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

  const obtenerPortadaValida = (url) => {
    if (url && typeof url === 'string' && url.trim() !== "" && url !== "EMPTY" && url !== "NULL") {
      return url.trim();
    }
    return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5";
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 font-sans">
      
      {/* CABECERA HERO PREMIUM */}
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

        {/* CATEGORÍAS */}
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

        {/* CARRUSEL AUTOMÁTICO */}
        {comerciosCarrusel.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles size={14} className="text-amber-500" /> Comercios Destacados Utrera
              </h2>
              <div className="flex gap-1">
                {comerciosCarrusel.map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === indiceCarrusel ? 'w-5 bg-rose-900' : 'w-1.5 bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div 
              onClick={() => setComercioSel(comerciosCarrusel[indiceCarrusel])}
              className="relative bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-200 transition-all duration-500 cursor-pointer hover:shadow-xl"
            >
              <div className="h-36 w-full relative overflow-hidden bg-slate-900">
                <img 
                  src={obtenerPortadaValida(comerciosCarrusel[indiceCarrusel].portada_url)} 
                  alt={comerciosCarrusel[indiceCarrusel].nombre}
                  className="w-full h-full object-cover opacity-85 transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow">
                  ⭐ DESTACADO
                </span>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-base font-bold">{comerciosCarrusel[indiceCarrusel].nombre}</h3>
                  <p className="text-[11px] text-slate-200 truncate">{comerciosCarrusel[indiceCarrusel].descripcion || comerciosCarrusel[indiceCarrusel].subcategoria || comerciosCarrusel[indiceCarrusel].categoria}</p>
                </div>
              </div>
              <div className="p-3 bg-white flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                  <MapPin size={12} className="text-rose-700 flex-shrink-0" /> {comerciosCarrusel[indiceCarrusel].direccion || "Utrera"}
                </span>
                <span className="text-xs font-bold text-rose-900 bg-rose-50 px-3 py-1 rounded-xl">
                  Ver Ficha ➔
                </span>
              </div>
            </div>
          </div>
        )}

        {/* LISTA DE COMERCIOS */}
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
                        src={obtenerPortadaValida(comercio.portada_url)}
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
                src={obtenerPortadaValida(comercioSel.portada_url)}
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
              {comercioSel.logo_url && comercioSel.logo_url !== "EMPTY" && comercioSel.logo_url !== "NULL" && (
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

            {/* 🏠 RENDERIZADO ESPECIAL 1: INMOBILIARIAS */}
            {comercioSel.tipo_ficha === 'especial1' && comercioSel.datos_especiales && (
              <div className="mt-6 space-y-4 border-t pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black text-slate-900">
                    🏠 {comercioSel.datos_especiales.titulo_seccion_catalogo || 'Inmuebles Destacados'}
                  </h3>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Inmobiliaria Verificada
                  </span>
                </div>

                {/* LISTADO DE INMUEBLES DEL JSON */}
                <div className="grid grid-cols-1 gap-4">
                  {comercioSel.datos_especiales.items && comercioSel.datos_especiales.items.map((inmueble, idx) => {
                    const mensajeWhatsApp = encodeURIComponent(
                      `¡Hola! Estoy interesado en el inmueble con referencia *${inmueble.referencia_interna || 'REF'}* (${inmueble.titulo}) que he visto en Utrerapp. ¿Podrían darme más información?`
                    );
                    const urlWhatsApp = `https://wa.me/${comercioSel.whatsapp}?text=${mensajeWhatsApp}`;

                    return (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                        {inmueble.etiqueta_destacado && (
                          <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                            {inmueble.etiqueta_destacado}
                          </span>
                        )}

                        <div className="flex justify-between items-start mb-2 pr-12">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {inmueble.modalidad || 'Venta'} • Ref: {inmueble.referencia_interna || 'N/A'}
                            </span>
                            <h4 className="text-sm font-black text-slate-900 mt-0.5">{inmueble.titulo}</h4>
                            <p className="text-xs text-slate-500">{inmueble.subtitulo_zona}</p>
                          </div>
                        </div>

                        <div className="my-3">
                          <span className="text-lg font-black text-blue-600">{inmueble.precio}</span>
                        </div>

                        {inmueble.caracteristicas_clave && (
                          <div className="flex flex-wrap gap-2 my-3 text-[11px] font-semibold text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                            {Object.entries(inmueble.caracteristicas_clave).map(([clave, valor], i) => (
                              <span key={i} className="bg-slate-100 px-2 py-1 rounded-lg">
                                {clave}: <strong className="text-slate-900">{valor}</strong>
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-xs text-slate-600 mb-4 line-clamp-2">{inmueble.descripcion}</p>

                        <a
                          href={urlWhatsApp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                        >
                          <span>💬 Preguntar por este inmueble</span>
                        </a>
                      </div>
                    );
                  })}
                </div>

                {comercioSel.datos_especiales.mostrar_boton_captacion && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center space-y-2 mt-4">
                    <p className="text-xs font-bold text-blue-900">¿Quieres vender o alquilar tu casa en Utrera?</p>
                    <a
                      href={`https://wa.me/${comercioSel.whatsapp}?text=${encodeURIComponent(`Hola, me gustaría solicitar más información sobre vuestros servicios de tasación y captación visto en Utrerapp.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow cursor-pointer"
                    >
                      {comercioSel.datos_especiales.texto_boton_captacion || 'Solicitar valoración gratuita'}
                    </a>
                  </div>
                )}
              </div>
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
            {comercioSel.galeria_urls && Array.isArray(comercioSel.galeria_urls) && comercioSel.galeria_urls.filter(url => url && typeof url === 'string' && url.trim() !== "" && url !== "EMPTY").length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Image size={14} /> Fotos de las instalaciones y productos
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                  {comercioSel.galeria_urls.map((url, i) => (
                    url && typeof url === 'string' && url.trim() !== "" && url !== "EMPTY" && (
                      <div 
                        key={i} 
                        onClick={() => setFotoAmpliada(url.trim())}
                        className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 cursor-pointer hover:opacity-90 snap-start"
                      >
                        <img src={url.trim()} alt={"Imagen " + i} className="w-full h-full object-cover" />
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* BOTÓN CARTA / MENÚ EN PDF */}
            {(() => {
              const cartaUrl = comercioSel.carta_pdf_url;
              if (cartaUrl && typeof cartaUrl === 'string' && cartaUrl.trim() !== "" && cartaUrl !== "EMPTY" && cartaUrl !== "NULL") {
                return (
                  <a
                    href={cartaUrl.trim()}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <FileText size={16} /> Ver Carta / Menú en PDF <ExternalLink size={12} />
                  </a>
                );
              }
              return null;
            })()}

            {/* Contactos */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {comercioSel.whatsapp && comercioSel.whatsapp !== "EMPTY" && (
                <a
                  href={"https://wa.me/" + comercioSel.whatsapp.replace("+", "").replace(/\s/g, "")}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer"
                >
                  💬 WhatsApp
                </a>
              )}

              {comercioSel.telefono && comercioSel.telefono !== "EMPTY" && (
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

            {/* Web, Tienda Online y Redes Sociales */}
            <div className="mt-3 space-y-2">
              {comercioSel.web_url && comercioSel.web_url !== "EMPTY" && (
                <a
                  href={comercioSel.web_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <Globe size={15} /> Sitio Web Oficial <ExternalLink size={12} />
                </a>
              )}

              {comercioSel.tienda_url && comercioSel.tienda_url !== "EMPTY" && (
                <a
                  href={comercioSel.tienda_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <ShoppingBag size={15} /> Tienda Online <ExternalLink size={12} />
                </a>
              )}

              <div className="grid grid-cols-3 gap-2 pt-1">
                {comercioSel.instagram_username && comercioSel.instagram_username !== "EMPTY" && (
                  <a
                    href={comercioSel.instagram_username.startsWith('http') ? comercioSel.instagram_username : `https://instagram.com/${comercioSel.instagram_username.replace('@','')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow cursor-pointer truncate px-2"
                  >
                    📸 Instagram
                  </a>
                )}

                {comercioSel.facebook_url && comercioSel.facebook_url !== "EMPTY" && (
                  <a
                    href={comercioSel.facebook_url}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow cursor-pointer truncate px-2"
                  >
                    📘 Facebook
                  </a>
                )}

                {comercioSel.tiktok_username && comercioSel.tiktok_username !== "EMPTY" && (
                  <a
                    href={comercioSel.tiktok_username.startsWith('http') ? comercioSel.tiktok_username : `https://tiktok.com/@${comercioSel.tiktok_username.replace('@','')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow cursor-pointer truncate px-2"
                  >
                    🎵 TikTok
                  </a>
                )}
              </div>
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