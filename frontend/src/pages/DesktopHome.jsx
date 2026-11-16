import React, { useState } from 'react';
import {
  ArrowRight, ArrowUpRight, CalendarDays, ClipboardList, Fuel, HeartPulse, Landmark,
  MapPin, MessageCircle, Newspaper, Pill, Search, Store, Stethoscope, TrainFront, UtensilsCrossed, Wrench,
} from 'lucide-react';
import './DesktopHome.css';
import sanctuaryPhoto from './santuario-utrera-portada.webp';
import panorama from './panorama-utrera-portada.webp';
import logo from './logo-utrera-portada.webp';

const featured = [
  { to: 'market', icon: Store, name: 'Guía comercial', detail: 'Tiendas, profesionales y servicios de Utrera.' },
  { to: 'cercanias', icon: TrainFront, name: 'Trenes de Utrera', detail: 'Salidas, llegadas y avisos de Renfe.' },
  { to: 'gasolineras', icon: Fuel, name: 'Gasolineras', detail: 'Compara el precio por litro antes de repostar.' },
];

const services = [
  { to: 'farmacias', icon: Pill, name: 'Farmacias de guardia' },
  { to: 'sanidad', icon: Stethoscope, name: 'Clínicas y especialistas' },
  { to: 'salud', icon: HeartPulse, name: 'Salud' },
  { to: 'agenda-gestiones', icon: ClipboardList, name: 'Gestiones y citas' },
  { to: 'hosteleria', icon: UtensilsCrossed, name: 'Dónde comer' },
  { to: 'tablon', icon: Newspaper, name: 'Tablón ciudadano' },
  { to: 'caja-herramientas', icon: Wrench, name: 'Herramientas' },
];



export default function DesktopHome({ onNavigate }) {
  const [query, setQuery] = useState('');

  function open(section, search = '') {
    window.scrollTo(0, 0);
    onNavigate(section, search);
  }

  function searchGuide(event) {
    event.preventDefault();
    open('market', query.trim());
  }

  return (
    <div className="desktop-home">
      <div className="desktop-home-hero">
        <img className="desktop-home-panorama" src={panorama} alt="" fetchPriority="high" />
        <header className="desktop-home-header">
          <div className="desktop-home-shell desktop-home-header-inner">
            <div className="desktop-home-brand">
              <img src={logo} alt="" /> <span>Utrer<span>app</span></span>
            </div>
            <nav aria-label="Navegación principal">
              <button type="button" onClick={() => open('que-ver')}>Qué ver</button>
              <button type="button" onClick={() => open('market')}>Guía comercial</button>
              <button type="button" onClick={() => open('menu-agenda')}>Agenda</button>
              <button type="button" onClick={() => open('noticias')}>Noticias</button>
            </nav>
            <button type="button" className="desktop-home-conso" onClick={() => open('conso')}>
              <MessageCircle size={17} aria-hidden="true" /> Hablar con Conso
            </button>
          </div>
        </header>
        <div className="desktop-home-shell desktop-home-hero-copy">
          <p className="desktop-home-location"><MapPin size={17} aria-hidden="true" /> Utrera, Sevilla</p>
          <h1 id="desktop-home-title">Utrera,<br /><em>a tu alcance.</em></h1>
          <p>Encuentra comercios, consulta servicios y descubre qué hacer en la ciudad.</p>
          <form className="desktop-home-search" onSubmit={searchGuide} role="search" aria-label="Guía comercial">
            <Search size={20} aria-hidden="true" />
            <input type="search" value={query} onChange={event => setQuery(event.target.value)}
              placeholder="Busca un comercio o servicio" aria-label="Comercio o servicio que buscas" />
            <button type="submit">Buscar</button>
          </form>
        </div>
        <div className="desktop-home-photo-label">Utrera desde la Plaza de España</div>
      </div>

      <div className="desktop-home-content">
        <div className="desktop-home-margins" aria-hidden="true">
          <img src={process.env.PUBLIC_URL + '/monumentos/santa-maria-2.jpg'} alt="" loading="lazy" />
          <img src={sanctuaryPhoto} alt="" loading="lazy" />
        </div>
        <main className="desktop-home-shell desktop-home-body">
          <section className="desktop-home-section" aria-labelledby="desktop-home-featured">
            <h2 id="desktop-home-featured">Accesos directos</h2>
            <div className="desktop-home-featured">
              {featured.map(({ to, icon: Icon, name, detail }) => (
                <button type="button" key={to} onClick={() => open(to)}>
                  <span className="desktop-home-feature-icon"><Icon size={23} aria-hidden="true" /></span>
                  <ArrowUpRight className="desktop-home-feature-arrow" size={18} aria-hidden="true" />
                  <strong>{name}</strong>
                  <span>{detail}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="desktop-home-section" aria-labelledby="desktop-home-discover">
            <h2 id="desktop-home-discover">Actualidad y planes</h2>
            <div className="desktop-home-editorial">
              <button type="button" className="desktop-home-discover" onClick={() => open('que-ver')}>
                <img src={sanctuaryPhoto} alt="" loading="lazy" />
                <span><Landmark size={20} aria-hidden="true" /> Conoce el patrimonio de Utrera <ArrowUpRight size={19} aria-hidden="true" /></span>
              </button>
              <div className="desktop-home-editorial-links">
                <button type="button" onClick={() => open('menu-agenda')}>
                  <CalendarDays size={24} aria-hidden="true" />
                  <span><strong>Agenda cultural</strong><small>Cartelera, eventos y actividades.</small></span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => open('noticias')}>
                  <Newspaper size={24} aria-hidden="true" />
                  <span><strong>Noticias de Utrera</strong><small>Consulta los medios locales.</small></span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>
          <section className="desktop-home-section" aria-labelledby="desktop-home-services">
            <h2 id="desktop-home-services">Servicios y vida local</h2>
            <div className="desktop-home-services">
              {services.map(({ to, icon: Icon, name }) => (
                <button type="button" key={to} onClick={() => open(to)}>
                  <Icon size={18} aria-hidden="true" /><span>{name}</span><ArrowRight size={15} aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
        </main>

        <footer className="desktop-home-footer desktop-home-shell">
          <span>Foto panorámica de <a href="https://commons.wikimedia.org/wiki/File:Panoramicautreranoche.jpg" target="_blank" rel="noreferrer">Salvador Moreno Rivas</a>
            {' · '}<a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">CC BY-SA 3.0</a>{' · Adaptada para la cabecera'}</span>
          <button type="button" onClick={() => open('admin')}>Administración</button>
        </footer>
      </div>
    </div>
  );
}
