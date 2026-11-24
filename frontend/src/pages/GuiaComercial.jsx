// src/pages/GuiaComercial.jsx
import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, ArrowUpRight, ArrowRight, Store, Utensils, BriefcaseBusiness, HeartPulse, Building2, GraduationCap, LayoutGrid, X } from "lucide-react";
import { obtenerComercios } from "../lib/comerciosService";
import { supabase } from "../lib/supabaseClient";
import FichaInmobiliaria from "./FichaInmobiliaria";
import FichaComida from "./FichaComida";
import EscaparateComercio, { ESCAPARATES } from "../components/EscaparateComercio";
import LandingComercio from "../components/LandingComercio";
import FichaComercialEstandar from "../components/FichaComercialEstandar";
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
    const params = new URLSearchParams(window.location.search);
    if (params.get('vista') !== 'market') return;
    const id = params.get('ficha');
    const ficha = id && comercios.find(comercio => String(comercio.id) === id);
    if (ficha) setComercioSel(ficha);
  }, [comercios]);

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

  const escaparateSeleccionado = ESCAPARATES.some(({ id }) => id === String(comercioSel?.id));
  const categoryIcons = [LayoutGrid, Utensils, Store, BriefcaseBusiness, HeartPulse, Building2, GraduationCap];
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
                  <FichaComercialEstandar comercio={comercioSel} ampliarFoto={setFotoAmpliada} />
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
