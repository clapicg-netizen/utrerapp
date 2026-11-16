// src/pages/GuiaComercial.jsx
import React, { useState, useEffect } from "react";
import { Phone, Search, MapPin, Image, Sparkles } from "lucide-react";
import { obtenerComercios } from "../lib/comerciosService";
import { supabase } from "../lib/supabaseClient";
import FichaInmobiliaria from "./FichaInmobiliaria";
import FichaComida from "./FichaComida";
import EscaparateComercio, { ESCAPARATES } from "../components/EscaparateComercio";
import LandingComercio from "../components/LandingComercio";

export default function GuiaComercial({ categoriaInicial = "Todos", busquedaInicial = "" }) {
  const [comercios, setComercios] = useState([]);
  const [categoriaSel, setCategoriaSel] = useState(categoriaInicial);
  const [comercioSel, setComercioSel] = useState(null);
  const [busqueda, setBusqueda] = useState(busquedaInicial);
  const [cargando, setCargando] = useState(true);

  // Estados para Patrocinadores de la Guía
  const [sponsors, setSponsors] = useState([
    {
      id: "mocaibo-1",
      name: "Cafés Mocaibo",
      logo_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd",
      link: "https://mocaibo.com"
    }
  ]);
  const [currentIndexSponsor, setCurrentIndexSponsor] = useState(0);

  const [fotoAmpliada, setFotoAmpliada] = useState(null);
  const [indiceCarrusel, setIndiceCarrusel] = useState(0);

  const categorias = ["Todos", "Hostelería", "Comercio", "Servicios", "Salud y Belleza", "Inmobiliarias", "Formación"];

  useEffect(() => {
    cargarComercios();
    cargarSponsors();
  }, []);

  const cargarComercios = async () => {
    setCargando(true);
    try {
      const data = await obtenerComercios("Todos");
      setComercios(data || []);
    } catch (error) {
      console.error("Error al cargar los comercios:", error.message);
    } finally {
      setCargando(false);
    }
  };

  const cargarSponsors = async () => {
    try {
      const { data, error } = await supabase.from('sponsors').select('*').eq('active', true);
      if (!error && data && data.length > 0) {
        setSponsors(data);
      }
    } catch (e) {
      console.log("Usando patrocinador por defecto");
    }
  };

  // Rotación automática del carrusel de patrocinadores cada 3 segundos
  useEffect(() => {
    if (sponsors.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndexSponsor((prev) => (prev + 1) % sponsors.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [sponsors.length]);

  const comerciosCarrusel = comercios.length > 0 ? comercios : [];

  useEffect(() => {
    if (comerciosCarrusel.length <= 1) return;
    const intervalo = setInterval(() => {
      setIndiceCarrusel((prev) => (prev + 1) % comerciosCarrusel.length);
    }, 3000);
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

  const obtenerPortadaValida = (url) => {
    if (url && typeof url === 'string' && url.trim() !== "" && url !== "EMPTY" && url !== "NULL") {
      return url.trim();
    }
    return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5";
  };

  const escaparateSeleccionado = ESCAPARATES.some(({ id }) => id === String(comercioSel?.id));
  const currentSponsor = sponsors[currentIndexSponsor] || sponsors[0];

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

      <div className="max-w-md mx-auto px-4 pt-4 space-y-5">

        {/* MÓDULO DE PATROCINADORES OFICIALES CON CARRUSEL */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1">
              ⭐ Patrocinadores Oficiales
            </span>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-red-50 border border-amber-200/60 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src={currentSponsor.logo_url} 
                alt={currentSponsor.name} 
                className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0" 
              />
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-xs truncate">{currentSponsor.name}</h4>
                <span className="text-[9px] text-amber-700 font-medium">Patrocinador ({currentIndexSponsor + 1}/{sponsors.length})</span>
              </div>
            </div>
            {currentSponsor.link && (
              <a 
                href={currentSponsor.link} 
                target="_blank" 
                rel="noreferrer"
                className="bg-red-700 hover:bg-red-800 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex-shrink-0 ml-2"
              >
                Visitar
              </a>
            )}
          </div>
        </div>

        {/* CATEGORÍAS */}
        <div className="space-y-2">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Categorías</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSel(cat)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-sm cursor-pointer ${
                  categoriaSel === cat ? "bg-rose-900 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* LISTA DE COMERCIOS */}
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Establecimientos ({comerciosFiltrados.length})
          </h2>

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
                  <div className="flex gap-4 items-start">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
                      <img src={obtenerPortadaValida(comercio.portada_url)} alt={comercio.nombre} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-base truncate">{comercio.nombre}</h3>
                        {comercio.tipo_ficha === 'especial1' && (
                          <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-2 py-0.5 rounded-full">Inmobiliaria</span>
                        )}
                        {comercio.tipo_ficha === 'especial2' && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full">Comida VIP</span>
                        )}
                        {comercio.subcategoria && comercio.subcategoria.toLowerCase().includes('landing') && (
                          <span className="bg-purple-100 text-purple-800 text-[9px] font-black px-2 py-0.5 rounded-full">✨ Landing</span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-0.5">
                        {comercio.subcategoria || comercio.categoria}
                      </p>
                      
                      {comercio.direccion && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 truncate">
                          <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{comercio.direccion}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setComercioSel(comercio);
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors text-center cursor-pointer"
                    >
                      👁️ Ver Ficha Completa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* FICHA DEL COMERCIO */}
      {comercioSel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className={`bg-white rounded-t-3xl sm:rounded-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative ${escaparateSeleccionado ? "max-w-3xl" : "max-w-md p-5 pb-32"}`}>
            
            <button
              onClick={() => setComercioSel(null)}
              aria-label="Cerrar ficha"
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full w-8 h-8 flex items-center justify-center font-bold z-10 cursor-pointer"
            >
              ✕
            </button>

              <div>
                {/* SI ES FICHA ESPECIAL 1 (INMOBILIARIA) */}
                {escaparateSeleccionado ? (
                  <EscaparateComercio comercio={comercioSel} />
                ) : comercioSel.tipo_ficha === 'especial1' ? (
                  <FichaInmobiliaria negocioId={comercioSel.id} />
                ) : comercioSel.tipo_ficha === 'especial2' ? (
                  /* SI ES FICHA ESPECIAL 2 (COMIDA) */
                  <FichaComida negocioId={comercioSel.id} />
                ) : comercioSel.subcategoria && comercioSel.subcategoria.toLowerCase().includes('landing') ? (
                  /* SI LA SUBCATEGORÍA CONTIENE "LANDING" */
                  <div className="space-y-4">
                    <LandingComercio comercio={comercioSel} />
                  </div>
                ) : (
                  /* VISTA ESTÁNDAR COMPLETA CON VÍDEO INTELIGENTE, GALERÍA, REDES Y BOTONES */
                  <div>
                    <div className="h-48 bg-slate-100 rounded-2xl overflow-hidden relative mb-4 border">
                      <img src={obtenerPortadaValida(comercioSel.portada_url)} alt={comercioSel.nombre} className="w-full h-full object-cover" />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">{comercioSel.nombre}</h2>
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mt-0.5">
                        {comercioSel.subcategoria || comercioSel.categoria}
                      </p>
                    </div>

                    {comercioSel.direccion && (
                      <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                        <MapPin size={14} className="text-slate-400" /> {comercioSel.direccion}
                      </p>
                    )}

                    {comercioSel.descripcion && (
                      <p className="text-sm text-slate-600 mt-3 leading-relaxed bg-slate-50 p-3 rounded-xl border">
                        {comercioSel.descripcion}
                      </p>
                    )}

                    {/* VÍDEO PROMOCIONAL INTELIGENTE EN LA VISTA PÚBLICA */}
                    {comercioSel.video_story_url && typeof comercioSel.video_story_url === 'string' && comercioSel.video_story_url.trim() !== '' && (
                      <div className="mt-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                          🎬 Vídeo Promocional
                        </p>
                        {comercioSel.video_story_url.includes('youtube.com') || comercioSel.video_story_url.includes('youtu.be') ? (
                          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-sm border bg-black">
                            <iframe
                              className="absolute top-0 left-0 w-full h-full border-0"
                              src={
                                comercioSel.video_story_url.includes('watch?v=') 
                                  ? comercioSel.video_story_url.replace('watch?v=', 'embed/') 
                                  : comercioSel.video_story_url.includes('youtu.be/')
                                  ? `https://www.youtube.com/embed/${comercioSel.video_story_url.split('youtu.be/')[1]?.split('?')[0]}`
                                  : comercioSel.video_story_url
                              }
                              title={`Vídeo de ${comercioSel.nombre}`}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <div className="w-full h-48 rounded-2xl overflow-hidden bg-black border shadow-sm">
                            <video 
                              src={comercioSel.video_story_url.trim()} 
                              controls 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* GALERÍA DE FOTOS EN LA VISTA */}
                    {comercioSel.galeria_urls && Array.isArray(comercioSel.galeria_urls) && comercioSel.galeria_urls.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <Image size={14} /> Galería de Fotos
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {comercioSel.galeria_urls.map((url, i) => (
                            url && (
                              <div 
                                key={i} 
                                onClick={() => setFotoAmpliada(url.trim())}
                                className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border cursor-pointer hover:opacity-90"
                              >
                                <img src={url.trim()} alt={`Foto ${i}`} className="w-full h-full object-cover" />
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SITIO WEB Y TIENDA ONLINE EN LA VISTA PÚBLICA */}
                    {(comercioSel.web_url || comercioSel.tienda_url) && (
                      <div className="mt-4 pt-3 border-t flex gap-2">
                        {comercioSel.web_url && (
                          <a href={comercioSel.web_url.startsWith('http') ? comercioSel.web_url : `https://${comercioSel.web_url}`} target="_blank" rel="noreferrer" className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-center text-xs font-bold shadow flex items-center justify-center gap-1">
                            🌐 Web Oficial
                          </a>
                        )}
                        {comercioSel.tienda_url && (
                          <a href={comercioSel.tienda_url.startsWith('http') ? comercioSel.tienda_url : `https://${comercioSel.tienda_url}`} target="_blank" rel="noreferrer" className="flex-1 bg-amber-500 text-slate-950 py-2 rounded-xl text-center text-xs font-bold shadow flex items-center justify-center gap-1">
                            🛍️ Tienda Online
                          </a>
                        )}
                      </div>
                    )}

                    {/* REDES SOCIALES EN LA VISTA PÚBLICA */}
                    {(() => {
                      const insta = comercioSel.instagram_url || comercioSel.instagram_username;
                      const tiktok = comercioSel.tiktok_url;
                      const facebook = comercioSel.facebook_url;

                      if (!insta && !tiktok && !facebook) return null;

                      return (
                        <div className="mt-3 pt-2 flex gap-2">
                          {insta && (
                            <a 
                              href={insta.startsWith('http') ? insta : `https://${insta}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="flex-1 bg-pink-600 text-white py-2 rounded-xl text-center text-xs font-bold shadow"
                            >
                              Instagram
                            </a>
                          )}
                          {tiktok && (
                            <a 
                              href={tiktok.startsWith('http') ? tiktok : `https://${tiktok}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="flex-1 bg-black text-white py-2 rounded-xl text-center text-xs font-bold shadow"
                            >
                              TikTok
                            </a>
                          )}
                          {facebook && (
                            <a 
                              href={facebook.startsWith('http') ? facebook : `https://${facebook}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-center text-xs font-bold shadow"
                            >
                              Facebook
                            </a>
                          )}
                        </div>
                      );
                    })()}

                    {/* BOTONES DE CONTACTO */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {comercioSel.whatsapp && (
                        <a
                          href={"https://wa.me/" + comercioSel.whatsapp.replace("+", "").replace(/\s/g, "")}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                        >
                          💬 WhatsApp
                        </a>
                      )}
                      {comercioSel.telefono && (
                        <a
                          href={"tel:" + comercioSel.telefono}
                          className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5"
                        >
                          <Phone size={14} className="text-emerald-600" /> Llamar
                        </a>
                      )}
                    </div>
                  </div>
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
