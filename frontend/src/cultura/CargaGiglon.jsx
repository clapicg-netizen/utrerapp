import React, { useRef, useState } from 'react';
import { fuenteDisponible, leerFichaAutorizada } from './fuenteGiglon';
import { carteleraGiglon, coincidenciasGiglon, ejemploGiglon, prepararGiglon } from './giglon';

export default function CargaGiglon({ filas, crear, editar, mostrarEjemplo, directorio = 'listo', reintentar }) {
  const intento = useRef(0);
  const [ocupado, setOcupado] = useState(false);
  const [texto, setTexto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [propuesta, setPropuesta] = useState(null);
  const [error, setError] = useState('');
  function limpiarRevision() {
    intento.current++;
    setOcupado(false);
    setPropuesta(null);
    setError('');
  }
  function actualizar(valor) {
    setTexto(valor);
    limpiarRevision();
  }
  async function revisar(evento) {
    evento.preventDefault();
    if (directorio !== 'listo') return;
    const actual = ++intento.current;
    setOcupado(true);
    try {
      const enlace = /^https:\/\/[^\s]+$/.test(texto.trim());
      const ficha = enlace && fuenteDisponible ? await leerFichaAutorizada(texto) : prepararGiglon(texto);
      if (archivo && (!['image/png','image/jpeg','image/webp'].includes(archivo.type) || archivo.size > 750000 || !archivo.size)) {
        throw new Error('Elige un cartel PNG, JPEG o WebP de hasta 750 KB.');
      }
      const cartel = archivo ? await new Promise((resolver, rechazar) => {
        const lector = new FileReader();
        lector.onload = () => resolver(lector.result);
        lector.onerror = () => rechazar(new Error('No se pudo leer el cartel.'));
        lector.readAsDataURL(archivo);
      }) : ficha.cartel;
      if (actual !== intento.current) return;
      setPropuesta({ ...ficha, descripcion:descripcion.trim() || ficha.descripcion, cartel, archivo:archivo || ficha.archivo });
      setError('');
    } catch (fallo) {
      if (actual !== intento.current) return;
      setPropuesta(null);
      setError(fallo.message);
    } finally {
      if (actual === intento.current) setOcupado(false);
    }
  }
  const coincidencias = propuesta ? coincidenciasGiglon(propuesta, filas) : [];
  return <details open>
    <summary>Carga asistida desde Giglon</summary>
    {!fuenteDisponible && <p>Lectura por URL pendiente de una fuente autorizada.</p>}
    {directorio === 'error' && <p role="alert">No se pudo comprobar si ya existe el espectáculo. <button type="button" onClick={reintentar}>Reintentar</button></p>}
    {directorio === 'cargando' && <p role="status">Comprobando el directorio de espectáculos…</p>}
    <form onSubmit={revisar}>
      <p>Pega el título y las líneas de recinto, dirección, fecha, hora, precio y enlace que aparezcan en la ficha. Puedes incluir varias funciones.</p>
      <div className="cultura-acciones">
        <a className="cultura-secundario" href={carteleraGiglon} target="_blank" rel="noopener noreferrer">Abrir cartelera de Giglon</a>
        {mostrarEjemplo && <button type="button" onClick={()=>actualizar(ejemploGiglon)}>Cargar ejemplo verificado</button>}
      </div>
      <div className="cultura-campos"><label>Información del espectáculo<textarea required rows={8} maxLength={12000} value={texto} onChange={e=>actualizar(e.target.value)}/></label></div>
      <div className="cultura-campos">
        <label>Sinopsis facilitada<textarea rows={6} value={descripcion} onChange={e=>{setDescripcion(e.target.value);limpiarRevision();}}/></label>
        <label>Cartel autorizado<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{setArchivo(e.target.files[0] || null);limpiarRevision();}}/></label>
      </div>
      <button type="submit" disabled={ocupado || directorio !== 'listo'}>{ocupado ? 'Preparando ficha…' : 'Revisar datos'}</button>
    </form>
    {error && <p role="alert">{error}</p>}
    {propuesta && directorio === 'listo' && <section aria-label="Datos para revisar">
      <h3>{propuesta.titulo || 'Título pendiente'}</h3>
      {propuesta.cartel && <img className="cultura-pos" src={propuesta.cartel} alt="Cartel aportado para revisión" style={{ maxWidth:'18rem' }}/>}
      {propuesta.descripcion && <p className="cultura-descripcion-publica">{propuesta.descripcion}</p>}
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
