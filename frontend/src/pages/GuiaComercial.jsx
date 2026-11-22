// src/pages/GuiaComercial.jsx
import React, { useState, useEffect, useRef } from "react";
import { Phone, Search, MapPin, Image, ArrowUpRight, ArrowRight, Store, Utensils, BriefcaseBusiness, HeartPulse, Building2, GraduationCap, LayoutGrid, CarFront, X } from "lucide-react";
import { obtenerComercios } from "../lib/comerciosService";
import { supabase } from "../lib/supabaseClient";
import { anunciosComerciales, anunciosComercialesActivos } from "../lib/anunciosComerciales";
import FichaInmobiliaria from "./FichaInmobiliaria";
import FichaComida from "./FichaComida";
import EscaparateComercio, { ESCAPARATES } from "../components/EscaparateComercio";
import LandingComercio from "../components/LandingComercio";
import logo from "./logo-utrera-portada.webp";
import "./GuiaComercial.css";

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
  const opener = useRef(null);
  const closeButton = useRef(null);

  const [fotoAmpliada, setFotoAmpliada] = useState(null);


  const categorias = ["Todos", "Hostelería", "Comercio", "Servicios", "Salud y Belleza", "Inmobiliarias", "Formación"];

  if (anunciosComercialesActivos) categorias.push("Motor");

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

  useEffect(() => {
    setCategoriaSel(categoriaInicial || 'Todos');
    setBusqueda(busquedaInicial);
  }, [categoriaInicial, busquedaInicial]);

  useEffect(() => {
    if (!comercioSel) return;
    closeButton.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function handleKey(event) {
      if (event.key === 'Escape') setComercioSel(null);
      if (event.key !== 'Tab') return;
      const dialog = closeButton.current?.closest('[role="dialog"]');
      const elements = [...dialog.querySelectorAll('a[href],button,input,select,textarea,video[controls],iframe,[tabindex="0"]')]
        .filter(element => !element.disabled && element.getClientRects().length);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
      opener.current?.focus();
    };
  }, [comercioSel]);

  const normalizar = (texto) =>
    (texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const comerciosVisibles = anunciosComercialesActivos
    ? [...anunciosComerciales.filter(anuncio => !comercios.some(c => normalizar(c.nombre?.trim()) === normalizar(anuncio.nombre))), ...comercios]
    : comercios;

  const comerciosFiltrados = comerciosVisibles.filter((c) => {
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

  const escaparateSeleccionado = comercioSel?.escaparate || ESCAPARATES.some(({ id }) => id === String(comercioSel?.id));
  const categoryIcons = [LayoutGrid, Utensils, Store, BriefcaseBusiness, HeartPulse, Building2, GraduationCap, CarFront];
  function abrirFicha(event, comercio) {
    opener.current = event.currentTarget;
    setComercioSel(comercio);
  }


  return (
    <div className="commercial-guide">
      <header className="commercial-guide__hero">
        <div className="commercial-guide__shell">
          <div className="commercial-guide__brand"><img src={logo} width="30" height="30" alt="" /><span>UtrerApp</span><span>Comercio local</span></div>
          <h1>Guía Comercial <span>de Utrera</span></h1>
          <p>Tiendas, sabores y profesionales de aquí.</p>
          <div className="commercial-guide__search" role="search" aria-label="Buscar establecimientos">
            <label htmlFor="guide-search">¿Qué estás buscando?</label>
            <div><Search size={20} aria-hidden="true" />
              <input id="guide-search" type="search" placeholder="Busca un bar, tienda, servicio..." value={busqueda} onChange={event => setBusqueda(event.target.value)} />
            </div>
          </div>
        </div>
      </header>

      <div className="commercial-guide__body commercial-guide__shell">
        {sponsors.length > 0 && <section className="commercial-guide__sponsors" aria-labelledby="guide-sponsors">
          <h2 id="guide-sponsors">Patrocinadores oficiales</h2>
          <ul tabIndex={sponsors.length > 1 ? 0 : undefined} aria-label="Patrocinadores de la guía">
            {sponsors.map(sponsor => <li key={sponsor.id}>
              {sponsor.logo_url && <img src={sponsor.logo_url} alt="" width="64" height="64" loading="lazy" decoding="async" onError={event => { event.currentTarget.style.display = 'none'; }} />}
              <div><small>Patrocinador</small><h3>{sponsor.name}</h3></div>
              {sponsor.link && <a href={sponsor.link} target="_blank" rel="noreferrer" aria-label={`Visitar ${sponsor.name} (otra pestaña)`}>Visitar <ArrowUpRight size={17} aria-hidden="true" /></a>}
            </li>)}
          </ul>
        </section>}

        <section aria-labelledby="guide-categories">
          <h2 id="guide-categories">Explora por categorías</h2>
          <div className="commercial-guide__filters" role="group" aria-label="Categorías comerciales">
            {categorias.map((cat, index) => {
              const Icon = categoryIcons[index];
              return <button key={cat} type="button" aria-pressed={categoriaSel === cat} onClick={() => setCategoriaSel(cat)}>
                <Icon size={18} aria-hidden="true" />{cat}
              </button>;
            })}
          </div>
        </section>

        <section aria-labelledby="guide-results" aria-busy={cargando}>
          <div className="commercial-guide__results-heading">
            <h2 id="guide-results">{categoriaSel === 'Todos' ? 'Nuestros comercios' : categoriaSel}</h2>
            <span role="status">{cargando ? 'Cargando…' : `${comerciosFiltrados.length} establecimientos`}</span>
          </div>
          {cargando ? <p className="commercial-guide__empty" role="status">Cargando guía comercial…</p>
            : comerciosFiltrados.length === 0 ? <div className="commercial-guide__empty"><Store size={28} aria-hidden="true" /><p>No hay establecimientos para esta búsqueda.</p><button type="button" onClick={() => {setBusqueda('');setCategoriaSel('Todos');}}>Ver todos los comercios</button></div>
            : <ul className="commercial-guide__cards">
              {comerciosFiltrados.map((comercio, index) => <li key={comercio.id}>
                <button type="button" className="commercial-guide__card" onClick={event => abrirFicha(event, comercio)}>
                  <div className="commercial-guide__photo">
                    <Store className="commercial-guide__photo-fallback" size={36} aria-hidden="true" />
                    {comercio.portada_url && !['EMPTY','NULL'].includes(comercio.portada_url.trim()) && <img src={comercio.portada_url.trim()} alt="" width="600" height="300" loading={index === 0 ? 'eager' : 'lazy'} decoding="async" onError={event => {event.currentTarget.style.display = 'none';}} />}
                    <span>{comercio.tipo_ficha === 'especial1' ? 'Inmobiliaria' : comercio.tipo_ficha === 'especial2' ? 'Gastronomía' : comercio.categoria || 'Comercio local'}</span>
                  </div>
                  <div className="commercial-guide__card-body">
                    <h3>{comercio.nombre}</h3>
                    {comercio.descripcion && <p className="commercial-guide__description">{comercio.descripcion}</p>}
                    {comercio.direccion && <p className="commercial-guide__address"><MapPin size={15} aria-hidden="true" /><span>{comercio.direccion}</span></p>}
                    <span className="commercial-guide__card-action">Ver ficha completa <ArrowRight size={18} aria-hidden="true" /></span>
                  </div>
                </button>
              </li>)}
            </ul>}
        </section>
      </div>

      {/* FICHA DEL COMERCIO */}
      {comercioSel && (
        <div role="dialog" aria-modal="true" aria-label={comercioSel.nombre} className="commercial-guide__dialog fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className={`bg-white rounded-t-3xl sm:rounded-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative ${escaparateSeleccionado ? "max-w-3xl" : "max-w-md p-5 pb-32"}`}>
            
            <button
              onClick={() => setComercioSel(null)}
              ref={closeButton}
              aria-label="Cerrar ficha"
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full w-11 h-11 flex items-center justify-center font-bold z-10 cursor-pointer"
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
