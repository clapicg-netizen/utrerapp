import MarketImageField from './MarketImageField';
import PromotionForm from './PromotionForm';
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { marketUrl, persistentMarket, privateTrials, privateTrialsEnabled, pwaHome } from './config';
import { useMarketGuide } from './MarketEntry';
import '../pages/admin/dashboard.css';
import './market-admin.css';
import { defaults, guideImages, httpsUrl, integrationStatus, marketCampaign, marketSettings, marketSponsor, readMarketSettings } from './guide';

import { saveMarketSetting, settingsQuery, useMarketSettings } from './repository';

export default function MarketAdmin({ rows }) {
  const [id, setId] = useState('');
  const saved = useMarketSettings();
  const entries = persistentMarket ? saved.data || {} : readMarketSettings();
  if (persistentMarket && saved.isPending) return <p role="status">Cargando ajustes de UtreraMarket…</p>;
  if (persistentMarket && saved.isError) return <p role="alert">No se pudieron cargar los ajustes de UtreraMarket. <button className="admin-button" onClick={() => saved.refetch()}>Reintentar</button></p>;
  const selected = rows.find(row => String(row.id) === id) || rows[0];

  return <div className="market-admin">
    {privateTrialsEnabled && <section className="admin-surface market-admin-panel">
      <h2>Ensayo integrado privado</h2>
      <p>Abre las webs dentro del mercado para comprobar su funcionamiento. El ensayo no guarda una autorización ni cambia el escaparate.</p>
      <div className="market-admin-actions">
        {Object.entries(privateTrials).map(([id, trial]) =>
          <a className="admin-button" key={id} href={marketUrl + '&ensayo=' + id} target="_blank" rel="noopener noreferrer">Probar {trial.name}</a>)}
      </div>
    </section>}
    <section className="admin-surface market-admin-panel">
      <h2>Escaparates</h2>
      <p>{persistentMarket ? '' : 'Los ajustes de prueba se guardan en este navegador. '}El mercado reutiliza las fichas y fotos de la Guía Comercial.</p>
      {selected ? <>
        <label className="admin-field">Comercio de la Guía
          <select value={selected.id} onChange={event => setId(event.target.value)}>
            {rows.map(row => <option key={row.id} value={row.id}>{row.nombre}</option>)}
          </select>
        </label>
        <MarketSettingsForm key={selected.id} row={selected} entries={entries} />
      </> : <p>No hay comercios disponibles.</p>}
    </section>
    {selected && <PromotionForm key={selected.id} id={selected.id} name={selected.nombre} entries={entries}
      legacyTitle={marketSettings(selected, entries, !persistentMarket).promo} />}
    <CampaignForm entries={entries} />
    <SponsorForm entries={entries} />
  </div>;
}

function MarketSettingsForm({ row, entries }) {
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [current] = useState(() => marketSettings(row, entries, !persistentMarket));
  const inherited = defaults(row, !persistentMarket);
  const [links, setLinks] = useState(() => Array.isArray(current.links) ? current.links.map(link => ({
    label: typeof link?.label === 'string' ? link.label : '', url: typeof link?.url === 'string' ? link.url : '',
  })) : []);
  const [url, setUrl] = useState(current.url);
  const [mode, setMode] = useState(current.mode);
  const [authorized, setAuthorized] = useState(() => integrationStatus(current).authorized);
  const [compatible, setCompatible] = useState(() => integrationStatus(current).compatible);
  const [status, setStatus] = useState('');
  const images = guideImages(row);
  const missing = [!authorized && 'la autorización comercial', !compatible && 'la compatibilidad técnica'].filter(Boolean).join(' y ');
  const validUrl = httpsUrl(url);

  async function save(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const category = values.get('category').trim();
    if (url.trim() && !validUrl) {
      setStatus('Introduce una URL HTTPS válida del comercio.');
      form.elements.url.focus();
      return;
    }
    if (!category || (mode === 'embed' && !validUrl)) {
      setStatus('Indica una categoría y una URL para el modo integrado.');
      return;
    }
    const normalizedLinks = links.map(link => ({ label: link.label.trim(), url: httpsUrl(link.url) }));
    if (normalizedLinks.some(link => !link.label || !link.url)) {
      setStatus('Completa el texto y la URL HTTPS de cada enlace especial.');
      return;
    }
    setBusy(true);
    try {
      await saveMarketSetting(String(row.id), {
        active: values.has('active'), featured: values.has('featured'),
        category: category === inherited.category ? null : category, url: validUrl === inherited.url ? null : validUrl,
        image: images.includes(values.get('image')) ? values.get('image') : '',
        mode, authorizedUrl: authorized ? validUrl : '', compatibleUrl: compatible ? validUrl : '',
        promo: current.promo, links: normalizedLinks,
      });
      if (persistentMarket) await client.invalidateQueries({ queryKey: settingsQuery });
      setStatus('Ajustes guardados.');
    } catch {
      setStatus('No se pudieron guardar los ajustes.');
    } finally {
      setBusy(false);
    }
  }

  return <form className="market-admin-form" onSubmit={save}>
    <fieldset className="market-admin-group">
      <legend>Publicación del escaparate</legend>
      <label className="market-check"><input name="active" type="checkbox" defaultChecked={current.active} /> Participa en UtreraMarket</label>
      <label className="market-check"><input name="featured" type="checkbox" defaultChecked={current.featured} /> Escaparate destacado</label>
      <label className="admin-field">Categoría <input name="category" required maxLength={70} defaultValue={current.category} /></label>
      <label className="admin-field">Imagen autorizada de la Guía <select name="image" defaultValue={current.image}>
        <option value="">Imagen ilustrativa</option>
        {images.map((url, index) => <option key={url} value={url}>{url === httpsUrl(row.portada_url) ? 'Portada' : `Fotografía ${index + 1}`}</option>)}
      </select></label>
    </fieldset>
    <fieldset className="market-admin-group">
      <legend>Apertura de la web</legend>
      <label className="admin-field">Web comercial <input name="url" type="url" value={url} onChange={event => {
        setUrl(event.target.value);
        setAuthorized(false);
        setCompatible(false);
        setStatus('');
      }} /></label>
      <label className="admin-field">Modalidad <select name="mode" value={mode} onChange={event => setMode(event.target.value)}>
        <option value="external">Web externa</option><option value="embed">Web integrada</option>
      </select></label>
      <label className="market-check market-wide"><input name="authorized" type="checkbox" checked={authorized} disabled={!validUrl}
        onChange={event => setAuthorized(event.target.checked)} /> El comercio ha autorizado la integración de esta URL</label>
      <label className="market-check market-wide"><input name="compatible" type="checkbox" checked={compatible} disabled={!validUrl}
        onChange={event => setCompatible(event.target.checked)} /> He verificado la carga y navegación integrada de esta URL</label>
      {mode === 'embed' && (!validUrl || missing) && <p className="market-admin-warning market-wide" role="status">
        {!validUrl ? 'Indica una URL HTTPS para activar la integración.' : `La web seguirá abriéndose externamente. Falta confirmar ${missing}.`}
      </p>}
    </fieldset>
    <fieldset className="market-admin-group" disabled={busy}>
      <legend>Enlaces especiales</legend>
      {links.map((link, index) => <div className="market-special-link market-wide" key={index}>
        <label className="admin-field">Texto del enlace <input required maxLength={70} value={link.label}
          onChange={event => setLinks(links.map((item, i) => i === index ? { ...item, label: event.target.value } : item))} /></label>
        <label className="admin-field">URL del enlace <input type="url" required value={link.url}
          onChange={event => setLinks(links.map((item, i) => i === index ? { ...item, url: event.target.value } : item))} /></label>
        <button type="button" className="admin-button" aria-label={`Quitar enlace ${index + 1}`}
          onClick={() => setLinks(links.filter((_, i) => i !== index))}>Quitar</button>
      </div>)}
      <button className="admin-button" type="button" disabled={links.length >= 10}
        onClick={() => setLinks([...links, { label: '', url: '' }])}>Añadir enlace</button>
    </fieldset>
    <div className="market-admin-actions">
      <button className="admin-button market-admin-primary" type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar ajustes'}</button>
      <a className="admin-button" href={marketUrl} target="_blank" rel="noopener noreferrer">Abrir UtreraMarket</a>
      {status && <p role="status">{status}</p>}
    </div>
  </form>;
}

function CampaignForm({ entries }) {
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [campaign] = useState(() => marketCampaign(entries, !persistentMarket));
  const [image, setImage] = useState(campaign.image);
  const [status, setStatus] = useState('');

  async function save(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = data.get('title').trim();
    if (!title) {
      setStatus('Indica el título de la campaña.');
      return;
    }
    setBusy(true);
    try {
      await saveMarketSetting('$campaign', {
        active: data.has('active'), title,
        copy: data.get('copy').trim(), image,
      });
      if (persistentMarket) await client.invalidateQueries({ queryKey: settingsQuery });
      setStatus('Campaña guardada.');
    } catch {
      setStatus('No se pudo guardar la campaña.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="admin-surface market-admin-panel">
    <h2>Campaña</h2>
    <form className="market-admin-form" onSubmit={save}>
      <fieldset className="market-admin-group" disabled={busy}>
        <legend>{persistentMarket ? 'Contenido' : 'Contenido de prueba'}</legend>
        <label className="admin-field">Título <input required name="title" maxLength={100} defaultValue={campaign.title} /></label>
        <label className="admin-field market-wide">Descripción <textarea name="copy" rows={3} maxLength={400} defaultValue={campaign.copy} /></label>
        <MarketImageField label="Imagen de la campaña (opcional)" value={image} onChange={setImage} onBusy={setBusy} onError={setStatus} />
        <label className="market-check market-wide"><input name="active" type="checkbox" defaultChecked={campaign.active} /> Campaña visible</label>
      </fieldset>
      <div className="market-admin-actions">
        <button className="admin-button market-admin-primary" type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar campaña'}</button>
        {status && <p role="status">{status}</p>}
      </div>
    </form>
  </section>;
}

function SponsorForm({ entries }) {
  const client = useQueryClient();
  const [sponsor] = useState(() => marketSponsor(entries, !persistentMarket));
  const [image, setImage] = useState(sponsor.image);
  const [active, setActive] = useState(sponsor.active);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  async function save(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get('name').trim();
    const rawUrl = data.get('url').trim();
    const url = httpsUrl(rawUrl);
    if ((active && !name) || (rawUrl && (!url || url.length > 2048))) {
      setStatus(active && !name ? 'Indica el nombre del patrocinador.' : 'Introduce un enlace HTTPS válido.');
      return;
    }
    setBusy(true);
    try {
      await saveMarketSetting('$sponsor', { active, name, slogan: data.get('slogan').trim(), url, image });
      if (persistentMarket) await client.invalidateQueries({ queryKey: settingsQuery });
      setStatus('Patrocinio guardado.');
    } catch {
      setStatus('No se pudo guardar el patrocinio.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="admin-surface market-admin-panel">
    <h2>Patrocinio</h2>
    <form className="market-admin-form" onSubmit={save}>
      <fieldset className="market-admin-group" disabled={busy}>
        <legend>Contenido del patrocinador</legend>
        <label className="admin-field">Nombre <input name="name" required={active} maxLength={100} defaultValue={sponsor.name} /></label>
        <label className="admin-field">Eslogan <input name="slogan" maxLength={160} defaultValue={sponsor.slogan} /></label>
        <label className="admin-field market-wide">Web o tienda online <input name="url" type="url" maxLength={2048} defaultValue={sponsor.url} placeholder="https://…" /></label>
        <MarketImageField label="Logotipo o imagen publicitaria" value={image} onChange={setImage} onBusy={setBusy} onError={setStatus} />
        <label className="market-check market-wide"><input type="checkbox" checked={active} onChange={event => setActive(event.target.checked)} /> Patrocinio activo</label>
      </fieldset>
      <div className="market-admin-actions">
        <button className="admin-button market-admin-primary" type="submit" disabled={busy}>{busy ? 'Procesando…' : 'Guardar patrocinio'}</button>
        {status && <p role="status">{status}</p>}
      </div>
    </form>
  </section>;
}

export function MarketAdminPreview() {
  const { data, isPending, isError, refetch } = useMarketGuide();
  return <div className="admin-layout"><main className="admin-main market-admin-preview">
    <a className="admin-button" href={pwaHome}>Volver a la portada de UtrerApp</a>
    <h1>UtreraMarket · Administración de prueba</h1>
    {isPending && <p role="status">Cargando la Guía Comercial…</p>}
    {isError && <p role="status">No se pudo consultar la Guía Comercial. <button className="admin-button" onClick={() => refetch()}>Reintentar</button></p>}
    {data && <MarketAdmin rows={data} />}
  </main></div>;
}
