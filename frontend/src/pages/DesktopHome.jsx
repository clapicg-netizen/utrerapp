import React from 'react';
import {
  ArrowRight, ArrowUpRight, CalendarDays, ClipboardList, Fuel, HeartPulse, Landmark,
  MapPin, MessageCircle, Newspaper, Pill, Store, Stethoscope, TrainFront, UtensilsCrossed, Wrench,
} from 'lucide-react';
import './DesktopHome.css';
import sanctuaryPhoto from './santuario-utrera-portada.webp';

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
  { to: 'menu-agenda', icon: CalendarDays, name: 'Agenda de Utrera' },
  { to: 'noticias', icon: Newspaper, name: 'Noticias locales' },
  { to: 'tablon', icon: Newspaper, name: 'Tablón ciudadano' },
  { to: 'caja-herramientas', icon: Wrench, name: 'Herramientas' },
];

const monument = file => process.env.PUBLIC_URL + '/monumentos/' + file;

export default function DesktopHome({ onNavigate }) {
  function open(section) {
    window.scrollTo(0, 0);
    onNavigate(section);
  }

  return (
    <div className="desktop-home">
      <header className="desktop-home-header">
        <div className="desktop-home-shell desktop-home-header-inner">
          <div className="desktop-home-brand" aria-label="Utrerapp">
            <span aria-hidden="true">U</span> Utrerapp
          </div>
          <nav aria-label="Navegación principal">
            <button type="button" onClick={() => open('market')}>Guía comercial</button>
            <button type="button" onClick={() => open('cercanias')}>Trenes</button>
            <button type="button" onClick={() => open('gasolineras')}>Gasolineras</button>
            <button type="button" onClick={() => open('teatro')}>Teatro y eventos</button>
          </nav>
          <button type="button" className="desktop-home-conso" onClick={() => open('conso')}>
            <MessageCircle size={17} aria-hidden="true" /> Hablar con Conso
          </button>
        </div>
      </header>

      <main className="desktop-home-shell desktop-home-body">
        <section className="desktop-home-hero" aria-labelledby="desktop-home-title">
          <div className="desktop-home-hero-copy">
            <p className="desktop-home-location"><MapPin size={17} aria-hidden="true" /> Utrera, Sevilla</p>
            <h1 id="desktop-home-title">Tu guía<br />de Utrera</h1>
            <p>Comercios de aquí, servicios para el día a día y planes para disfrutar de la ciudad.</p>
            <button type="button" onClick={() => open('market')}>
              Explorar la guía comercial <ArrowRight size={19} aria-hidden="true" />
            </button>
          </div>
          <figure className="desktop-home-hero-photo">
            <img src={monument('santa-maria-1.jpg')} alt="Iglesia de Santa María de la Mesa entre palmeras" fetchPriority="high" />
            <figcaption>Santa María de la Mesa</figcaption>
          </figure>
        </section>

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

        <div className="desktop-home-more">
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

          <section className="desktop-home-section" aria-labelledby="desktop-home-discover">
            <h2 id="desktop-home-discover">Qué ver en Utrera</h2>
            <button type="button" className="desktop-home-discover" onClick={() => open('que-ver')}>
              <img src={sanctuaryPhoto} alt="" loading="lazy" />
              <span><Landmark size={19} aria-hidden="true" /> Monumentos y patrimonio <ArrowUpRight size={18} aria-hidden="true" /></span>
            </button>
          </section>
        </div>
      </main>

      <footer className="desktop-home-footer desktop-home-shell">
        <span>Utrerapp · Guía local</span>
        <button type="button" onClick={() => open('admin')}>Administración</button>
      </footer>
    </div>
  );
}
