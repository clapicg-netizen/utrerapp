export const settings = { name: 'UtreraMarket', storageKey: 'utrerapp-market-preview-v1' };

export const jmPlatformUrl = 'https://plataforma.jmformacion.com/';

export const pilot = {
  13: { active: true, featured: true, category: 'Electrodomésticos, hogar y tecnología', url: 'https://www.digitalgm.es/', art: 'electrodomesticos.webp' },
  10: { active: true, featured: true, category: 'Hostelería y gastronomía', url: 'https://www.lachanataberna.es/?i=1', art: 'gastronomia.webp' },
  14: { active: true, featured: true, category: 'Hostelería y gastronomía', url: 'https://bar-alonsi-tapas.jimdosite.com/', art: 'bar-alonsi.webp' },
  15: { active: true, featured: true, category: 'Formación y enseñanza', url: 'https://www.jmformacion.com/', art: 'formacion.webp' },
};

export function httpsUrl(value, origin = window.location.origin) {
  try {
    const url = new URL(String(value ?? '').trim());
    return url.protocol === 'https:' && url.origin !== origin && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
}

export function defaults(row, preview = true) {
  const match = row.nombre?.trim().toLowerCase() === 'innpresionante';
  const preset = preview ? pilot[row.id] || (match ? {
    active: true, featured: true, category: 'Moda y artículos de regalo', url: 'https://www.innpresionante.com/', art: 'textil.webp',
  } : {}) : {};
  return {
    active: false, featured: false, category: row.subcategoria || row.categoria || 'Comercio',
    links: String(row.id) === '15' ? [{ label: 'Abrir plataforma educativa', url: jmPlatformUrl }] : [],
    art: pilot[row.id]?.art || (match ? 'textil.webp' : 'market.webp'), mode: 'external', authorizedUrl: '', compatibleUrl: '', image: '', promo: '', ...preset,
    url: httpsUrl(row.tienda_url) || httpsUrl(row.web_url) || preset.url || '',
  };
}

export function readMarketSettings(storage = window.localStorage) {
  try {
    return JSON.parse(storage.getItem(settings.storageKey)) || {};
  } catch {
    return {};
  }
}

export function marketSettings(row, entries, preview = true) {
  const base = defaults(row, preview);
  const entry = entries[String(row.id)] || {};
  return { ...base, ...entry, category: entry.category ?? base.category, url: entry.url ?? base.url };
}

export function guideImages(row) {
  return [...new Set([row.portada_url, ...(Array.isArray(row.galeria_urls) ? row.galeria_urls : [])].map(value => httpsUrl(value)).filter(Boolean))];
}

export function marketBusinesses(rows, entries, preview = true) {
  return rows.flatMap(row => {
    const market = marketSettings(row, entries, preview);
    if (!market.active) return [];
    return [{
      id: String(row.id), nombre: row.nombre, categoria: market.category, descripcion: row.descripcion || '',
      direccion: row.direccion || '', telefono: row.telefono, whatsapp: row.whatsapp,
      logo: row.nombre.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase(),
      categoryImage: market.art, commercialImage: guideImages(row).includes(market.image) ? market.image : '',
      action: 'Visitar web del comercio',
      links: safeLinks(market.links),
      demonstration: preview,
      iframeApprovedUrl: integrationStatus(market).ready ? httpsUrl(market.url) : '',
      market: { mode: market.mode, url: market.url, featured: market.featured, promo: market.promo,
        promotion: entries['$promotion:' + row.id] },
    }];
  });
}

export function integrationStatus({ url, authorizedUrl, compatibleUrl }) {
  const valid = httpsUrl(url);
  const authorized = Boolean(valid && valid === authorizedUrl);
  const compatible = Boolean(valid && valid === compatibleUrl);
  return { authorized, compatible, ready: authorized && compatible };
}

export const defaultCampaign = {
  active: true,
  title: 'Una vuelta por el mercado',
  copy: 'Escaparates para descubrir la próxima vez que salgas a comprar por Utrera.',
  sponsor: 'Espacio para un comercio patrocinador',
};

export function marketCampaign(entries, preview = true) {
  const base = preview ? { ...defaultCampaign, active: false, sponsor: '' } : { active: false, title: '', copy: '' };
  return { ...base, image: '', ...entries.$campaign, demonstration: preview };
}

export function marketSponsor(entries, preview = true) {
  const legacy = preview ? entries.$campaign : null;
  return { active: Boolean(legacy?.active && legacy.sponsor?.trim()), name: legacy?.sponsor || '',
    slogan: '', url: '', image: '', ...entries.$sponsor, demonstration: preview };
}

export function safeLinks(links) {
  if (!Array.isArray(links)) return [];
  return links.slice(0, 10).flatMap(link => {
    const label = typeof link?.label === 'string' ? link.label.trim().slice(0, 70) : '';
    const url = httpsUrl(link?.url);
    return label && url ? [{ label, url }] : [];
  });
}
