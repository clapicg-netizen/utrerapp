import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Aviso, Campo } from './Controles';
import { cargarAnuncio, destinos, etiquetas, fondos } from './modelos';

export default function EditorAnuncio({ anuncio, pendiente, ocupado, cancelar, guardado }) {
  const [original] = useState(() => cargarAnuncio(anuncio));
  const [formulario, setFormulario] = useState(original);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const sucio = JSON.stringify(formulario) !== JSON.stringify(original);

  useEffect(() => { pendiente(sucio); }, [pendiente, sucio]);

  function campo(nombre) {
    return {
      value: formulario[nombre],
      onChange: event => setFormulario(actual => ({ ...actual, [nombre]: event.target.value })),
    };
  }

  async function guardar(event) {
    event.preventDefault();
    if (guardando) return;
    if (![formulario.titulo, formulario.tipo, formulario.icono].every(texto => texto.trim())) {
      setMensaje({ error: true, texto: 'Indica el título, la etiqueta y el icono del anuncio.' });
      return;
    }
    const datos = {
      ...formulario,
      titulo: formulario.titulo.trim(),
      orden: formulario.orden === '' ? 1 : Number(formulario.orden),
    };
    setMensaje(null);
    setGuardando(true);
    ocupado(true);
    try {
      const consulta = supabase.from('anuncios');
      const { error } = anuncio
        ? await consulta.update(datos).eq('id', anuncio.id).select('id').single()
        : await consulta.insert(datos);
      if (error) throw error;
      guardado(anuncio ? 'Anuncio actualizado.' : 'Anuncio creado.');
    } catch (error) {
      setMensaje({ error: true, texto: `No se pudo guardar el anuncio. ${error.message}` });
    } finally {
      setGuardando(false);
      ocupado(false);
    }
  }

  return <section className="admin-surface admin-editor">
    <div className="admin-editor-head"><div><h2>{anuncio ? 'Editar anuncio' : 'Nuevo anuncio'}</h2>
      {anuncio && <p>{anuncio.titulo}</p>}</div></div>
    <form onSubmit={guardar}><fieldset disabled={guardando}>
      <div className="admin-fields">
        <Campo etiqueta="Título principal *" ancho required {...campo('titulo')} />
        <Campo etiqueta="Subtítulo o descripción" ancho multilinea {...campo('subtitulo')} />
        <Campo etiqueta="Etiqueta *" required {...campo('tipo')} />
        <Campo etiqueta="Icono *" required {...campo('icono')} />
        <Campo etiqueta="Destino al hacer clic" opciones={destinos} {...campo('accion_tab')} />
        <Campo etiqueta="Orden de aparición" type="number" step="1" {...campo('orden')} />
        <Campo etiqueta="Color de fondo" opciones={fondos} {...campo('bg_gradient')} />
        <Campo etiqueta="Color de la etiqueta" opciones={etiquetas} {...campo('color_badge')} />
        <label className="admin-checkbox"><input type="checkbox" checked={formulario.activo}
          onChange={event => setFormulario(actual => ({ ...actual, activo: event.target.checked }))} /> Mostrar en la portada</label>
      </div>
      <Aviso mensaje={mensaje} />
      <footer className="admin-editor-actions">
        <span role="status">{sucio ? 'Cambios sin guardar' : ''}</span>
        <button type="button" className="admin-button" onClick={cancelar}>Cancelar</button>
        <button type="submit" className="admin-button admin-primary"><Save size={17} /> {guardando ? 'Guardando…' : 'Guardar anuncio'}</button>
      </footer>
    </fieldset></form>
  </section>;
}
