import { jmPlatformUrl } from './guide';

const marketPreview = process.env.REACT_APP_UTRERAMARKET_PREVIEW === 'true';
export const persistentMarket = !marketPreview && process.env.REACT_APP_UTRERAMARKET === 'true';
export const marketEnabled = marketPreview || persistentMarket;

export const hostedMarketPreview = marketPreview && process.env.REACT_APP_UTRERAMARKET_HOSTED_PREVIEW === 'true';
export const consoRedesign = hostedMarketPreview || persistentMarket;
export const pwaHome = hostedMarketPreview ? process.env.PUBLIC_URL + '/index.html' : '/';
export const marketUrl = pwaHome + '?vista=utreramarket';
export const marketAdminUrl = hostedMarketPreview ? pwaHome + '?prueba=utreramarket' : '/admin?prueba=utreramarket';

export const privateTrialsEnabled = hostedMarketPreview &&
  window.location.hostname === 'utreramarket-preview.dynamicounce8.chatgpt.site';
export const privateTrials = {
  13: { name: 'DIGITAL GM', url: 'https://www.digitalgm.es/' },
  15: { name: 'JM FORMACIÓN', url: 'https://www.jmformacion.com/', platformUrl: jmPlatformUrl },
};
