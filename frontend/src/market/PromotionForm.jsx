import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { httpsUrl } from './guide';
import { persistentMarket } from './config';
import MarketImageField from './MarketImageField';
import { saveMarketSetting, settingsQuery } from './repository';

export default function PromotionForm({ id, name, entries, legacyTitle }) {
  const client = useQueryClient();
  const [promotion] = useState(() => entries['$promotion:' + id] || { title: legacyTitle, active: Boolean(legacyTitle) });
  const [photo, setPhoto] = useState(promotion.photo || '');
  const [active, setActive] = useState(Boolean(promotion.active));
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  async function save(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = data.get('title').trim();
    const end = data.get('end');
    const rawUrl = data.get('url').trim();
    const url = httpsUrl(rawUrl);
    const usualPrice = data.get('usualPrice');
    const offerPrice = data.get('offerPrice');
    if ((rawUrl && (!url || url.length > 2048)) || (active && (!title || !end))) {
      setStatus(rawUrl && (!url || url.length > 2048) ? 'Introduce un enlace HTTPS válido.' : 'Indica el título y la fecha de finalización para activar la promoción.');
      return;
    }
    setBusy(true);
    try {
      await saveMarketSetting('$promotion:' + id, { active, title, description: data.get('description').trim(), photo,
        usualPrice, offerPrice, end, url });
      if (persistentMarket) await client.invalidateQueries({ queryKey: settingsQuery });
      setStatus('Promoción guardada.');
    } catch {
      setStatus('No se pudo guardar la promoción.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="admin-surface market-admin-panel">
    <h2>Promoción de {name}</h2>
    {!persistentMarket && <p>La promoción y su foto se guardan en este navegador.</p>}
    <form className="market-admin-form" onSubmit={save}>
      <fieldset className="market-admin-group" disabled={busy}>
        <legend>{persistentMarket ? 'Oferta' : 'Oferta de prueba'}</legend>
        <label className="admin-field market-wide">Título <input name="title" maxLength={160} defaultValue={promotion.title} required={active} /></label>
        <label className="admin-field market-wide">Descripción <textarea name="description" rows={3} maxLength={400} defaultValue={promotion.description} /></label>
        <MarketImageField label="Fotografía del producto" value={photo} onChange={setPhoto} onBusy={setBusy} onError={setStatus} />
        <label className="admin-field">Precio habitual (€) <input name="usualPrice" type="number" min="0" max="9999999" step="0.01" defaultValue={promotion.usualPrice} /></label>
        <label className="admin-field">Precio promocional (€) <input name="offerPrice" type="number" min="0" max="9999999" step="0.01" defaultValue={promotion.offerPrice} /></label>
        <label className="admin-field">Fecha de finalización <input name="end" type="date" defaultValue={promotion.end} required={active} /></label>
        <label className="admin-field">Enlace directo a la oferta <input name="url" type="url" defaultValue={promotion.url} placeholder="https://…" /></label>
        <label className="market-check market-wide"><input type="checkbox" checked={active} onChange={event => setActive(event.target.checked)} /> Promoción activa</label>
      </fieldset>
      <div className="market-admin-actions">
        <button className="admin-button market-admin-primary" type="submit" disabled={busy}>Guardar promoción</button>
        <p role="status">{busy ? 'Procesando…' : status}</p>
      </div>
    </form>
  </section>;
}
