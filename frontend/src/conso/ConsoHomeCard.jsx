import React from 'react';
import { ArrowRight, Bot, Search } from 'lucide-react';
import './conso-preview.css';

export default function ConsoHomeCard({ onOpen, onSearch, searchExpanded = false }) {
  function search(event) {
    event.preventDefault();
    onSearch(new FormData(event.currentTarget).get('q').trim());
  }

  const searchForm = <form onSubmit={search} role="search" aria-label="Guía Comercial">
    <input name="q" type="search" aria-label="Comercio o servicio que buscas" placeholder="Nombre o servicio" />
    <button type="submit">Buscar</button>
  </form>;

  return <section className="conso-home-card" aria-label="Conso">
    <button className="conso-home-open" type="button" onClick={onOpen}>
      <span className="conso-home-icon"><Bot size={27} aria-hidden="true" /></span>
      <span><strong>Conso</strong><small>Me estoy mudando a Utrera…</small></span>
      <ArrowRight className="conso-home-arrow" size={20} aria-hidden="true" />
    </button>
    {searchExpanded ? <div className="conso-home-search conso-home-search-expanded">
      <h2><Search size={16} aria-hidden="true" /> Buscar comercios</h2>
      {searchForm}
    </div> : <details className="conso-home-search">
      <summary><Search size={16} aria-hidden="true" /> Buscar comercios</summary>
      {searchForm}
    </details>}
  </section>;
}
