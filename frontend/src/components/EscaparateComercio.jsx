import React from 'react';
import { ArrowDown, ArrowUpRight, Clock, Facebook, Globe, MapPin, MessageCircle, Phone, ShieldCheck, ShoppingBag, Utensils } from 'lucide-react';
import './EscaparateComercio.css';

export const DIGITAL_GM_ID = '13';

export const ESCAPARATES = [
  { id: DIGITAL_GM_ID, slug: 'digital-gm', name: 'DIGITAL GM' },
  { id: '10', slug: 'la-chana', name: 'La Chana', restaurante: true },
  { id: '14', slug: 'bar-alonsi', name: 'Bar Alonsi', restaurante: true },
];

const digitalGm = {
  category: 'Electrodomésticos, climatización y descanso',
  address: 'Av. María Auxiliadora, 40 · Utrera',
  intro: 'Electrodomésticos, climatización y descanso en Utrera. Consulta la selección y habla con la tienda si necesitas ayuda para elegir.',
  hours: [
    ['Lunes a viernes', '10:00–14:00 y 17:30–20:30'],
    ['Sábado', '10:00–13:00'],
    ['Domingo', 'Cerrado'],
  ],
  highlights: [
    { icon: MapPin, title: 'En Utrera desde 2003' },
    { icon: ShieldCheck, title: 'Ayuda con la gestión de la garantía' },
  ],
  source: 'https://www.digitalgm.es/tiendas',
  facebook: 'https://www.facebook.com/digitalgm.es',
};

function webLink(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return null;
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(text) ? text : 'https://' + text);
    return ['https:', 'http:'].includes(url.protocol) && url.hostname.includes('.') ? url.href : null;
  } catch {
    return null;
  }
}

function phoneNumber(value) {
  const digits = String(value ?? '').replace(/\D/g, '').replace(/^00/, '');
  if (digits.length === 9) return '34' + digits;
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

export default function EscaparateComercio({ comercio }) {
  const config = ESCAPARATES.find(({ id }) => id === String(comercio.id));
  const profile = config?.slug === 'digital-gm' ? digitalGm : {};
  const category = profile.category || (config?.restaurante && comercio.subcategoria?.trim());
  const menu = config?.restaurante ? webLink(comercio.carta_pdf_url) : null;
  const menuImage = menu && /\.(png|jpe?g|webp|avif)$/i.test(new URL(menu).pathname);
  const image = webLink(comercio.portada_url);
  const photos = [...new Set((Array.isArray(comercio.galeria_urls) ? comercio.galeria_urls : []).map(webLink).filter(Boolean))];
  const shop = webLink(comercio.tienda_url);
  const site = webLink(comercio.web_url);
  const facebook = webLink(profile.facebook || comercio.facebook_url);
  const phone = phoneNumber(comercio.telefono);
  const whatsapp = phoneNumber(comercio.whatsapp);
  const address = profile.address || comercio.direccion?.trim();
  const map = address && 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(comercio.nombre + ' ' + address);
  const suffix = String(comercio.id);
  const catalogId = 'catalogo-escaparate-' + suffix;
  const menuId = 'carta-escaparate-' + suffix;
  const detailsId = 'visita-escaparate-' + suffix;

  function jumpTo(id) {
    const heading = document.getElementById(id);
    heading?.scrollIntoView({ block: 'start' });
    heading?.focus({ preventScroll: true });
  }

  return (
    <article className="commerce-showcase" aria-label={comercio.nombre}>
      <header className="commerce-showcase-hero">
        {image && <img src={image} alt={'Fachada de ' + comercio.nombre} />}
        <div className="commerce-showcase-hero-copy">
          {category && <p>{category}</p>}
          <h1>{comercio.nombre}</h1>
        </div>
      </header>
      <div className="commerce-showcase-body">
        <div className="commerce-showcase-intro">
          <p>{profile.intro || comercio.descripcion}</p>
          <div className="commerce-showcase-actions" aria-label="Acciones del comercio">
            {menu && <button className="commerce-showcase-primary" type="button" onClick={() => jumpTo(menuId)}>
              <Utensils size={16} aria-hidden="true" /> Ver carta <ArrowDown size={17} aria-hidden="true" />
            </button>}
            {!menu && photos.length > 0 && <button className="commerce-showcase-primary" type="button" onClick={() => jumpTo(catalogId)}>
              Ver catálogo <ArrowDown size={17} aria-hidden="true" />
            </button>}
            {whatsapp && <a href={'https://wa.me/' + whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={17} aria-hidden="true" /> WhatsApp</a>}
            {phone && <a href={'tel:+' + phone}><Phone size={16} aria-hidden="true" /> Llamar</a>}
            {map && <button type="button" onClick={() => jumpTo(detailsId)}><MapPin size={17} aria-hidden="true" /> Ubicación</button>}
            {shop && <a href={shop} target="_blank" rel="noreferrer"><ShoppingBag size={17} aria-hidden="true" /> Tienda online <ArrowUpRight size={13} aria-hidden="true" /></a>}
            {facebook && <a href={facebook} target="_blank" rel="noreferrer"><Facebook size={17} aria-hidden="true" /> Facebook <ArrowUpRight size={13} aria-hidden="true" /></a>}
            {site && site !== shop && <a href={site} target="_blank" rel="noreferrer"><Globe size={17} aria-hidden="true" /> Web oficial <ArrowUpRight size={13} aria-hidden="true" /></a>}
          </div>
        </div>
        {profile.highlights && <ul className="commerce-showcase-highlights">
          {profile.highlights.map(({ icon: Icon, title }) => <li key={title}><Icon size={19} aria-hidden="true" /> {title}</li>)}
        </ul>}
        {menu && <section className="commerce-showcase-menu" aria-labelledby={menuId}>
          <h2 id={menuId} tabIndex={-1}>Carta</h2>
          <a className="commerce-showcase-menu-link" href={menu} target="_blank" rel="noreferrer">
            {menuImage && <img src={menu} alt={'Carta de ' + comercio.nombre} loading="lazy" />}
            <span>Abrir carta en otra pestaña <ArrowUpRight size={16} aria-hidden="true" /></span>
          </a>
        </section>}
        {photos.length > 0 && <section className="commerce-showcase-catalog" aria-labelledby={catalogId}>
          <h2 id={catalogId} tabIndex={-1}>{config?.restaurante ? 'Fotos del local y sus platos' : 'Catálogo destacado'}</h2>
          <ul>
            {photos.map((url, index) => <li key={url}>
              <a href={url} target="_blank" rel="noreferrer">
                <img src={url} alt={'Selección de ' + comercio.nombre + ' · imagen ' + (index + 1)} loading="lazy" />
                <span>Ampliar imagen <ArrowUpRight size={15} aria-hidden="true" /></span>
              </a>
            </li>)}
          </ul>
        </section>}
        <section className="commerce-showcase-visit" aria-labelledby={detailsId}>
          <h2 id={detailsId} tabIndex={-1}>Visita la tienda</h2>
          <div className="commerce-showcase-details">
            {map && <div><h3><MapPin size={17} aria-hidden="true" /> Dirección</h3><p>{address}</p>
              <a href={map} target="_blank" rel="noreferrer">Cómo llegar <ArrowUpRight size={14} aria-hidden="true" /></a></div>}
            {(comercio.horario_texto?.trim() || profile.hours) && <div>
              <h3><Clock size={17} aria-hidden="true" /> Horario</h3>
              {comercio.horario_texto?.trim() ? <p>{comercio.horario_texto}</p> : <>
                <dl>{profile.hours.map(([day, hours]) => <div key={day}><dt>{day}</dt><dd>{hours}</dd></div>)}</dl>
                <a href={profile.source} target="_blank" rel="noreferrer">Consultar horario en la web oficial <ArrowUpRight size={14} aria-hidden="true" /></a>
              </>}
            </div>}
          </div>
        </section>
        {profile.intro && comercio.descripcion && <details className="commerce-showcase-about">
          <summary>Más sobre {comercio.nombre}</summary><p>{comercio.descripcion}</p>
        </details>}
      </div>
    </article>
  );
}
