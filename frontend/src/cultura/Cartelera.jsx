import React, { useState } from 'react';
import { ArrowLeft, ArrowUpRight, CalendarDays, MapPin, Ticket, Share2, Theater } from 'lucide-react';
import { categorias, enlaceCompra, fechaVisible, moneda, publicos } from './datos';
import './cultura.css';

export function Cartel({ evento }) {
  return evento.cartel ? <img className="cultura-pos" src={evento.cartel} alt={`Cartel de ${evento.titulo}`} /> :
    <div className={`cultura-pos cultura-arte cultura-arte-${categorias.indexOf(evento.categoria)}`} aria-hidden="true">
      <span>{evento.categoria}</span><strong>{evento.titulo}</strong>
    </div>;
}

export function FichaCultural({ evento, resumida = false, abrir, demo = true }) {
  const compra = enlaceCompra(evento.compra);
  const activo = !['agotado','cancelado'].includes(evento.venta);
  const detalle = new URL(window.location.origin);
  detalle.searchParams.set('vista','cultura');
  detalle.searchParams.set('evento',evento.id);
  const compartir = 'https://wa.me/?text=' + encodeURIComponent(`${evento.titulo} · ${fechaVisible(evento.fecha)} a las ${evento.hora}\n${detalle.href}`);
  const mapa = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(evento.direccion || evento.lugar);
  return <article className={`cultura-ficha ${resumida ? 'cultura-resumen' : ''}`}>
    <Cartel evento={evento}/>
    <div className="cultura-ficha-cuerpo">
      <div className="cultura-etiquetas"><span>{evento.categoria}</span>
        {evento.venta !== 'normal' && <strong>{{agotado:'Entradas agotadas',cancelado:'Cancelado',cambio:'Cambio confirmado'}[evento.venta]}</strong>}
      </div>
      <h2>{evento.titulo}</h2>
      <p className="cultura-meta"><CalendarDays size={18}/><span><time dateTime={evento.fecha}>{fechaVisible(evento.fecha)}</time> · {evento.hora}</span></p>
      <p className="cultura-meta"><MapPin size={18}/>{evento.lugar}</p>
      <p className="cultura-precio">{evento.precio === '' ? 'Precio sin confirmar' : Number(evento.precio) === 0 ? 'Entrada gratuita' : moneda(evento.precio)}</p>
      {!resumida && <p>{evento.descripcion}</p>}
      <div className="cultura-acciones">
        {abrir && <button className="cultura-secundario" onClick={abrir}>Ver ficha <ArrowUpRight size={17}/></button>}
        {activo && compra && !demo && <a className="cultura-primario" target="_blank" rel="noopener noreferrer" href={compra}><Ticket size={17}/> Comprar entradas</a>}
        {activo && demo && Number(evento.precio) !== 0 && <span className="cultura-accion-inactiva"><Ticket size={17}/> Comprar entradas · demo</span>}
        {!abrir && evento.direccion && <a className="cultura-secundario" href={mapa} target="_blank" rel="noopener noreferrer">Cómo llegar</a>}
        {!abrir && <a className="cultura-secundario" aria-label="Compartir por WhatsApp" href={compartir} target="_blank" rel="noopener noreferrer"><Share2 size={17}/> WhatsApp</a>}
      </div>
    </div>
  </article>;
}

export default function Cartelera({ volver }) {
  const [categoria, setCategoria] = useState('');
  const [id, setId] = useState(() => new URLSearchParams(location.search).get('evento'));
  const eventos = publicos();
  const actual = eventos.find(e=>e.id===id);
  function seleccionar(valor) {
    setId(valor);
    const url = new URL(location.href);
    url.searchParams.set('vista','cultura');
    if (valor) url.searchParams.set('evento',valor); else url.searchParams.delete('evento');
    history.replaceState(null,'',url);
    window.scrollTo(0,0);
  }
  return <main className="cultura">
    <div className="cultura-portada">
      <button onClick={actual || id ? () => seleccionar(null) : volver}><ArrowLeft size={18}/> {actual || id ? 'Cartelera' : 'Agenda'}</button>
      <div><p><Theater size={18}/> Cultura en Utrera</p><h1>{actual ? 'El espectáculo' : 'Nos vemos en escena'}</h1>
      <p>Programación cultural · Vista previa con datos ficticios</p></div>
    </div>
    <div className="cultura-contenido">
      {id ? (actual ? <FichaCultural evento={actual}/> : <p>Este espectáculo ya no está en la cartelera.</p>) : <>
        <div className="cultura-filtros" aria-label="Filtrar por categoría">
          {['',...categorias].map(tipo=><button key={tipo} aria-pressed={categoria===tipo} onClick={()=>setCategoria(tipo)}>{tipo || 'Todos'}</button>)}
        </div>
        <h2>Próximos espectáculos</h2>
        <div className="cultura-grid">{eventos.filter(e=>!categoria || e.categoria===categoria).map(e=><FichaCultural key={e.id} evento={e} resumida abrir={()=>seleccionar(e.id)}/>)}</div>
        {!eventos.some(e=>!categoria || e.categoria===categoria) && <p>No hay espectáculos publicados para esta categoría.</p>}
      </>}
    </div>
  </main>;
}
