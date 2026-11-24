import React, { useState } from 'react';
import { ArrowDownUp, Eye, Pencil, Plus, Search, Store, Trash2 } from 'lucide-react';
import { Campo, Imagen } from './Controles';
import { destinos, tiposFicha } from './modelos';

function normalizar(texto) {
  return texto?.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim() ?? '';
}

function Accion({ Icono, etiqueta, onClick, peligro }) {
  return <button type="button" className={`admin-icon ${peligro ? 'admin-danger' : ''}`}
    title={etiqueta} aria-label={etiqueta} onClick={onClick}><Icono size={17} /></button>;
}

export function DirectorioComercios({ filas, crear, editar, ver, eliminar }) {
  const [buscar, setBuscar] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tipo, setTipo] = useState('');
  const categorias = [...new Set(filas.map(fila => fila.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
  const tipos = [...tiposFicha, ...[...new Set(filas.map(fila => fila.tipo_ficha).filter(Boolean))]
    .filter(valor => !tiposFicha.some(([id]) => id === valor)).map(valor => [valor, valor])];
  const visibles = filas.filter(fila => normalizar(fila.nombre).includes(normalizar(buscar))
    && (!categoria || fila.categoria === categoria) && (!tipo || (fila.tipo_ficha || 'normal') === tipo));

  return <section className="admin-surface">
    <div className="admin-section-head"><div><h2>Directorio comercial</h2><p>{filas.length} comercios registrados</p></div>
      <button type="button" className="admin-button admin-primary" onClick={crear}><Plus size={18} /> Nuevo comercio</button>
    </div>
    <div className="admin-filters">
      <label className="admin-field admin-search"><span>Buscar por nombre</span><span className="admin-search-input">
        <Search size={17} aria-hidden="true" /><input value={buscar} onChange={event => setBuscar(event.target.value)} type="search" placeholder="Nombre del comercio" />
      </span></label>
      <Campo etiqueta="Categoría" value={categoria} onChange={event => setCategoria(event.target.value)}
        opciones={[[ '', 'Todas las categorías'], ...categorias.map(nombre => [nombre, nombre])]} />
      <Campo etiqueta="Tipo de ficha" value={tipo} onChange={event => setTipo(event.target.value)}
        opciones={[[ '', 'Todos los tipos'], ...tipos]} />
    </div>
    <div className="admin-table-frame">
      <table className="admin-table">
        <thead><tr><th>Comercio</th><th>Categoría</th><th>Tipo de ficha</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {visibles.map(fila => <tr key={fila.id}>
            <td><div className="admin-table-name"><Imagen src={fila.logo_url || fila.portada_url} />
              <div><strong>{fila.nombre}</strong>{fila.subcategoria && <small>{fila.subcategoria}</small>}</div>
            </div></td>
            <td data-etiqueta="Categoría">{fila.categoria || 'Sin categoría'}</td>
            <td data-etiqueta="Tipo de ficha">{tipos.find(([id]) => id === (fila.tipo_ficha || 'normal'))?.[1] || fila.tipo_ficha}</td>
            <td data-etiqueta="Estado"><span className={`admin-pill ${fila.destacado ? 'admin-pill-highlight' : ''}`}>{fila.destacado ? 'Destacado' : 'Estándar'}</span></td>
            <td><div className="admin-row-actions">
              <Accion Icono={Pencil} etiqueta={`Editar ${fila.nombre}`} onClick={() => editar(fila)} />
              <Accion Icono={Eye} etiqueta={`Vista previa de ${fila.nombre}`} onClick={() => ver(fila)} />
              <Accion Icono={Trash2} etiqueta={`Eliminar ${fila.nombre}`} peligro onClick={() => eliminar(fila)} />
            </div></td>
          </tr>)}
        </tbody>
      </table>
    </div>
    {!visibles.length && <div className="admin-empty"><Store size={23} /><p>{filas.length ? 'No hay comercios que coincidan con los filtros.' : 'Todavía no hay comercios.'}</p></div>}
    <div className="admin-table-footer">{visibles.length} de {filas.length} comercios</div>
  </section>;
}

export function DirectorioAnuncios({ filas, crear, editar, activar, eliminar, ocupado }) {
  const [inverso, setInverso] = useState(false);
  const anuncios = [...filas].sort((a, b) => ((a.orden ?? 0) - (b.orden ?? 0)) * (inverso ? -1 : 1));
  return <section className="admin-surface">
    <div className="admin-section-head"><div><h2>Anuncios de portada</h2><p>{filas.length} anuncios · {filas.filter(fila => fila.activo).length} activos</p></div>
      <button type="button" className="admin-button admin-primary" onClick={crear}><Plus size={18} /> Nuevo anuncio</button>
    </div>
    <div className="admin-order"><button type="button" className="admin-button" onClick={() => setInverso(!inverso)}>
      <ArrowDownUp size={16} /> Orden de aparición {inverso ? 'descendente' : 'ascendente'}</button></div>
    <div className="admin-ad-list">
      {anuncios.map(anuncio => <article key={anuncio.id} className="admin-ad-row">
        <div className={`admin-ad-banner bg-gradient-to-br ${anuncio.bg_gradient || 'from-slate-800 to-slate-900'}`}>
          <span className={`admin-ad-badge ${anuncio.color_badge || 'bg-amber-500 text-white'}`}>{anuncio.icono} {anuncio.tipo}</span>
          <strong>{anuncio.titulo}</strong>{anuncio.subtitulo && <small>{anuncio.subtitulo}</small>}
        </div>
        <div className="admin-ad-meta"><span>Posición <strong>{anuncio.orden ?? '—'}</strong></span>
          <span>{destinos.find(([id]) => id === anuncio.accion_tab)?.[1] || anuncio.accion_tab || 'Sin destino'}</span>
          <label className="admin-checkbox"><input type="checkbox" checked={Boolean(anuncio.activo)} disabled={ocupado}
            aria-label={`Activar ${anuncio.titulo}`} onChange={event => activar(anuncio, event.target.checked)} />
            {anuncio.activo ? 'Activo' : 'Inactivo'}</label>
        </div>
        <div className="admin-row-actions">
          <Accion Icono={Pencil} etiqueta={`Editar ${anuncio.titulo}`} onClick={() => editar(anuncio)} />
          <Accion Icono={Trash2} etiqueta={`Eliminar ${anuncio.titulo}`} peligro onClick={() => eliminar(anuncio)} />
        </div>
      </article>)}
      {!anuncios.length && <div className="admin-empty"><p>Todavía no hay anuncios.</p></div>}
    </div>
  </section>;
}
