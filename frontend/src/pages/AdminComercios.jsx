import React, { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, Eye, ImagePlus, LogOut, Plus, Search, Store } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './AdminComercios.css';

const categories = ['Hostelería', 'Comercio', 'Servicios', 'Salud y Belleza', 'Inmobiliarias', 'Formación'];
const fields = [
  ['nombre', 'Nombre'], ['categoria', 'Categoría'], ['subcategoria', 'Subcategoría'],
  ['direccion', 'Dirección'], ['horario_texto', 'Horario', 'multiline'],
  ['telefono', 'Teléfono', 'tel'], ['whatsapp', 'WhatsApp', 'tel'],
  ['descripcion', 'Descripción', 'multiline'],
  ['web_url', 'Web oficial', 'url'], ['tienda_url', 'Tienda online', 'url'],
  ['facebook_url', 'Facebook', 'url'], ['video_story_url', 'Vídeo', 'url'],
  ['portada_url', 'Portada', 'url'], ['logo_url', 'Logo', 'url'],
  ['carta_pdf_url', 'Carta en PDF o imagen', 'url'], ['galeria_urls', 'Galería', 'multiline'],
];
const columns = ['id', 'tipo_ficha', ...fields.map(([name]) => name)].join(',');
const media = {
  portada_url: 'image/jpeg,image/png,image/webp,image/avif',
  logo_url: 'image/jpeg,image/png,image/webp,image/avif',
  galeria_urls: 'image/jpeg,image/png,image/webp,image/avif',
  carta_pdf_url: 'application/pdf,image/jpeg,image/png,image/webp,image/avif',
  video_story_url: 'video/mp4,video/webm',
};

function normalizar(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function publicUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function toForm(row = {}) {
  return Object.fromEntries(fields.map(([name]) => [
    name, name === 'galeria_urls'
      ? (Array.isArray(row[name]) ? row[name].join('\n') : '')
      : row[name] ?? '',
  ]));
}

function changes(form, original) {
  const fieldsChanged = {};
  for (const [name, label, kind] of fields) {
    if (form[name] === original[name]) continue;
    const value = form[name].trim();
    if (name === 'galeria_urls') {
      const links = value.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      if (links.some(link => !publicUrl(link))) throw new Error('La galería necesita un enlace http o https por línea.');
      fieldsChanged[name] = links;
    } else {
      if (kind === 'url' && value && !publicUrl(value)) throw new Error(label + ' necesita un enlace http o https.');
      fieldsChanged[name] = value || null;
    }
  }
  return fieldsChanged;
}

export default function AdminComercios({ onBack }) {
  const [session, setSession] = useState(undefined);
  const [gate, setGate] = useState('cargando');
  const [email, setEmail] = useState('');
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(() => toForm());
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const user = session?.user?.id;
  const canEdit = Boolean(user) && gate === 'admin';

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;
    setGate('cargando');
    setRows([]);
    setSelected(null);
    setForm(toForm());
    setPreview(false);
    if (!user) return undefined;

    async function initialize() {
      try {
        const permission = await supabase.rpc('es_admin_comercios_utrera');
        if (!active) return;
        if (permission.error) throw permission.error;
        if (permission.data !== true) {
          setGate('sin-acceso');
          return;
        }
        const result = await supabase.from('comercios_utrera').select(columns).order('nombre');
        if (!active) return;
        if (result.error) throw result.error;
        setRows(result.data ?? []);
        setGate('admin');
      } catch {
        if (active) setGate('error');
      }
    }
    initialize();
    return () => { active = false; };
  }, [user, retry]);

  function open(row = {}) {
    setSelected(row);
    setForm(toForm(row));
    setPreview(false);
    setError('');
    setMessage('');
  }

  function update(name, value) {
    setForm(current => ({ ...current, [name]: value }));
  }

  async function login(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setBusy(true);
    try {
      const redirectTo = new URL(window.location.pathname, window.location.origin);
      redirectTo.searchParams.set('vista', 'admin-comercios');
      const result = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: false, emailRedirectTo: redirectTo.href },
      });
      if (result.error) throw result.error;
      setMessage('Revisa tu correo y abre el enlace de acceso.');
    } catch {
      setError('No se pudo enviar el enlace. Comprueba el correo o vuelve a intentarlo.');
    } finally {
      setBusy(false);
    }
  }

  async function upload(event, name) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !canEdit || !user) return;
    setMessage('');
    setError('');
    const formats = media[name].split(',');
    const limit = name === 'video_story_url' ? 40 : 8;
    const extension = file.name.toLowerCase().split('.').pop();
    if (!formats.includes(file.type) || !/^(jpe?g|png|webp|avif|pdf|mp4|webm)$/.test(extension) || file.size > limit * 1024 * 1024) {
      setError('El formato no es compatible o el archivo supera ' + limit + ' MB.');
      return;
    }
    setBusy(true);
    try {
      const filePath = 'gestor/' + user + '/' + crypto.randomUUID() + '.' + extension;
      const bucket = supabase.storage.from('comercios');
      const response = await bucket.upload(filePath, file, { upsert: false, cacheControl: '3600', contentType: file.type });
      if (response.error) throw response.error;
      const url = bucket.getPublicUrl(response.data.path).data.publicUrl;
      setForm(current => ({ ...current, [name]: name === 'galeria_urls' ? [current[name], url].filter(Boolean).join('\n') : url }));
      setMessage('Archivo subido. Publica la ficha para que aparezca en la Guía.');
    } catch {
      setError('No se pudo subir el archivo. Puedes reintentar o introducir su enlace.');
    } finally {
      setBusy(false);
    }
  }

  async function save(event) {
    event.preventDefault();
    if (!selected || !canEdit) return;
    setError('');
    setMessage('');
    if (!form.nombre.trim() || !form.categoria.trim()) {
      setError('Completa el nombre y la categoría.');
      return;
    }

    let patch;
    try {
      patch = changes(form, toForm(selected));
    } catch (err) {
      setError(err.message);
      return;
    }
    if (!Object.keys(patch).length) {
      setMessage('No hay cambios que publicar.');
      return;
    }
    setBusy(true);
    try {
      const table = supabase.from('comercios_utrera');
      const write = selected.id == null
        ? table.insert({ ...patch, tipo_ficha: 'normal' })
        : table.update(patch).eq('id', selected.id);
      const result = await write.select(columns).single();
      if (result.error || !result.data) throw result.error || new Error('Sin registro');
      const row = result.data;
      setRows(current => [...current.filter(item => item.id !== row.id), row]
        .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es')));
      open(row);
      setMessage('Ficha publicada en la Guía Comercial.');
    } catch {
      setError('No se pudo publicar. Conservamos tus cambios en el formulario.');
    } finally {
      setBusy(false);
    }
  }

  const filtered = rows.filter(row => normalizar([row.nombre, row.categoria, row.subcategoria].join(' ')).includes(normalizar(search.trim())));
  const photos = form.galeria_urls.split(/\r?\n/).map(publicUrl).filter(Boolean);

  return (
    <section className="admin-commerce">
      <button type="button" className="admin-commerce-back" onClick={onBack}><ArrowLeft size={16} aria-hidden="true" /> Volver al inicio</button>
      <header className="admin-commerce-header">
        <div><Store size={21} aria-hidden="true" /><h1>Administración de comercios</h1></div>
        {session && <button type="button" disabled={busy} onClick={() => supabase.auth.signOut()}><LogOut size={16} aria-hidden="true" /> Cerrar sesión</button>}
      </header>

      {error && <p className="admin-commerce-feedback admin-commerce-error" role="alert">{error}</p>}
      {message && <p className="admin-commerce-feedback" role="status">{message}</p>}
      {session === undefined && <p role="status">Comprobando sesión…</p>}
      {session === null && <form className="admin-commerce-login" onSubmit={login}>
        <label>Correo de administración<input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>
        <button className="admin-commerce-primary" type="submit" disabled={busy}>Enviar enlace de acceso</button>
      </form>}
      {session && gate === 'cargando' && <p role="status">Comprobando permisos…</p>}
      {session && gate === 'sin-acceso' && <p role="status">Esta cuenta no tiene acceso a la administración de comercios.</p>}
      {session && gate === 'error' && <p role="status">No se pudieron comprobar los permisos. <button type="button" onClick={() => setRetry(value => value + 1)}>Reintentar</button></p>}

      {canEdit && <div className="admin-commerce-layout">
        <aside className="admin-commerce-list">
          <button type="button" className="admin-commerce-primary" disabled={busy} onClick={() => open()}><Plus size={17} aria-hidden="true" /> Nuevo comercio</button>
          <label><Search size={16} aria-hidden="true" /> Buscar comercio<input type="search" value={search} onChange={event => setSearch(event.target.value)} /></label>
          <ul>{filtered.map(row => <li key={row.id}>
            <button type="button" disabled={busy} aria-pressed={selected?.id === row.id} onClick={() => open(row)}>
              <strong>{row.nombre || 'Comercio sin nombre'}</strong><span>{row.categoria}</span>
            </button>
          </li>)}</ul>
          {filtered.length === 0 && <p>No hay comercios que coincidan.</p>}
        </aside>
        <div className="admin-commerce-work">
          {!selected ? <p>Selecciona un comercio o crea uno nuevo.</p> : <>
            <div className="admin-commerce-editor-heading">
              <h2>{selected.id == null ? 'Nuevo comercio' : 'Editar comercio'}</h2>
              <button type="button" onClick={() => setPreview(value => !value)}><Eye size={17} aria-hidden="true" /> {preview ? 'Editar datos' : 'Vista previa'}</button>
            </div>
            {preview ? <article className="admin-commerce-preview">
              {publicUrl(form.portada_url) && <img src={publicUrl(form.portada_url)} alt="" />}
              <h3>{form.nombre || 'Nombre del comercio'}</h3>
              <p>{form.subcategoria || form.categoria}</p>
              <p>{form.descripcion}</p>
              <p>{[form.direccion, form.horario_texto].filter(Boolean).join(' · ')}</p>
              {publicUrl(form.carta_pdf_url) && <a href={publicUrl(form.carta_pdf_url)} target="_blank" rel="noreferrer">Ver carta <ExternalLink size={14} aria-hidden="true" /></a>}
              {publicUrl(form.video_story_url) && <a href={publicUrl(form.video_story_url)} target="_blank" rel="noreferrer">Ver vídeo <ExternalLink size={14} aria-hidden="true" /></a>}
              {photos.length > 0 && <div>{photos.map((url, index) => <img key={url + index} src={url} alt={'Foto ' + (index + 1)} loading="lazy" />)}</div>}
            </article> : <form onSubmit={save} className="admin-commerce-form">
              <fieldset disabled={busy}>
                {fields.map(([name, label, kind]) => <div key={name} className={kind === 'multiline' ? 'admin-commerce-wide' : ''}>
                  <label>{label}
                    {name === 'categoria' ? (
                      <select required value={form[name]} onChange={event => update(name, event.target.value)}>
                        <option value="">Seleccionar</option>
                        {form.categoria && !categories.includes(form.categoria) && <option>{form.categoria}</option>}
                        {categories.map(category => <option key={category}>{category}</option>)}
                      </select>
                    ) : kind === 'multiline'
                      ? <textarea rows={name === 'descripcion' ? 4 : 2} value={form[name]} onChange={event => update(name, event.target.value)} />
                      : <input type={kind === 'tel' ? 'tel' : 'text'} inputMode={kind === 'url' ? 'url' : undefined} required={name === 'nombre'} value={form[name]} onChange={event => update(name, event.target.value)} />}
                  </label>
                  {media[name] && <label className="admin-commerce-file">
                    <ImagePlus size={15} aria-hidden="true" /> Subir archivo para {label.toLowerCase()}
                    <input type="file" accept={media[name]} onChange={event => upload(event, name)} />
                  </label>}
                </div>)}
              </fieldset>
              <button className="admin-commerce-primary" type="submit" disabled={busy}>Publicar en la Guía</button>
            </form>}
          </>}
        </div>
      </div>}
    </section>
  );
}
