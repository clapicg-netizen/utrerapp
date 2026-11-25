import React, { useEffect, useRef, useState } from 'react';
import { Eye, Save, Trash2 } from 'lucide-react';
import { actualizarComercio, crearComercio, subirArchivoComercio } from '../../lib/comerciosService';
import { Aviso, Campo, Imagen } from './Controles';
import { cargarFicha, medios, prepararFicha, tiposFicha } from './modelos';
import VistaFicha from './VistaFicha';

const pestanas = ['Datos generales', 'Contacto', 'Web y redes sociales', 'Multimedia', 'Promoción', 'Configuración de ficha'];

export default function EditorComercio({ ficha, categorias, adminId, pendiente, ocupado, cancelar, guardado }) {
  const [original] = useState(() => cargarFicha(ficha));
  const [formulario, setFormulario] = useState(original);
  const [activa, setActiva] = useState(0);
  const [mensaje, setMensaje] = useState(null);
  const [vista, setVista] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const archivos = useRef(new Map());
  const sucio = JSON.stringify(formulario) !== JSON.stringify(original);

  useEffect(() => { pendiente(sucio); }, [pendiente, sucio]);
  useEffect(() => {
    const mediosPendientes = archivos.current;
    return () => mediosPendientes.forEach((_archivo, url) => URL.revokeObjectURL(url));
  }, []);

  function campo(nombre) {
    return {
      value: formulario[nombre],
      onChange: event => setFormulario(actual => ({ ...actual, [nombre]: event.target.value })),
    };
  }

  function anexar(event, nombre) {
    const nuevos = Array.from(event.target.files, archivo => {
      const url = URL.createObjectURL(archivo);
      archivos.current.set(url, { archivo, remoto: null });
      return url;
    });
    event.target.value = '';
    if (!nuevos.length) return;
    setFormulario(actual => ({
      ...actual,
      [nombre]: nombre === 'galeria_urls' ? [...actual.galeria_urls, ...nuevos] : nuevos[0],
    }));
  }

  function validar() {
    if (!formulario.nombre.trim() || !formulario.categoria) {
      setActiva(0);
      setMensaje({ error: true, texto: 'Indica el nombre y la categoría del comercio.' });
      return null;
    }
    try {
      return prepararFicha(formulario);
    } catch {
      setActiva(5);
      setMensaje({ error: true, texto: 'Revisa el formato JSON de los datos especiales.' });
      return null;
    }
  }

  async function guardar(event) {
    event.preventDefault();
    if (guardando) return;
    const datos = validar();
    if (!datos) return;
    ocupado(true);
    setGuardando(true);
    setMensaje(null);
    async function publicar(url) {
      const medio = archivos.current.get(url);
      if (!medio) return url;
      if (!medio.remoto) {
        const resultado = await subirArchivoComercio(medio.archivo, adminId);
        if (!resultado.success) throw new Error(resultado.message);
        medio.remoto = resultado.url;
      }
      return medio.remoto;
    }
    try {
      for (const [nombre] of medios) {
        datos[nombre] = await publicar(datos[nombre]);
      }
      const galeria = [];
      for (const url of datos.galeria_urls) galeria.push(await publicar(url));
      datos.galeria_urls = galeria;
      const resultado = ficha
        ? await actualizarComercio(ficha.id, null, datos)
        : await crearComercio(datos);
      if (!resultado.success) throw new Error(resultado.message);
      guardado(ficha ? 'Comercio actualizado.' : 'Comercio creado.');
    } catch (error) {
      setMensaje({ error: true, texto: `No se pudo guardar el comercio. ${error.message}` });
    } finally {
      ocupado(false);
      setGuardando(false);
    }
  }

  function abrirVista() {
    setMensaje(null);
    const datos = validar();
    if (!datos) return;
    setVista({
      ...ficha, ...datos,
      instagram_username: datos.instagram_url,
      tiktok_username: datos.tiktok_url,
    });
  }

  function moverPestana(event) {
    const actual = Number(event.target.dataset.pestana);
    if (!Number.isInteger(actual)) return;
    const ultima = pestanas.length - 1;
    const destinos = { ArrowRight: (actual + 1) % pestanas.length, ArrowLeft: (actual + ultima) % pestanas.length, Home: 0, End: ultima };
    const destino = destinos[event.key];
    if (destino === undefined) return;
    event.preventDefault();
    setActiva(destino);
    event.currentTarget.querySelector(`[data-pestana="${destino}"]`)?.focus();
  }

  return <section className="admin-surface admin-editor">
    <div className="admin-editor-head">
      <div><h2>{ficha ? 'Editar comercio' : 'Nuevo comercio'}</h2>{ficha && <p>{ficha.nombre}</p>}</div>
      <button type="button" className="admin-button" onClick={abrirVista} disabled={guardando}><Eye size={17} /> Vista previa</button>
    </div>
    <div className="admin-tabs" role="tablist" aria-label="Secciones de la ficha" onKeyDown={moverPestana}>
      {pestanas.map((nombre, indice) => <button key={nombre} type="button" role="tab" id={`admin-tab-${indice}`}
        aria-selected={activa === indice} aria-controls="admin-panel-ficha" tabIndex={activa === indice ? 0 : -1}
        data-pestana={indice} onClick={() => setActiva(indice)}>{nombre}</button>)}
    </div>
    <form onSubmit={guardar} noValidate>
      <fieldset disabled={guardando}>
        <div className="admin-fields" role="tabpanel" id="admin-panel-ficha" aria-labelledby={`admin-tab-${activa}`}>
          {activa === 0 && <>
            <Campo etiqueta="Nombre del comercio *" required {...campo('nombre')} />
            <Campo etiqueta="Categoría *" opciones={categorias.map(nombre => [nombre, nombre])} required {...campo('categoria')} />
            <Campo etiqueta="Subcategoría" {...campo('subcategoria')} />
            <Campo etiqueta="Tipo de ficha" opciones={tiposFicha} {...campo('tipo_ficha')} />
            <Campo etiqueta="Dirección" ancho {...campo('direccion')} />
            <Campo etiqueta="Descripción" multilinea ancho {...campo('descripcion')} />
          </>}
          {activa === 1 && <>
            <Campo etiqueta="Teléfono" type="tel" {...campo('telefono')} />
            <Campo etiqueta="WhatsApp" type="tel" {...campo('whatsapp')} />
            <Campo etiqueta="Horarios" multilinea ancho {...campo('horario_texto')} />
          </>}
          {activa === 2 && [
            ['web_url', 'Página web'], ['tienda_url', 'Tienda en línea'], ['instagram_url', 'Instagram'],
            ['facebook_url', 'Facebook'], ['tiktok_url', 'TikTok'],
          ].map(([nombre, etiqueta]) => <Campo key={nombre} etiqueta={etiqueta} inputMode="url" {...campo(nombre)} />)}
          {activa === 3 && <>
            {medios.map(([nombre, etiqueta, formatos]) => <div key={nombre} className="admin-media">
              {(formatos === 'image/*' || nombre === 'carta_pdf_url') &&
                <Imagen src={nombre === 'carta_pdf_url' && !/\.(avif|gif|jpe?g|png|svg|webp)([?#]|$)/i.test(formulario[nombre])
                  && !archivos.current.get(formulario[nombre])?.archivo.type.startsWith('image/') ? '' : formulario[nombre]}
                alt={etiqueta} className="admin-photo-media" />}
              <Campo etiqueta={etiqueta + ' · URL'} inputMode="url" {...campo(nombre)}
                value={archivos.current.has(formulario[nombre]) ? '' : formulario[nombre]} />
              {archivos.current.has(formulario[nombre]) && <p className="admin-file-name">{archivos.current.get(formulario[nombre]).archivo.name}</p>}
              <Campo etiqueta={`Subir archivo de ${etiqueta.toLowerCase()}`} type="file" accept={formatos} onChange={event => anexar(event, nombre)} />
            </div>)}
            <div className="admin-media admin-wide">
              <Campo etiqueta="Galería de fotografías" type="file" accept="image/*" multiple onChange={event => anexar(event, 'galeria_urls')} />
              <div className="admin-gallery">
                {formulario.galeria_urls.map((url, indice) => <div key={`${indice}-${url}`}>
                  <Imagen src={url} alt={`Foto ${indice + 1}`} />
                  <button type="button" className="admin-icon admin-danger" aria-label={`Quitar foto ${indice + 1} de la galería`} onClick={() =>
                    setFormulario(actual => ({ ...actual, galeria_urls: actual.galeria_urls.filter((_url, posicion) => posicion !== indice) }))}>
                    <Trash2 size={16} />
                  </button>
                </div>)}
              </div>
            </div>
          </>}
          {activa === 4 && <>
            <Campo etiqueta="Oferta flash o promoción" multilinea ancho {...campo('oferta_flash')} />
            <label className="admin-checkbox"><input type="checkbox" checked={formulario.destacado}
              onChange={event => setFormulario(actual => ({ ...actual, destacado: event.target.checked }))} /> Comercio destacado</label>
          </>}
          {activa === 5 && <>
            <Campo etiqueta="PIN del comercio" inputMode="numeric" {...campo('pin_acceso')} />
            <Campo etiqueta="Datos especiales de la ficha (JSON)" multilinea ancho spellCheck={false} {...campo('datos_especiales_json')} />
          </>}
        </div>
        <Aviso mensaje={mensaje} />
        <footer className="admin-editor-actions">
          <span role="status">{sucio ? 'Cambios sin guardar' : ''}</span>
          <button type="button" className="admin-button" onClick={cancelar}>Cancelar</button>
          <button type="submit" className="admin-button admin-primary"><Save size={17} /> {guardando ? 'Guardando…' : 'Guardar comercio'}</button>
        </footer>
      </fieldset>
    </form>
    {vista && <VistaFicha ficha={vista} archivoLocal={url => archivos.current.get(url)?.archivo} cerrar={() => setVista(null)} />}
  </section>;
}
