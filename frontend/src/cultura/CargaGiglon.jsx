import React, { useState } from 'react';
import { carteleraGiglon, coincidenciasGiglon, ejemploGiglon, prepararGiglon } from './giglon';

export default function CargaGiglon({ filas, crear, editar }) {
  const [texto, setTexto] = useState('');
  const [propuesta, setPropuesta] = useState(null);
  const [error, setError] = useState('');
  function actualizar(valor) {
    setTexto(valor);
    setPropuesta(null);
    setError('');
  }
  function revisar(evento) {
    evento.preventDefault();
    try {
      setPropuesta(prepararGiglon(texto));
      setError('');
    } catch (fallo) {
      setPropuesta(null);
      setError(fallo.message);
    }
  }
  const coincidencias = propuesta ? coincidenciasGiglon(propuesta, filas) : [];
  return <details>
    <summary>Carga asistida desde Giglon</summary>
    <p>Lectura por URL pendiente de una fuente autorizada.</p>
    <form onSubmit={revisar}>
      <p>Pega el título y las líneas de recinto, dirección, fecha, hora, precio y enlace que aparezcan en la ficha. Puedes incluir varias funciones.</p>
      <div className="cultura-acciones">
        <a className="cultura-secundario" href={carteleraGiglon} target="_blank" rel="noopener noreferrer">Abrir cartelera de Giglon</a>
        <button type="button" onClick={()=>actualizar(ejemploGiglon)}>Cargar ejemplo verificado</button>
      </div>
      <div className="cultura-campos"><label>Información del espectáculo<textarea required rows={8} maxLength={12000} value={texto} onChange={e=>actualizar(e.target.value)}/></label></div>
      <button type="submit">Revisar datos</button>
    </form>
    {error && <p role="alert">{error}</p>}
    {propuesta && <section aria-label="Datos para revisar">
      <h3>{propuesta.titulo || 'Título pendiente'}</h3>
      <p>{propuesta.lugar || 'Recinto pendiente'} · {propuesta.direccion || 'Dirección pendiente'}</p>
      {propuesta.compra && <a href={propuesta.compra} target="_blank" rel="noopener noreferrer">Comprobar ficha en Giglon</a>}
      {propuesta.avisos.map((aviso,i)=><p key={i} role="status">{aviso}</p>)}
      <ul>{propuesta.pases.map((p,i) => <li key={i}>
        {p.fecha.split('-').reverse().join('/')} · {p.hora || 'Hora pendiente'} · {p.tipoPrecio === 'gratis' ? 'Entrada gratuita'
          : p.tipoPrecio === 'desconocido' ? 'Precio sin confirmar' : (p.tipoPrecio === 'desde' ? 'Desde ' : '') + p.precio + ' €'}
      </li>)}</ul>
      {coincidencias.length ? <><p role="status">Ya hay fichas que coinciden. Puedes revisarlas sin aplicar los datos de Giglon.</p>
        <ul>{coincidencias.map(({fila,diferencias}) => <li key={fila.id}>
          {fila.titulo} · {diferencias.length ? 'Diferencias detectadas en ' + diferencias.join(', ') : 'Sin diferencias en los datos comparados'}
          <button type="button" onClick={()=>editar(fila)}>Abrir ficha existente</button>
        </li>)}</ul></> : <button type="button" onClick={()=>crear(propuesta)}>Abrir como borrador</button>}
    </section>}
  </details>;
}
