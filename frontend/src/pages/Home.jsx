import React, { useEffect, useState } from 'react';
import {
  ArrowRight, ArrowUpRight, Building2, CalendarDays, Fuel, HeartPulse,
  Landmark, MapPin, MessageCircle, Newspaper, ParkingSquare, Pill, Search,
  ShoppingBag, Stethoscope, Train, UtensilsCrossed, Wrench,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import CarruselAvisos from '../components/CarruselAvisos';
import { PARKING_URL } from '../lib/parking';
import logo from './logo-utrera-portada.webp';
import panorama from './panorama-utrera-portada.webp';
import panoramaMobile from './panorama-utrera-portada-640.webp';
import './Home.css';

const priorityServices = [
  { label: 'Farmacia de guardia', icon: Pill, view: 'farmacias', tone: 'green' },
  { label: 'Salud pública', icon: HeartPulse, view: 'salud', tone: 'green' },
  { label: 'Horarios de trenes', icon: Train, view: 'cercanias', tone: 'blue' },
  { label: 'Aparcamientos', icon: ParkingSquare, href: PARKING_URL, tone: 'blue' },
  { label: 'Gasolineras', icon: Fuel, view: 'gasolineras', tone: 'gold' },
  { label: 'Agenda Cultural', icon: CalendarDays, view: 'menu-agenda', tone: 'gold' },
];

const otherServices = [
  { label: 'Comercio local', icon: ShoppingBag, view: 'market' },
  { label: 'Visita Utrera', icon: Landmark, view: 'que-ver' },
  { label: 'Titulares y TV Utrera', icon: Newspaper, view: 'noticias' },
  { label: 'Gestiones y teléfonos útiles', icon: Building2, view: 'agenda-gestiones' },
  { label: 'Anuncios entre particulares', icon: Newspaper, view: 'tablon' },
  { label: 'Herramientas y utilidades', icon: Wrench, view: 'caja-herramientas' },
  { label: 'Dónde comer', icon: UtensilsCrossed, view: 'hosteleria' },
];

function ServiceCard({ service, onNavigate }) {
  const { label, icon: Icon, view, href, tone } = service;
  const content = (
    <>
      <span className="mobile-home__icon" data-tone={tone}><Icon size={22} aria-hidden="true" /></span>
      <span>{label}</span>
      {href
        ? <ArrowUpRight className="mobile-home__arrow" size={17} aria-hidden="true" />
        : <ArrowRight className="mobile-home__arrow" size={17} aria-hidden="true" />}
    </>
  );

  if (href) {
    return <a className="mobile-home__service" data-tone={tone} href={href} target="_blank" rel="noopener noreferrer">{content}<span className="sr-only"> (HolaUtrera, se abre en otra pestaña)</span></a>;
  }
  return <button className="mobile-home__service" data-tone={tone} type="button" onClick={() => onNavigate(view)}>{content}</button>;
}

export default function Home({ setPaginaActual }) {
  const [search, setSearch] = useState('');
  const [ads, setAds] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadAds() {
      try {
        const { data, error } = await supabase
          .from('anuncios')
          .select('id,tipo,titulo,subtitulo,accion_tab')
          .eq('activo', true)
          .order('orden', { ascending: true })
          .abortSignal(controller.signal);

        if (!controller.signal.aborted && !error) {
          setAds((data ?? []).filter(ad => ad.accion_tab !== 'conso'));
        }
      } catch {
        // The public services remain available if ads cannot load.
      }
    }
    loadAds();
    return () => controller.abort();
  }, []);

  function submitSearch(event) {
    event.preventDefault();
    setPaginaActual('market', search.trim());
  }

  return (
    <div className="mobile-home">
      <header className="mobile-home__header">
        <p className="mobile-home__brand"><img src={logo} width="32" height="32" alt="" /> UtrerApp</p>
        <div className="mobile-home__welcome">
          <img
            src={panoramaMobile}
            srcSet={`${panoramaMobile} 640w, ${panorama} 1000w`}
            sizes="(max-width: 588px) calc(100vw - 28px), 560px"
            width="1000"
            height="349"
            fetchPriority="high"
            alt=""
          />
          <div>
            <p><MapPin size={14} aria-hidden="true" /> Utrera, Sevilla</p>
            <h1>¡Hola, <span>Utrera!</span></h1>
          </div>
        </div>
        <form className="mobile-home__search" role="search" aria-label="Guía Comercial" onSubmit={submitSearch}>
          <label htmlFor="mobile-home-search">Buscar comercios</label>
          <div>
            <input id="mobile-home-search" type="search" placeholder="Nombre o servicio" value={search} onChange={event => setSearch(event.target.value)} />
            <button type="submit" aria-label="Buscar en la Guía Comercial"><Search size={22} aria-hidden="true" /></button>
          </div>
        </form>
      </header>

      <section aria-labelledby="mobile-home-priorities">
        <h2 id="mobile-home-priorities">Servicios prioritarios</h2>
        <ul className="mobile-home__grid">
          {priorityServices.map(service => (
            <li key={service.label}><ServiceCard service={service} onNavigate={setPaginaActual} /></li>
          ))}
        </ul>
      </section>

      <button className="mobile-home__conso" type="button" onClick={() => setPaginaActual('conso')}>
        <span className="mobile-home__icon" data-tone="rose"><MessageCircle size={23} aria-hidden="true" /></span>
        <span><strong>Habla con Conso IA</strong><small>Tu asistente utrerana, gratis</small></span>
        <ArrowRight size={19} aria-hidden="true" />
      </button>

      <CarruselAvisos />

      <section aria-labelledby="mobile-home-other">
        <h2 id="mobile-home-other">Otros servicios</h2>
        <ul className="mobile-home__list mobile-home__directory">
          {otherServices.map(service => (
            <li key={service.view}><ServiceCard service={service} onNavigate={setPaginaActual} /></li>
          ))}
        </ul>
      </section>

      <section className="mobile-home__commercial" aria-labelledby="mobile-home-commercial">
        <h2 id="mobile-home-commercial">Publicidad</h2>
        <ul className="mobile-home__list">
          <li><ServiceCard service={{ label: 'Cuadro médico privado', icon: Stethoscope, view: 'sanidad', tone: 'gold' }} onNavigate={setPaginaActual} /></li>
          {ads.map(({ id, tipo, titulo, subtitulo, accion_tab }) => {
            const content = (
              <span>
                {tipo && <small>{tipo}</small>}
                <strong>{titulo}</strong>
                {subtitulo && <small>{subtitulo}</small>}
              </span>
            );
            return (
              <li key={id}>
                {accion_tab
                  ? <button className="mobile-home__ad" type="button" onClick={() => setPaginaActual(accion_tab)}>{content}<ArrowRight size={17} aria-hidden="true" /></button>
                  : <div className="mobile-home__ad">{content}</div>}
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="mobile-home__footer">
        <p>Foto de <a href="https://commons.wikimedia.org/wiki/File:Panoramicautreranoche.jpg">Salvador Moreno Rivas</a>
          {' · '}<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>{' · Adaptada para la cabecera'}
        </p>
        <button type="button" onClick={() => setPaginaActual('admin')}>Administración</button>
      </footer>
    </div>
  );
}
