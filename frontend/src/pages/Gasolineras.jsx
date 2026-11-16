import React from 'react';
import { ArrowLeft, ExternalLink, Fuel } from 'lucide-react';
import GasolinerasWidget from '../components/GasolinerasWidget';

export default function Gasolineras({ setPaginaActual, setTab }) {
  const navigate = setPaginaActual || setTab;

  return (
    <div className="fuel-page">
      {navigate && <button className="fuel-back" type="button" onClick={() => navigate('home')}>
        <ArrowLeft size={16} aria-hidden="true" /> Volver al inicio
      </button>}
      <header className="fuel-hero">
        <span><Fuel size={20} aria-hidden="true" /> Precios por litro</span>
        <h1>Gasolineras de Utrera</h1>
        <p>Compara los precios de venta al público del municipio.</p>
      </header>
      <GasolinerasWidget />
      <footer className="fuel-footer">
        <a href="https://geoportalgasolineras.es/geoportal-instalaciones/Inicio" target="_blank" rel="noreferrer">
          Geoportal del MITECO <ExternalLink size={13} aria-hidden="true" />
        </a>
      </footer>
    </div>
  );
}
