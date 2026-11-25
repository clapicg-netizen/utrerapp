import React, { useState } from 'react';
import { categorias, diaLocal, enlaceCompra, guardarCultura, leerCultura } from './datos';
import { FichaCultural } from './Cartelera';

const nuevo = () => ({ id: crypto.randomUUID(), titulo:'', categoria:categorias[0], fecha:diaLocal(), hora:'20:30', fin:'', lugar:'', direccion:'', precio:'', descripcion:'', compra:'', cartel:'', estado:'borrador', venta:'normal' });
const campos = [
  ['titulo','Título'], ['fecha','Fecha','date'], ['hora','Hora de inicio','time'], ['fin','Hora de fin','time'],
  ['lugar','Recinto'], ['direccion','Dirección completa'], ['precio','Precio (€)','number'], ['compra','Enlace directo a Giglon','url'],
];

export default function GestorCultural({ onDirty }) {
  const [filas,setFilas] = useState(leerCultura);
  const [edicion,setEdicion] = useState(null);
  const [preview,setPreview] = useState(false);
  const [aviso,setAviso] = useState('');
  function cambiar(fila) { setEdicion(fila); setPreview(false); setAviso(''); onDirty?.(Boolean(fila)); }
  function persistir(lista, mensaje) {
    try {
      guardarCultura(lista); setFilas(lista); cambiar(null); setAviso(mensaje);
    } catch { setAviso('No se pudo guardar. Comprueba el espacio disponible del navegador.'); }
  }
  function guardar(event) {
    event.preventDefault();
    if (edicion.compra && !enlaceCompra(edicion.compra)) return setAviso('Usa un enlace HTTPS de la ficha concreta de Giglon.');
    if (edicion.fin && edicion.fin <= edicion.hora) return setAviso('La hora de fin debe ser posterior al inicio.');
    if (![edicion.titulo,edicion.lugar].every(s=>s.trim())) return setAviso('Indica el título y el recinto.');
    const fila = { ...edicion, titulo: edicion.titulo.trim(), lugar: edicion.lugar.trim(), compra: enlaceCompra(edicion.compra) };
    persistir([...filas.filter(e=>e.id!==fila.id),fila], 'Espectáculo guardado en este navegador.');
  }
  function imagen(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;
    if (!['image/png','image/jpeg','image/webp'].includes(archivo.type) || archivo.size > 750000) return setAviso('Elige un cartel PNG, JPEG o WebP de hasta 750 KB.');
    const lector = new FileReader();
    const id = edicion.id;
    lector.onload = () => setEdicion(actual => actual?.id === id ? { ...actual, cartel:lector.result } : actual);
    lector.onerror = () => setAviso('No se pudo leer el cartel.');
    lector.readAsDataURL(archivo);
  }
  return <section className="cultura cultura-gestor">
    <p>Prototipo con datos ficticios. Los cambios se guardan en este navegador.</p>
    {aviso && <p role="status">{aviso}</p>}
    {!edicion ? <>
      <button className="cultura-primario" onClick={()=>cambiar(nuevo())}>Crear espectáculo</button>
      <ul className="cultura-admin-lista">{filas.map(e=><li key={e.id}>
        <div><strong>{e.titulo}</strong><p>{e.fecha} · {e.estado}</p></div>
        <div className="cultura-acciones">
          <button onClick={()=>cambiar({...e})}>Editar</button>
          <button onClick={()=>cambiar({...e,id:crypto.randomUUID(),titulo:e.titulo+' (copia)',estado:'borrador'})}>Duplicar</button>
          <button onClick={()=>persistir(filas.map(f=>f.id===e.id?{...f,estado:e.estado==='publicado'?'retirado':'publicado'}:f),'Estado actualizado.')}>{e.estado==='publicado'?'Retirar':'Publicar'}</button>
          <button onClick={()=>{if(window.confirm(`¿Eliminar «${e.titulo}» de este navegador?`))persistir(filas.filter(f=>f.id!==e.id),'Espectáculo eliminado.');}}>Eliminar</button>
        </div>
      </li>)}</ul>
    </> : <form onSubmit={guardar}>
      <div className="cultura-campos">{campos.map(([id,label,tipo])=><label key={id}>{label}
        <input type={tipo || 'text'} min={tipo==='number'?'0':undefined} step={tipo==='number'?'0.01':undefined}
          required={['titulo','fecha','hora','lugar'].includes(id)} value={edicion[id]} onChange={e=>setEdicion({...edicion,[id]:e.target.value})}/>
      </label>)}
      {[['categoria','Categoría',categorias],['estado','Publicación',['borrador','publicado','retirado']],['venta','Estado de venta',['normal','agotado','cancelado','cambio']]].map(([id,label,opciones])=><label key={id}>{label}<select value={edicion[id]} onChange={e=>setEdicion({...edicion,[id]:e.target.value})}>{opciones.map(opcion=><option key={opcion}>{opcion}</option>)}</select></label>)}
      <label>Cartel autorizado<input type="file" accept="image/png,image/jpeg,image/webp" onChange={imagen}/></label>
      <label>Descripción<textarea value={edicion.descripcion} rows={4} onChange={e=>setEdicion({...edicion,descripcion:e.target.value})}/></label>
      </div>
      <div className="cultura-acciones"><button type="submit" className="cultura-primario">Guardar</button>
        <button type="button" disabled={!edicion.titulo || !edicion.fecha} onClick={()=>setPreview(!preview)}>{preview?'Cerrar vista previa':'Previsualizar ficha'}</button>
        <button type="button" onClick={()=>{if(window.confirm('¿Descartar los cambios de esta ficha?'))cambiar(null);}}>Descartar</button></div>
      {preview && <FichaCultural evento={edicion}/>}
    </form>}
  </section>;
}
