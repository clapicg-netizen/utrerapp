import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { persistentMarket } from './config';
import { marketSponsor, readMarketSettings, settings } from './guide';

const shopsTable = 'utreramarket_escaparates';
const campaignTable = 'utreramarket_campana';
const sponsorTable = 'utreramarket_patrocinio';
const promotionTable = 'utreramarket_promociones';
export const settingsQuery = ['utreramarket', 'ajustes'];

async function getSettings({ signal }) {
  const [campaignResult, sponsorResult] = await Promise.all([
    supabase.from(campaignTable).select('activa,titulo,descripcion,imagen').eq('id', 1).abortSignal(signal).maybeSingle(),
    supabase.from(sponsorTable).select('activo,nombre,eslogan,imagen,web_url').eq('id', 1).abortSignal(signal).maybeSingle(),
  ]);
  if (campaignResult.error) throw campaignResult.error;
  if (sponsorResult.error) throw sponsorResult.error;
  const campaign = campaignResult.data;
  const sponsor = sponsorResult.data;

  const entries = {};
  const pageSize = 250;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase.from(shopsTable).select(
      'comercio_id,activo,destacado,categoria,imagen_url,web_url,modalidad,url_autorizada,url_compatible,enlaces'
    ).order('comercio_id').range(offset, offset + pageSize - 1).abortSignal(signal);
    if (error) throw error;
    for (const row of data) {
      entries[row.comercio_id] = {
        active: row.activo, featured: row.destacado, category: row.categoria, image: row.imagen_url || '',
        url: row.web_url, mode: row.modalidad, authorizedUrl: row.url_autorizada || '',
        compatibleUrl: row.url_compatible || '', links: row.enlaces,
      };
    }
    if (data.length < pageSize) break;
  }
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase.from(promotionTable).select(
      'comercio_id,activa,titulo,descripcion,imagen,precio_habitual,precio_oferta,finaliza,web_url'
    ).order('comercio_id').range(offset, offset + pageSize - 1).abortSignal(signal);
    if (error) throw error;
    for (const row of data) entries['$promotion:' + row.comercio_id] = {
      active: row.activa, title: row.titulo, description: row.descripcion || '', photo: row.imagen || '',
      usualPrice: row.precio_habitual ?? '', offerPrice: row.precio_oferta ?? '', end: row.finaliza || '', url: row.web_url || '',
    };
    if (data.length < pageSize) break;
  }
  if (campaign) entries.$campaign = {
    active: campaign.activa, title: campaign.titulo, copy: campaign.descripcion || '', image: campaign.imagen || '',
  };
  if (sponsor) entries.$sponsor = {
    active: sponsor.activo, name: sponsor.nombre, slogan: sponsor.eslogan || '',
    image: sponsor.imagen || '', url: sponsor.web_url || '',
  };
  return entries;
}

export function useMarketSettings() {
  return useQuery({ queryKey: settingsQuery, queryFn: getSettings, enabled: persistentMarket });
}

export async function saveMarketSetting(key, value) {
  if (!persistentMarket) {
    const entries = readMarketSettings();
    if (key === '$campaign' && !entries.$sponsor && entries.$campaign?.sponsor) {
      const { active, name, slogan, image, url } = marketSponsor(entries);
      entries.$sponsor = { active, name, slogan, image, url };
    }
    window.localStorage.setItem(settings.storageKey, JSON.stringify({ ...entries, [key]: value }));
    return;
  }
  const { error } = key === '$campaign'
    ? await supabase.from(campaignTable).upsert({
      id: 1, activa: value.active, titulo: value.title, descripcion: value.copy, imagen: value.image || null,
    })
    : key === '$sponsor' ? await supabase.from(sponsorTable).upsert({
      id: 1, activo: value.active, nombre: value.name, eslogan: value.slogan,
      imagen: value.image || null, web_url: value.url || null,
    })
    : key.startsWith('$promotion:') ? await supabase.from(promotionTable).upsert({
      comercio_id: key.slice('$promotion:'.length), activa: value.active, titulo: value.title,
      descripcion: value.description || null, imagen: value.photo || null,
      precio_habitual: value.usualPrice === '' ? null : value.usualPrice,
      precio_oferta: value.offerPrice === '' ? null : value.offerPrice,
      finaliza: value.end || null, web_url: value.url || null,
    })
    : await supabase.from(shopsTable).upsert({
      comercio_id: key, activo: value.active, destacado: value.featured, categoria: value.category,
      imagen_url: value.image || null, web_url: value.url, modalidad: value.mode,
      url_autorizada: value.authorizedUrl || null, url_compatible: value.compatibleUrl || null,
      enlaces: value.links,
    });
  if (error) throw error;
}
