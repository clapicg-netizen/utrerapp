import React, { useState } from 'react';
import { carteleraGiglon, coincidenciasGiglon, ejemploGiglon, prepararGiglon } from './giglon';

const vacio = { enlace: '', titulo: '', funciones: '' };

export default function CargaGiglon({ filas, crear, editar }) {
  const [entrada, setEntrada] = useState(vacio);
  const [propuesta, setPropuesta] = useState(null);
  const [error, setError] = useState('');
  function actualizar(valores) {
    setEntrada(valores);
    setPropuesta(null);
    setError('');
  }
  function revisar(evento) {
    evento.preventDefault();
    try {
      setPropuesta(prepararGiglon(entrada));
      setError('');
    } catch (fallo) {
      setPropuesta(null);
      setError(fallo.message);
    }
  }
  const coincidencias = propuesta ? coincidenciasGiglon(propuesta, filas) : [];
  return <details>
    <summary>Carga asistida desde Giglon</summary>
    <form onSubmit={revisar}>
      <p>Abre la cartelera de Giglon, copia el enlace directo y el título, y pega una línea por función. Completa la descripción propia y sube el cartel si tienes autorización.</p>
      <div className="cultura-acciones">
        <a className="cultura-secundario" href={carteleraGiglon} target="_blank" rel="noopener noreferrer">Abrir cartelera de Giglon</a>
        <button type="button" onClick={()=>actualizar(ejemploGiglon)}>Cargar ejemplo verificado</button>
      </div>
      <div className="cultura-campos">
        <label>Enlace de Giglon<input type="url" required maxLength={400} value={entrada.enlace} onChange={e=>actualizar({...entrada,enlace:e.target.value})}/></label>
        <label>Título<input required maxLength={200} value={entrada.titulo} onChange={e=>actualizar({...entrada,titulo:e.target.value})}/></label>
        <label>Funciones<textarea required rows={3} maxLength={2500} placeholder="05/12/2026 20:30 · desde 12,00 €" value={entrada.funciones} onChange={e=>actualizar({...entrada,funciones:e.target.value})}/></label>
      </div>
      <button type="submit">Revisar datos</button>
    </form>
    {error && <p role="alert">{error}</p>}
    {propuesta && <section aria-label="Datos para revisar">
      <h3>{propuesta.titulo}</h3>
      <a href={propuesta.compra} target="_blank" rel="noopener noreferrer">Comprobar ficha en Giglon</a>
      <ul>{propuesta.pases.map(p => <li key={p.fecha + p.hora}>
        {p.fecha.split('-').reverse().join('/')} · {p.hora} · {p.precio !== '' ? p.precio + ' €' : 'Precio sin confirmar'}
        {p.precioPendiente && <> (Giglon indica «{p.precioPendiente}»)</>}
      </li>)}</ul>
      {coincidencias.length ? <><p role="status">Ya hay fichas que coinciden. Puedes revisarlas sin aplicar los datos de Giglon.</p>
        <ul>{coincidencias.map(({fila,diferencias}) => <li key={fila.id}>
          {fila.titulo} · {diferencias.length ? 'Diferencias detectadas en ' + diferencias.join(', ') : 'Sin diferencias en los datos comparados'}
          <button type="button" onClick={()=>editar(fila)}>Abrir ficha existente</button>
        </li>)}</ul></> : <button type="button" onClick={()=>crear(propuesta)}>Abrir como borrador</button>}
    </section>}
  </details>;
}
