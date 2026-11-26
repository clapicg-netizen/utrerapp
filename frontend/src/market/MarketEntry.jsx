import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { marketBusinesses, marketCampaign, marketSponsor, readMarketSettings, settings } from './guide';
import { marketUrl, persistentMarket, privateTrials, privateTrialsEnabled } from './config';
import { useMarketSettings } from './repository';
import './market-entry.css';

const marketPath = process.env.PUBLIC_URL + '/utreramarket/index.html';
const fields = 'id,nombre,categoria,subcategoria,descripcion,direccion,telefono,whatsapp,portada_url,galeria_urls,web_url,tienda_url';

export function MarketBanner() {
  return <a className="utreramarket-banner" href={marketUrl}>
    <img src={process.env.PUBLIC_URL + '/utreramarket/market.webp'} alt="" width="768" height="512" />
    <span><strong>UtreraMarket</strong><small>El mercado de siempre, como nunca antes.</small></span>
    <span className="utreramarket-banner-action">Entrar al mercado</span>
  </a>;
}

export function useMarketGuide() {
  return useQuery({
    queryKey: ['utreramarket', 'guia-publica'],
    queryFn: async ({ signal }) => {
      const rows = [];
      const pageSize = 250;
      for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await supabase.from('comercios_utrera').select(fields)
          .order('id').range(offset, offset + pageSize - 1).abortSignal(signal);
        if (error) throw error;
        rows.push(...data);
        if (data.length < pageSize) return rows;
      }
    },
  });
}

export default function MarketEntry() {
  const frame = useRef(null);
  const { data, isPending, isError, refetch } = useMarketGuide();
  const saved = useMarketSettings();
  const entries = persistentMarket ? saved.data || {} : readMarketSettings();
  const id = new URLSearchParams(window.location.search).get('ensayo');
  const trial = privateTrialsEnabled && Object.hasOwn(privateTrials, id) ? privateTrials[id] : null;
  const payload = useRef(null);
  payload.current = { type: 'utreramarket:guide', stores: marketBusinesses(data || [], entries, !persistentMarket),
    campaign: marketCampaign(entries, !persistentMarket), sponsor: marketSponsor(entries, !persistentMarket), trial,
    trials: privateTrialsEnabled ? privateTrials : {}, preview: !persistentMarket,
    pending: isPending || (persistentMarket && saved.isPending), failed: isError || (persistentMarket && saved.isError) };

  const { refetch: refreshSaved } = saved;
  useEffect(() => {
    function receive(event) {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === 'utreramarket:ready') {
        event.source.postMessage(payload.current, event.origin);
      }
      if (event.data?.type === 'utreramarket:retry') {
        refetch();
        if (persistentMarket) refreshSaved();
      }
    }
    function refresh(event) {
      if (persistentMarket || (event.key !== settings.storageKey && event.key !== null)) return;
      const latest = readMarketSettings();
      const updated = { ...payload.current, stores: marketBusinesses(data || [], latest), campaign: marketCampaign(latest), sponsor: marketSponsor(latest) };
      frame.current?.contentWindow?.postMessage(updated, window.location.origin);
    }
    window.addEventListener('message', receive);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('message', receive);
      window.removeEventListener('storage', refresh);
    };
  }, [data, refetch, refreshSaved]);

  useEffect(() => {
    frame.current?.contentWindow?.postMessage(payload.current, window.location.origin);
  }, [data, isPending, isError, saved.data, saved.isPending, saved.isError]);

  return <iframe ref={frame} className="utreramarket-frame" src={marketPath + (trial ? '#ensayo-privado' : '')} title="UtreraMarket"
    onLoad={() => frame.current?.contentWindow?.postMessage(payload.current, window.location.origin)} />;
}
