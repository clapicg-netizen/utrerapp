import React from 'react';
import { ArrowDownRight, ExternalLink, Megaphone, Plus, Radio, Star, Store } from 'lucide-react';

export default function ResumenAdmin({ comercios, anuncios, crearComercio, crearAnuncio }) {
  const distribucion = Object.entries((comercios || []).reduce((resultado, fila) => {
    const categoria = fila.categoria || 'Sin categoría';
    resultado[categoria] = (resultado[categoria] || 0) + 1;
    return resultado;
  }, Object.create(null))).sort(([a, x], [b, y]) => y - x || a.localeCompare(b, 'es'));

  const indicadores = [
    { etiqueta: 'Total de comercios', valor: comercios?.length, Icono: Store, color: 'blue' },
    { etiqueta: 'Comercios destacados', valor: comercios?.filter(c => c.destacado).length, Icono: Star, color: 'gold' },
    { etiqueta: 'Total de anuncios', valor: anuncios?.length, Icono: Megaphone, color: 'purple' },
    { etiqueta: 'Anuncios activos', valor: anuncios?.filter(a => a.activo).length, Icono: Radio, color: 'green' },
  ];

  return <>
    <div className="admin-metrics">
      {indicadores.map(({ etiqueta, valor, Icono, color }) => <article className="admin-metric" key={etiqueta}>
        <span className="admin-metric-icon" data-color={color}><Icono size={20} aria-hidden="true" /></span>
        <div><p>{etiqueta}</p><strong>{valor?.toLocaleString('es-ES') ?? '—'}</strong></div>
      </article>)}
    </div>
    <div className="admin-summary-grid">
      <section className="admin-surface admin-summary">
        <h2>Comercios por categoría</h2>
        {distribucion.length ? <ul className="admin-bars">
          {distribucion.map(([nombre, total]) => <li key={nombre}>
            <div><span>{nombre}</span><strong>{total}</strong></div>
            <div className="admin-bar" aria-hidden="true"><span style={{ width: `${100 * total / comercios.length}%` }} /></div>
          </li>)}
        </ul> : <p>{comercios ? 'Todavía no hay comercios.' : 'Datos de comercios no disponibles.'}</p>}
      </section>
      <section className="admin-surface admin-summary">
        <h2>Accesos rápidos</h2>
        <div className="admin-shortcuts">
          <button type="button" onClick={crearComercio}><Store size={20} /> <span>Nuevo comercio</span><Plus size={16} /></button>
          <button type="button" onClick={crearAnuncio}><Megaphone size={20} /> <span>Nuevo anuncio</span><Plus size={16} /></button>
          <a href="https://www.utrerapp.com/" target="_blank" rel="noreferrer"><ExternalLink size={20} /> <span>Abrir UtrerApp</span><ArrowDownRight size={16} /></a>
        </div>
      </section>
    </div>
  </>;
}
