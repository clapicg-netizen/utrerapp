import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, CalendarDays, MapPin, Ticket, Share2, Theater } from 'lucide-react';
import { categorias, enlaceCompra, fechaCorta, fechaVisible, moneda, publicos } from './datos';
import { leerPublicacion } from './supabaseCultural';
import './cultura.css';

export function Cartel({ evento }) {
  return evento.cartel ? <img className="cultura-pos" src={evento.cartel} alt={`Cartel de ${evento.titulo}`} /> :
    <div className={`cultura-pos cultura-arte cultura-arte-${categorias.indexOf(evento.categoria)}`} aria-hidden="true">
      <span>{evento.categoria}</span><strong>{evento.titulo}</strong>
    </div>;
}

function Funcion({ funcion, compacta, demo, previsualizar }) {
  const compra = enlaceCompra(funcion.compra);
  const disponible = !['agotado','cancelado'].includes(funcion.venta);
  return <div className="cultura-pase">
    <p className="cultura-meta">
      <CalendarDays size={16} aria-hidden="true"/>
      <span>{funcion.fecha ? <time dateTime={funcion.fecha}>{compacta ? fechaCorta(funcion.fecha) : fechaVisible(funcion.fecha)}</time> : 'Fecha pendiente'}
        {' · '}{funcion.hora || 'Hora sin confirmar'}
        {funcion.fin && <> · hasta {funcion.fin}{funcion.finFecha && funcion.finFecha !== funcion.fecha && <> ({fechaCorta(funcion.finFecha)})</>}</>}</span>
    </p>
    <p className="cultura-precio">{funcion.precio === '' ? 'Precio sin confirmar' : Number(funcion.precio) === 0 ? 'Entrada gratuita' : moneda(funcion.precio)}</p>
    {funcion.venta !== 'normal' && <strong className="cultura-estado">{{agotado:'Entradas agotadas',cancelado:'Cancelado',cambio:'Cambio confirmado'}[funcion.venta]}</strong>}
    {disponible && compra && !demo && !previsualizar && <a className="cultura-primario" target="_blank" rel="noopener noreferrer" href={compra}><Ticket size={17} aria-hidden="true"/> Comprar entradas</a>}
    {disponible && compra && previsualizar && <span className="cultura-primario" role="link" aria-disabled="true"><Ticket size={17} aria-hidden="true"/> Comprar entradas</span>}
    {disponible && !compra && funcion.precio!=='0' && <span className="cultura-accion-inactiva"><Ticket size={17} aria-hidden="true"/> Compra sin enlace confirmado</span>}
    {disponible && compra && demo && !previsualizar && <span className="cultura-accion-inactiva"><Ticket size={17} aria-hidden="true"/> Comprar entradas · vista previa</span>}
  </div>;
}

export function FichaCultural({ evento, funciones = [evento], compacta = false, resumida = false, abrir, demo = false, previsualizar = false }) {
  const detalle = new URL(window.location.origin);
  detalle.searchParams.set('vista','cultura');
  detalle.searchParams.set('evento',evento.id);
  const compartir = 'https://wa.me/?text=' + encodeURIComponent(`${evento.titulo} · ${evento.lugar}\n${detalle.href}`);
  const mapa = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(evento.direccion || evento.lugar);
  return <article className={`cultura-ficha ${compacta ? 'cultura-compacta' : ''}`}>
    <Cartel evento={evento}/>
    <div className="cultura-ficha-cuerpo">
      {!compacta && <div className="cultura-etiquetas"><span>{evento.categoria}</span></div>}
      <h2>{evento.titulo}</h2>
      <p className="cultura-meta"><MapPin size={16} aria-hidden="true"/>{evento.lugar}</p>
      {!resumida && <p className="cultura-descripcion-publica">{evento.descripcion}</p>}
      <div className="cultura-pases">{funciones.map(f=><Funcion key={f.funcionId || f.id} funcion={f} compacta={compacta} demo={demo} previsualizar={previsualizar}/>)}</div>
      <div className="cultura-acciones">
        {abrir && <button className="cultura-secundario" onClick={abrir}>Ver ficha <ArrowUpRight size={17}/></button>}
        {!abrir && evento.direccion && (previsualizar
          ? <span className="cultura-secundario" role="link" aria-disabled="true">Cómo llegar</span>
          : <a className="cultura-secundario" href={mapa} target="_blank" rel="noopener noreferrer">Cómo llegar</a>)}
        {!abrir && (previsualizar
          ? <span className="cultura-secundario" role="link" aria-disabled="true" aria-label="Compartir por WhatsApp"><Share2 size={17}/> WhatsApp</span>
          : <a className="cultura-secundario" aria-label="Compartir por WhatsApp" href={compartir} target="_blank" rel="noopener noreferrer"><Share2 size={17}/> WhatsApp</a>)}
      </div>
    </div>
  </article>;
}

export default function Cartelera({ volver }) {
  const [categoria, setCategoria] = useState('');
  const [id, setId] = useState(() => new URLSearchParams(location.search).get('evento'));
  const [filas,setFilas] = useState(null);
  const [error,setError] = useState(false);
  useEffect(()=>{
    let activa = true;
    leerPublicacion().then(datos=>{if(activa)setFilas(datos);},()=>{if(activa)setError(true);});
    return ()=>{activa=false;};
  },[]);
  const eventos = publicos(filas || []);
  const primeras = new Map();
  for (const evento of eventos) if (!primeras.has(evento.id)) primeras.set(evento.id, evento);
  const cartelera = [...primeras.values()];
  const actual = cartelera.find(e=>e.id===id);
  function seleccionar(valor) {
    setId(valor);
    const url = new URL(location.href);
    url.searchParams.set('vista','cultura');
    if (valor) url.searchParams.set('evento',valor); else url.searchParams.delete('evento');
    history.replaceState(null,'',url);
    window.scrollTo(0,0);
  }
  return <section className="cultura" aria-label="Cartelera cultural">
    <header className="cultura-portada">
      <button onClick={id ? () => seleccionar(null) : volver}><ArrowLeft size={18}/> {id ? 'Cartelera' : 'Agenda'}</button>
      <div><p><Theater size={18}/> Teatro Enrique de la Cuadra</p><h1>{id && actual ? actual.titulo : 'Nos vemos en escena'}</h1>
      <p>Vista previa con programación ficticia</p></div>
    </header>
    <div className="cultura-contenido">
      {error ? <p role="status">No se pudo consultar la cartelera. Inténtalo más tarde.</p> : !filas ? <p role="status">Cargando programación…</p> :
      id ? (actual ? <FichaCultural evento={actual} funciones={eventos.filter(e=>e.id===id)}/> : <p>Este espectáculo ya no está en la cartelera.</p>) : <>
        <div className="cultura-filtros" aria-label="Filtrar por categoría">
          {['',...categorias].map(tipo=><button key={tipo} aria-pressed={categoria===tipo} onClick={()=>setCategoria(tipo)}>{tipo || 'Todos'}</button>)}
        </div>
        <h2>Próximos espectáculos</h2>
        <div className="cultura-grid">{cartelera.filter(e=>!categoria || e.categoria===categoria).map(e=><FichaCultural key={e.id} evento={e} resumida abrir={()=>seleccionar(e.id)}/>)}</div>
        {!cartelera.some(e=>!categoria || e.categoria===categoria) && <p>No hay espectáculos publicados para esta categoría.</p>}
      </>}
    </div>
  </section>;
}
