import React, { useEffect, useState } from 'react';
import { categorias, enlaceCompra, fechaCorta, guardarCultura, leerCultura, ordenFuncion, teatro, vigente } from './datos';
import { Cartel, FichaCultural } from './Cartelera';
import { culturaDB, culturaPruebas, guardarRemoto, leerGestion } from './supabaseCultural';

const funcionNueva = () => ({ id:crypto.randomUUID(), fecha:'', hora:'', fin:'', finFecha:'', precio:'', compra:'', venta:'normal' });
const nuevo = () => ({ id:crypto.randomUUID(), titulo:'', categoria:categorias[0], ...teatro, descripcion:'', cartel:'', estado:'borrador', funciones:[funcionNueva()] });
const estados = { normal:'Venta normal', agotado:'Agotado', cancelado:'Cancelado', cambio:'Cambio confirmado' };
const tipoPrecio = f => f.precio === '' ? 'desconocido' : Number(f.precio) === 0 ? 'gratis' : 'pago';
const normal = texto => texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');

const enlace = new URLSearchParams(window.location.hash.slice(1));
const flujoTeatro = culturaPruebas && new URLSearchParams(window.location.search).get('vista') === 'gestor-teatro'
  && ['invite','recovery'].includes(enlace.get('type'));
const credencialesEnlace = flujoTeatro ? {
  access_token: enlace.get('access_token'), refresh_token: enlace.get('refresh_token'),
} : null;
if (flujoTeatro) window.history.replaceState(window.history.state,'',window.location.pathname+window.location.search);

export default function GestorCultural({ onDirty, onBusy }) {
  const [filas,setFilas] = useState(() => culturaDB ? [] : leerCultura());
  const [edicion,setEdicion] = useState(null);
  const [preview,setPreview] = useState(false);
  const [aviso,setAviso] = useState('');
  const [filtro,setFiltro] = useState('proximos');
  const [busqueda,setBusqueda] = useState('');
  const [categoria,setCategoria] = useState('');
  const [sesion,setSesion] = useState(null);
  const [ocupado,setOcupado] = useState(false);
  const [modoClave,setModoClave] = useState(Boolean(credencialesEnlace));
  const [recuperar,setRecuperar] = useState(false);
  const [editor,setEditor] = useState(false);
  useEffect(() => {
    let activo = true;
    setEditor(false);
    if (culturaDB && sesion) culturaDB.rpc('es_editor_programacion_teatro').then(({data})=>{ if(activo)setEditor(data===true); });
    return ()=>{activo=false;};
  },[sesion]);
  useEffect(() => {
    if (!culturaDB) return;
    const { data } = culturaDB.auth.onAuthStateChange((_, actual) => setSesion(actual));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!editor) return;
    let activo = true;
    leerGestion().then(f => { if (activo) setFilas(f); }, () => { if (activo) setAviso('No se pudo cargar la programación.'); });
    return () => { activo = false; };
  }, [editor]);

  useEffect(() => {
    onBusy?.(ocupado);
    return () => onBusy?.(false);
  }, [ocupado, onBusy]);

  function cambiar(fila) { setEdicion(fila); setPreview(false); setAviso(''); onDirty?.(Boolean(fila)); }
  async function guardar(fila, cambios) {
    if (ocupado) return;
    setOcupado(true);
    try {
      if (culturaDB) {
        await guardarRemoto(fila,cambios);
        setFilas(await leerGestion());
      } else {
        const { archivo, ...local } = fila;
        const lista = [...filas.filter(e=>e.id!==fila.id),local];
        guardarCultura(lista); setFilas(lista);
      }
      cambiar(null);
      setFiltro(fila.estado==='publicado' ? 'proximos' : fila.estado==='borrador' ? 'borradores' : 'historico');
      setAviso(fila.estado==='publicado' ? 'Espectáculo publicado.' : 'Espectáculo guardado.');
    } catch { setAviso('No se pudo guardar el espectáculo. Comprueba los campos o el acceso.'); }
    finally { setOcupado(false); }
  }
  async function eliminar(fila) {
    if (ocupado || !window.confirm(`¿Eliminar «${fila.titulo}» y todas sus funciones?`)) return;
    setOcupado(true);
    try {
      const lista=filas.filter(e=>e.id!==fila.id);
      guardarCultura(lista);
      setFilas(lista);
      setAviso('Espectáculo eliminado.');
    } catch { setAviso('No se pudo eliminar el espectáculo.'); }
    finally { setOcupado(false); }
  }
  async function entrar(event) {
    event.preventDefault();
    const formulario = new FormData(event.currentTarget);
    setOcupado(true); setAviso('');
    try {
      const { error } = await culturaDB.auth.signInWithPassword({ email:formulario.get('correo'),password:formulario.get('contrasena') });
      if (error) setAviso('No se pudo iniciar sesión en el entorno de pruebas.');
    } catch { setAviso('No se pudo conectar con el entorno de pruebas.'); }
    finally { setOcupado(false); }
  }
  async function establecerClave(event) {
    event.preventDefault();
    const datos = new FormData(event.currentTarget);
    const password = datos.get('contrasena');
    if (password !== datos.get('repetir')) return setAviso('Las contraseñas no coinciden.');
    if (!credencialesEnlace?.access_token || !credencialesEnlace.refresh_token) return setAviso('El enlace no es válido. Solicita uno nuevo.');
    setOcupado(true); setAviso('');
    try {
      const comprobacion = await culturaDB.auth.setSession(credencialesEnlace);
      if (comprobacion.error) { setAviso('El enlace ha caducado o no es válido.'); return; }
      const resultado = await culturaDB.auth.updateUser({ password });
      if (resultado.error) { setAviso('No se pudo guardar la contraseña. Elige otra y vuelve a intentarlo.'); return; }
      credencialesEnlace.access_token = null;
      credencialesEnlace.refresh_token = null;
      setModoClave(false);
      setAviso('Contraseña guardada.');
    } catch { setAviso('No se pudo conectar con Supabase de pruebas.'); }
    finally { setOcupado(false); }
  }
  async function enviarRecuperacion(event) {
    event.preventDefault();
    const correo = new FormData(event.currentTarget).get('correo');
    const destino = new URL('/?vista=gestor-teatro',window.location.origin);
    setOcupado(true); setAviso('');
    try {
      const { error } = await culturaDB.auth.resetPasswordForEmail(correo,{redirectTo:destino.href});
      setAviso(error ? 'No se pudo solicitar la recuperación. Comprueba el correo e inténtalo más tarde.'
        : 'Si la cuenta puede recibir el enlace, llegará un correo para restablecer la contraseña.');
    } catch { setAviso('No se pudo conectar con Supabase de pruebas.'); }
    finally { setOcupado(false); }
  }
  if (modoClave) return <section className="cultura cultura-gestor">
    <h2>Establecer contraseña del Teatro</h2>
    {aviso && <p role="status">{aviso}</p>}
    <form onSubmit={establecerClave} className="cultura-campos">
      <label>Nueva contraseña<input type="password" name="contrasena" autoComplete="new-password" minLength={12} required/></label>
      <label>Repetir contraseña<input type="password" name="repetir" autoComplete="new-password" minLength={12} required/></label>
      <div><button className="cultura-primario" disabled={ocupado}>Guardar contraseña</button></div>
    </form>
  </section>;
  if (culturaDB && !editor) return <section className="cultura cultura-gestor">
    <h2>Edición en el entorno aislado</h2>
    <p>Accede con una cuenta autorizada como editora cultural en UtrerApp Pruebas.</p>
    {aviso && <p role="status">{aviso}</p>}
    {sesion ? <><p>Esta cuenta carece del permiso de edición cultural.</p>{culturaPruebas && <button onClick={()=>culturaDB.auth.signOut()}>Cambiar cuenta</button>}</> :
    <form onSubmit={recuperar ? enviarRecuperacion : entrar} className="cultura-campos">
      <label>Correo de pruebas<input type="email" name="correo" autoComplete="username" required/></label>
      {!recuperar && <label>Contraseña de pruebas<input type="password" name="contrasena" autoComplete="current-password" required/></label>}
      <div><button className="cultura-primario" disabled={ocupado}>{recuperar ? 'Enviar enlace' : 'Entrar al gestor'}</button>
        <button type="button" onClick={()=>{setRecuperar(!recuperar);setAviso('');}}>{recuperar ? 'Volver al inicio de sesión' : 'Olvidé mi contraseña'}</button></div>
    </form>}
  </section>;

  function guardarEdicion(event) {
    event.preventDefault();
    const estado = event.nativeEvent.submitter?.value === 'publicado' ? 'publicado' : 'borrador';
    const titulo = edicion.titulo.trim();
    const lugar = edicion.lugar.trim();
    const funciones = edicion.funciones.filter(f=>!f.retirada).map(f=>({...f, compra:enlaceCompra(f.compra)}));
    if (!titulo || !lugar) return setAviso('Indica el título y el recinto.');
    if (edicion.funciones.some(f=>!f.retirada && f.compra && !enlaceCompra(f.compra))) return setAviso('Usa un enlace HTTPS de la ficha concreta de Giglon.');
    if (funciones.some(f=>f.fin && (!f.fecha || !f.hora || (f.finFecha || f.fecha)+f.fin <= f.fecha+f.hora))) return setAviso('Indica una hora de inicio anterior a la hora de fin.');
    if (estado==='publicado' && !funciones.every(f=>f.fecha)) return setAviso('Confirma la fecha de cada función antes de publicar.');
    const claves = funciones.filter(f=>f.fecha).map(f=>f.fecha+' '+f.hora);
    if (new Set(claves).size!==claves.length) return setAviso('Hay funciones duplicadas para la misma fecha y hora.');
    guardar({...edicion,titulo,lugar,funciones:[...funciones,...edicion.funciones.filter(f=>f.retirada)],estado});
  }
  function imagen(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;
    if (!['image/png','image/jpeg','image/webp'].includes(archivo.type) || archivo.size > 750000) return setAviso('Elige un cartel PNG, JPEG o WebP de hasta 750 KB.');
    const lector = new FileReader();
    const id = edicion.id;
    lector.onload = () => setEdicion(actual => actual?.id === id ? { ...actual, cartel:lector.result, archivo } : actual);
    lector.onerror = () => setAviso('No se pudo leer el cartel.');
    lector.readAsDataURL(archivo);
  }
  const actualizar = (campo,valor) => setEdicion(e=>({...e,[campo]:valor}));
  const ajustarFuncion = (id,parcial) => setEdicion(e=>({...e,funciones:e.funciones.map(f=>f.id===id?{...f,...parcial}:f)}));
  const visibles = filas.filter(e=>{
    const grupo = e.estado==='borrador' ? 'borradores' : e.estado==='publicado' && e.funciones.some(f=>vigente(f)) ? 'proximos' : 'historico';
    return grupo===filtro && (!categoria || e.categoria===categoria) && normal(e.titulo+' '+e.lugar).includes(normal(busqueda));
  }).sort((a,b)=>ordenFuncion([...a.funciones].sort(ordenFuncion).find(f=>f.fecha)||{fecha:''},[...b.funciones].sort(ordenFuncion).find(f=>f.fecha)||{fecha:''}));

  return <section className="cultura cultura-gestor">
    {culturaPruebas && <button type="button" disabled={ocupado} onClick={() => { if (!edicion || window.confirm('¿Descartar los cambios sin guardar?')) { cambiar(null); culturaDB.auth.signOut(); } }}>Cerrar sesión del Teatro</button>}
    <p>Programación del Teatro Enrique de la Cuadra · {culturaPruebas ? 'Supabase de pruebas' : 'Programación cultural'}</p>
    {aviso && <p role="status">{aviso}</p>}
    {!edicion ? <>
      <button className="cultura-primario" onClick={()=>cambiar(nuevo())}>Crear espectáculo</button>
      <div className="cultura-filtros" aria-label="Estado de publicación">
        {[['proximos','Próximos espectáculos'],['borradores','Borradores'],['historico','Histórico y retirados']].map(([id,titulo])=><button key={id} aria-pressed={filtro===id} onClick={()=>setFiltro(id)}>{titulo}</button>)}
      </div>
      <div className="cultura-campos"><label>Buscar espectáculo<input type="search" value={busqueda} onChange={e=>setBusqueda(e.target.value)}/></label>
        <label>Categoría<select value={categoria} onChange={e=>setCategoria(e.target.value)}><option value="">Todas</option>{categorias.map(c=><option key={c}>{c}</option>)}</select></label></div>
      {!visibles.length && <p>No hay espectáculos con estos filtros.</p>}
      <ul className="cultura-admin-lista">{visibles.map(e=><li key={e.id}>
        <div className="cultura-admin-resumen"><Cartel evento={e}/><div><strong>{e.titulo}</strong>
          <p>{[...e.funciones].sort(ordenFuncion).filter(f=>f.fecha).map(f=>fechaCorta(f.fecha)).join(' · ') || 'Fecha pendiente'}</p>
          <small>{e.categoria} · {e.estado}</small></div></div>
        <div className="cultura-acciones">
          <button disabled={ocupado} onClick={()=>cambiar({...e})}>Editar</button>
          <button disabled={ocupado} onClick={()=>cambiar({...e,id:crypto.randomUUID(),titulo:e.titulo+' (copia)',estado:'borrador',
            cartel:e.cartel_ruta?'':e.cartel,cartel_ruta:null,revision:0,funciones:e.funciones.filter(f=>!f.retirada).map(f=>({...f,id:crypto.randomUUID()}))})}>Duplicar</button>
          {e.estado==='publicado' && <button disabled={ocupado} onClick={()=>guardar({...e,estado:'retirado'},{editarFunciones:false})}>Retirar</button>}
          {e.estado==='retirado' && culturaDB && <button disabled={ocupado} onClick={()=>guardar({...e,estado:'publicado'},{editarFunciones:false})}>Restaurar publicación</button>}
          {!culturaDB && <button disabled={ocupado} onClick={()=>eliminar(e)}>Eliminar</button>}
          {culturaDB && e.funciones.map(f=>f.retirada ? <button key={f.id} disabled={ocupado}
            onClick={()=>guardar(e,{editarFunciones:false,restaurar:[f.id]})}>Restaurar función · {fechaCorta(f.fecha)}</button> :
            <button key={f.id} disabled={ocupado} onClick={()=>{
              const motivo=window.prompt('Motivo de retirada de esta función');
              if(motivo?.trim()) guardar(e,{editarFunciones:false,retirar:[{id:f.id,motivo:motivo.trim()}]});
            }}>Retirar función · {fechaCorta(f.fecha)}</button>)}
        </div>
      </li>)}</ul>
    </> : <form onSubmit={guardarEdicion}>
      <fieldset><legend>Datos del espectáculo</legend>
        <div className="cultura-editor-identidad">
          <div className="cultura-editor-cartel"><Cartel evento={edicion}/><label>Cartel autorizado<input type="file" accept="image/png,image/jpeg,image/webp" onChange={imagen}/></label></div>
          <div className="cultura-campos">
            <label>Título<input required maxLength={200} value={edicion.titulo} onChange={e=>actualizar('titulo',e.target.value)}/></label>
            <label>Categoría<select value={edicion.categoria} onChange={e=>actualizar('categoria',e.target.value)}>{categorias.map(c=><option key={c}>{c}</option>)}</select></label>
            <label>Recinto<input required value={edicion.lugar} onChange={e=>actualizar('lugar',e.target.value)}/></label>
            <label>Dirección completa<input value={edicion.direccion} onChange={e=>actualizar('direccion',e.target.value)}/></label>
            <label className="cultura-descripcion">Descripción<textarea value={edicion.descripcion} rows={8} onChange={e=>actualizar('descripcion',e.target.value)}/></label>
          </div>
        </div>
      </fieldset>
      <fieldset><legend>Funciones y entradas</legend>
        {edicion.funciones.filter(f=>!f.retirada).map((f,i)=><fieldset key={f.id} className="cultura-funcion"><legend>Función {i+1}</legend>
          <div className="cultura-campos">
            <label>Fecha<input type="date" value={f.fecha} onChange={e=>ajustarFuncion(f.id,{fecha:e.target.value})}/></label>
            <label>Hora de inicio<input type="time" value={f.hora} onChange={e=>ajustarFuncion(f.id,{hora:e.target.value})}/></label>
            <label>Fecha de fin<input type="date" value={f.finFecha || ''} onChange={e=>ajustarFuncion(f.id,{finFecha:e.target.value})}/></label>
            <label>Hora de fin<input type="time" value={f.fin} onChange={e=>ajustarFuncion(f.id,{fin:e.target.value})}/></label>
            <label>Tipo de entrada<select value={f.tipoPrecio || tipoPrecio(f)} onChange={e=>ajustarFuncion(f.id,{tipoPrecio:e.target.value,precio:e.target.value==='gratis'?'0':''})}>
              <option value="desconocido">Precio sin confirmar</option><option value="gratis">Gratuita</option><option value="pago">De pago</option>
            </select></label>
            {(f.tipoPrecio || tipoPrecio(f))==='pago' && <label>Precio (€)<input type="number" min="0.01" step="0.01" required value={f.precio} onChange={e=>ajustarFuncion(f.id,{precio:e.target.value})}/></label>}
            <label>Estado de venta<select value={f.venta} onChange={e=>ajustarFuncion(f.id,{venta:e.target.value})}>{Object.entries(estados).map(([v,t])=><option value={v} key={v}>{t}</option>)}</select></label>
            <label>Enlace directo a Giglon<input type="url" value={f.compra} onChange={e=>ajustarFuncion(f.id,{compra:e.target.value})}/></label>
          </div>
          <button type="button" disabled={edicion.funciones.filter(x=>!x.retirada).length===1 || Boolean(culturaDB && filas.find(x=>x.id===edicion.id)?.funciones.some(x=>x.id===f.id))} onClick={()=>actualizar('funciones',edicion.funciones.filter(x=>x.id!==f.id))}>Quitar función</button>
        </fieldset>)}
        <button type="button" onClick={()=>actualizar('funciones',[...edicion.funciones,funcionNueva()])}>Añadir función</button>
      </fieldset>
      <fieldset disabled><legend>Importación desde Giglon</legend><label>URL del espectáculo<input type="url"/></label><p>Disponible cuando exista una fuente autorizada.</p></fieldset>
      <div className="cultura-acciones">
        <button type="submit" value="borrador" disabled={ocupado}>Guardar borrador</button>
        <button type="button" onClick={()=>setPreview(!preview)}>{preview?'Cerrar vista previa':'Previsualizar'}</button>
        <button type="submit" value="publicado" className="cultura-primario" disabled={ocupado}>Publicar</button>
        <button type="button" onClick={()=>{if(window.confirm('¿Descartar los cambios de esta ficha?'))cambiar(null);}}>Descartar</button>
      </div>
      {preview && <FichaCultural evento={edicion} funciones={edicion.funciones} demo/>}
    </form>}
  </section>;
}
