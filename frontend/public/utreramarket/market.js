const app = document.querySelector('#app');
const demo = '<div class="demo">UtrerApp · Integración de prueba</div>';
const escape = (value = '') => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
const normalize = value => String(value).normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim();
const link = (route, params = {}) => '#' + route + (Object.keys(params).length ? '?' + new URLSearchParams(params) : '');

let businesses = [];
let categories = [];
let guideStatus = 'pending';
let campaignData = {};
let sponsorData = {};
let privateTrial = null;
let privateTrials = {};
let preview = false;

function storeUrl(value) {
  try {
    const url = new URL(value, location.href);
    if (!value || url.username || url.password) return '';
    if (/^https:\/\//i.test(value) && url.protocol === 'https:') return url.href;
  } catch {
    // Invalid addresses are omitted.
  }
  return '';
}

function search(query = '') {
  return `<form class="search" role="search"><input aria-label="Buscar comercios" name="q" type="search" value="${escape(query)}" placeholder="Busca un comercio o categoría"><button class="button gold">Buscar</button></form>`;
}

function visual(store) {
  return `<div class="store-photo"><img src="${escape(store.commercialImage || store.categoryImage)}" alt="" width="768" height="512" loading="lazy" decoding="async">${store.commercialImage ? '' : '<span class="photo-caption">Imagen ilustrativa</span>'}</div>`;
}

function card(store) {
  return `<article class="card"><a href="${link('tienda',{id:store.id})}" aria-label="Ver escaparate de ${escape(store.nombre)}">${visual(store)}</a><div class="card-body"><div class="brandline"><span class="logo" aria-hidden="true">${escape(store.logo)}</span><div><p class="tag">${escape(store.categoria)}</p><h3>${escape(store.nombre)}</h3></div></div><p class="muted card-description">${escape(store.descripcion)}</p><a class="button" href="${link('tienda',{id:store.id})}">Ver escaparate<span hidden> de ${escape(store.nombre)}</span></a></div></article>`;
}

function cards(stores, empty = 'No hay comercios para mostrar.') {
  return stores.length ? `<div class="grid store-grid">${stores.map(card).join('')}</div>` : `<p class="empty">${empty}</p>`;
}

const promotionDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid', dateStyle: 'short' });
const promotionPrice = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const promotionEnd = new Intl.DateTimeFormat('es-ES', { timeZone: 'UTC', dateStyle: 'long' });

function activePromotion(store) {
  const saved = store.market.promotion;
  if (!saved) return store.market.promo?.trim() ? { title: store.market.promo } : null;
  if (!saved.active || !saved.title?.trim() || (saved.end && saved.end < promotionDate.format(new Date()))) return null;
  return saved;
}

function formatPrice(value) {
  return value !== undefined && value !== '' && Number.isFinite(Number(value)) ? promotionPrice.format(Number(value)) : '';
}

function promotionCard(store, offer) {
  const photo = mediaUrl(offer.photo);
  const fallback = store.commercialImage || store.categoryImage;
  const url = storeUrl(offer.url);
  const usual = formatPrice(offer.usualPrice);
  const price = formatPrice(offer.offerPrice);
  const end = new Date(offer.end);
  return `<article class="card promotion-card">
    <img src="${escape(photo || fallback)}" alt="" width="768" height="512" loading="lazy" decoding="async">
    <div class="card-body">
      <p class="tag">${escape(store.nombre)}${preview ? ' · Demo' : ''}</p>
      <h3>${escape(offer.title)}</h3>
      ${offer.description ? `<p class="muted">${escape(offer.description)}</p>` : ''}
      ${usual || price ? `<p class="promotion-prices">
        ${usual ? `<span>Precio habitual: ${price ? `<s>${usual}</s>` : usual}</span>` : ''}
        ${price ? `<strong>Precio promocional: ${price}</strong>` : ''}
      </p>` : ''}
      ${Number.isFinite(end.getTime()) ? `<p class="muted">Hasta el ${promotionEnd.format(end)}</p>` : ''}
      <a class="button" href="${url ? escape(url) : link('tienda',{id:store.id})}"${url ? ' target="_blank" rel="noopener noreferrer"' : ''}>Ver oferta</a>
    </div>
  </article>`;
}

function promos(stores) {
  const cards = stores.flatMap(store => {
    const offer = activePromotion(store);
    return offer ? [promotionCard(store, offer)] : [];
  });
  return cards.length ? `<section class="section"><div class="section-head"><h2>Novedades y promociones</h2></div><div class="grid store-grid">${cards.join('')}</div></section>` : '';
}

function mediaUrl(value) {
  return typeof value === 'string' && value.length <= 1000000 &&
    /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(value) ? value : '';
}

function campaign() {
  const { active, title, copy, image } = campaignData;
  if (!active || !title?.trim()) return '';
  const demoLabel = campaignData.demonstration ? ' · Demo' : '';
  const photo = mediaUrl(image);
  return `<section class="section"><article class="campaign"><p class="eyebrow">Campaña${demoLabel}</p><h2>${escape(title)}</h2>${photo ? `<img class="campaign-photo" src="${photo}" alt="" loading="lazy" decoding="async">` : ''}${copy?.trim() ? `<p>${escape(copy)}</p>` : ''}<a class="button gold" href="#comercios">Explorar comercios</a></article></section>`;
}

function sponsorship() {
  const { active, name, slogan, image, url, demonstration } = sponsorData;
  if (!active || !name?.trim()) return '';
  const href = storeUrl(url);
  const photo = mediaUrl(image);
  const logo = photo ? `<img class="sponsor-logo" src="${photo}" alt="${escape(name)}" loading="lazy" decoding="async">` : '';
  return `<section class="section"><aside class="sponsor sponsor-feature" aria-label="Patrocinio">
    ${logo && href ? `<a class="sponsor-logo-link" href="${escape(href)}" target="_blank" rel="noopener noreferrer" aria-label="Visitar la web de ${escape(name)}">${logo}</a>` : logo}
    <div><p class="tag">Patrocinio${demonstration ? ' · Demo' : ''}</p>
    <h3>${escape(name)}</h3>${slogan?.trim() ? `<p>${escape(slogan)}</p>` : ''}</div>
    ${href ? `<a class="button" href="${escape(href)}" target="_blank" rel="noopener noreferrer">Visitar web</a>` : ''}
  </aside></section>`;
}

function home(stores) {
  return `<div class="hero"><div class="shell"><p class="eyebrow">Comercio local · Utrera</p><h1>El mercado de siempre, <em>como nunca antes.</em></h1><p>Descubre escaparates, productos y novedades del comercio de Utrera.</p>${search()}</div></div>
  <div class="shell"><section class="section"><div class="section-head"><h2>Explora por categoría</h2><a class="outline" href="#comercios">Ver todos</a></div><div class="grid categories">${categories.map(category => {
    const { categoryImage } = businesses.find(store => store.categoria === category);
    return `<a class="category" href="${link('comercios',{categoria:category})}"><img src="${escape(categoryImage)}" alt="" width="768" height="512" loading="lazy" decoding="async">${escape(category)}</a>`;
  }).join('')}</div></section>
  <section class="section"><div class="section-head"><h2>Escaparates destacados</h2></div>${cards(stores.filter(store => store.market.featured),'No hay escaparates destacados.')}</section>
  ${promos(stores)}
  ${campaign()}
  ${sponsorship()}</div>`;
}

function catalog(stores, params) {
  const query = params.get('q') || '';
  const category = params.get('categoria') || '';
  const filters = ['', ...categories].map(name => {
    const next = Object.fromEntries([['q',query],['categoria',name]].filter(([,value]) => value));
    return `<a href="${link('comercios',next)}"${name === category ? ' aria-current="true"' : ''}>${escape(name || 'Todas')}</a>`;
  }).join('');
  const matches = stores.filter(store => (!category || category === store.categoria) &&
    normalize([store.nombre,store.categoria,store.descripcion].join(' ')).includes(normalize(query)));
  return `<section class="shell section stack"><h1>Comercios</h1>${search(query)}<div class="filters" aria-label="Categorías">${filters}</div><p class="muted">${matches.length} ${matches.length === 1 ? 'escaparate' : 'escaparates'}</p>${cards(matches,'Sin coincidencias. Prueba otra búsqueda o categoría.')}</section>`;
}

function frameAllowed(store, url) {
  return Boolean(store && url && store.market.mode === 'embed' && store.iframeApprovedUrl === url);
}

function specialLinks(links = []) {
  return links.map(({ label, url }) => {
    const href = storeUrl(url);
    return href ? `<a class="outline" href="${escape(href)}" target="_blank" rel="noopener noreferrer">${escape(label)}<span class="visually-hidden"> (nueva pestaña)</span></a>` : '';
  }).join('');
}

function integratedView(title, url, back, links) {
  return `<section class="integrated-view" aria-label="${escape(title)}">
    <header class="integrated-bar">
      <a class="brand" href="#inicio"><span class="seal">UM</span><span>Utrera<span class="accent">Market</span></span></a>
      <h1>${escape(title)}</h1>
      <nav aria-label="Navegación de la tienda">
        <a class="button gold" href="${escape(back)}">Volver al mercado</a>
        <a class="outline" href="${escape(url)}" target="_blank" rel="noopener noreferrer">Abrir web original</a>
        ${specialLinks(links)}
      </nav>
    </header>
    <iframe title="${escape(title)}" src="${escape(url)}" sandbox="allow-scripts allow-same-origin allow-forms" referrerpolicy="no-referrer"></iframe>
  </section>`;
}

function trialFor(id) {
  return Object.hasOwn(privateTrials, id) ? privateTrials[id] : null;
}

function detail(store) {
  if (!store) return '<section class="shell section stack"><h1>Escaparate no disponible</h1><a class="back" href="#comercios">Volver a comercios</a></section>';
  const offer = activePromotion(store);
  const url = storeUrl(store.market.url);
  const online = Boolean(url);
  const canEmbed = frameAllowed(store, url);
  const canTrial = !canEmbed && Boolean(trialFor(store.id));
  const integratedAction = canEmbed ? 'Entrar en la web integrada' : 'Probar web integrada';
  const integratedRoute = canEmbed ? 'integrada' : 'ensayo-privado';
  const showIntegratedAction = canEmbed || canTrial;
  const contact = [
    ['WhatsApp',store.whatsapp && 'https://wa.me/' + String(store.whatsapp).replace(/\D/g,'')],
    ['Teléfono',store.telefono && 'tel:' + String(store.telefono).replace(/[^\d+]/g,'')],
  ];
  const contacts = contact.map(([label,href]) => href ? `<a class="outline" href="${escape(href)}">${label}</a>` : '').join('') + specialLinks(store.links);
  return `<section class="shell section"><a class="back" href="#comercios">Volver a comercios</a><div class="detail">${visual(store)}<div class="stack"><p class="eyebrow">${escape(store.categoria)} · Escaparate</p><h1>${escape(store.nombre)}</h1><p>${escape(store.descripcion)}</p><p class="muted">${escape(store.direccion)}</p>
  ${online || showIntegratedAction ? `<div class="actions">${showIntegratedAction ? `<a class="button" href="${link(integratedRoute,{id:store.id})}">${integratedAction}</a>` : ''}${online ? `<a class="${showIntegratedAction ? 'outline' : 'button'}" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${showIntegratedAction ? 'Abrir web original' : escape(store.action)} <span hidden>(nueva pestaña)</span></a>` : ''}</div><p class="muted">${canTrial ? 'Ensayo privado. ' : !canEmbed ? 'La web se abre en una pestaña aparte. ' : ''}El comercio gestiona sus ventas y servicios.</p>` : ''}
  ${offer ? `<p class="note"><strong>Promoción${preview ? ' · Demo' : ''}</strong><br>${escape(offer.title)}</p>` : ''}
  ${contacts ? `<div class="actions">${contacts}</div>` : ''}

  </div></div></section>`;
}

function render() {
  const [route, query] = location.hash.slice(1).split('?');
  const params = new URLSearchParams(query);
  const stores = businesses;
  const selected = stores.find(store => store.id === params.get('id'));
  const url = selected && storeUrl(selected.market.url);
  const integrated = route === 'integrada' && frameAllowed(selected, url);
  const currentTrial = params.has('id') ? trialFor(params.get('id')) : privateTrial;
  const trialUrl = route === 'ensayo-privado' && storeUrl(currentTrial?.url);
  const showIntegrated = Boolean(integrated || trialUrl);
  document.body.classList.toggle('show-integrated', showIntegrated);
  let page;
  switch (route) {
    case 'comercios': page = catalog(stores,params); break;
    case 'integrada': page = integrated ? integratedView(selected.nombre,url,'#comercios',selected.links) : detail(selected); break;
    case 'ensayo-privado': page = trialUrl ? integratedView(currentTrial.name + ' · Ensayo privado', trialUrl, '#comercios', currentTrial.platformUrl ? [{ label: 'Abrir plataforma educativa', url: currentTrial.platformUrl }] : []) : home(stores); break;
    case 'campanas': page = `<div class="shell section stack"><h1>Campañas</h1>${campaign() + sponsorship() + promos(stores) || '<p class="empty">No hay campañas, promociones ni patrocinios activos.</p>'}</div>`; break;
    case 'tienda': page = detail(selected); break;
    default: page = home(stores);
  }
  if (!trialUrl && guideStatus === 'pending') page = '<p class="shell section" role="status">Cargando comercios…</p>';
  if (!trialUrl && guideStatus === 'failed') page = '<div class="shell section stack"><p role="status">No se pudo cargar la Guía Comercial.</p><button class="button" id="retry">Reintentar</button></div>';
  document.querySelector('#campaign-nav').hidden = !(campaignData.active && campaignData.title?.trim()) && !(sponsorData.active && sponsorData.name?.trim()) && !stores.some(activePromotion);
  app.innerHTML = preview && !showIntegrated ? demo + page : page;
  app.querySelector('#retry')?.addEventListener('click', () => parent.postMessage({type:'utreramarket:retry'}, location.origin));
  app.querySelector('.search')?.addEventListener('submit', event => {
    event.preventDefault();
    const q = new FormData(event.currentTarget).get('q').trim();
    const next = {};
    if (q) next.q = q;
    if (params.get('categoria')) next.categoria = params.get('categoria');
    location.hash = link('comercios',next);
  });
  window.scrollTo(0,0);
}

window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== parent || event.data?.type !== 'utreramarket:guide') return;
  businesses = event.data.stores;
  campaignData = event.data.campaign || {};
  sponsorData = event.data.sponsor || {};
  preview = event.data.preview === true;
  privateTrial = event.data.trial;
  privateTrials = event.data.trials || {};
  const [route, query] = location.hash.slice(1).split('?');
  const id = new URLSearchParams(query).get('id');
  const activeTrial = id === null ? privateTrial : trialFor(id);
  const trialAlreadyOpen = route === 'ensayo-privado' && activeTrial?.url === app.querySelector('iframe')?.getAttribute('src') &&
    Boolean(activeTrial?.url);
  categories = [...new Set(businesses.map(store => store.categoria))];
  guideStatus = event.data.failed ? 'failed' : event.data.pending ? 'pending' : 'ready';
  if (!trialAlreadyOpen) render();
});
window.addEventListener('hashchange', render);
parent.postMessage({type:'utreramarket:ready'}, location.origin);
render();
