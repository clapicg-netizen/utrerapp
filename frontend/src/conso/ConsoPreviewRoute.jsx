import React from 'react';
import Conso from '../pages/Conso';
import Farmacias from '../pages/Farmacias';
import Gasolineras from '../pages/Gasolineras';
import GuiaComercial from '../pages/GuiaComercial';
import CercaniasSevilla from '../components/CercaniasSevilla';
import { persistentMarket, pwaHome } from '../market/config';
import './conso-preview.css';

export function previewUrl(view, query = '') {
  const params = new URLSearchParams({ vista: view });
  if (query) params.set('q', query);
  if (persistentMarket && ['farmacias','trenes','gasolineras'].includes(view)) params.set('desde', 'conso');
  return pwaHome + '?' + params;
}

export const consoPreviewViews = ['conso', 'farmacias', 'trenes', 'gasolineras', 'guia'];

export default function ConsoPreviewRoute({ view, query }) {
  const home = () => window.location.assign(pwaHome);
  if (view === 'conso') return <div className="conso-preview-page"><Conso serviceLinks={previewUrl} homeHref={pwaHome} chatDisabled={!persistentMarket} /></div>;
  let page;
  switch (view) {
    case 'farmacias': page = <Farmacias setPaginaActual={home} />; break;
    case 'trenes': page = <CercaniasSevilla />; break;
    case 'gasolineras': page = <Gasolineras setPaginaActual={home} />; break;
    case 'guia': page = <GuiaComercial busquedaInicial={query} />; break;
    default: return null;
  }
  return <div>
    <nav className="conso-route-nav" aria-label="Regresar">
      <a href={previewUrl('conso')}>Volver a Conso</a>
      <a href={pwaHome}>Volver a UtrerApp</a>
    </nav>
    {page}
  </div>;
}
