import { model } from './gemini.mjs';

import { openaiModel } from './openai.mjs';

export const models = { gemini: model, openai: openaiModel };
export const billingReady = (provider, env) =>
  (provider === 'openai' ? env.CONSO_OPENAI_BILLING_CONFIRMED : env.CONSO_GEMINI_BILLING_CONFIRMED) === 'true';
export function defaults(app) {
  return {
    enabled: false, adultAccessVerified: false, provider: 'openai', model: openaiModel, region: 'global', personality: app.defaultPersonality,
    directory: true, pharmacies: true, official: true,
    commercialPriority: true, externalSearch: false, userLimit: 20, globalLimit: 100,
  };
}

export function validSettings(settings, app) {
  const shape = defaults(app);
  if (!settings || typeof settings !== 'object' || Object.keys(settings).length !== Object.keys(shape).length) return false;
  return Object.keys(shape).every(key => typeof settings[key] === typeof shape[key]) &&
    Object.hasOwn(models, settings.provider) && models[settings.provider] === settings.model &&
    ['global', 'eu'].includes(settings.region) && settings.personality.trim().length > 0 && settings.personality.length <= 480 &&
    Number.isInteger(settings.userLimit) && settings.userLimit > 0 && settings.userLimit <= 20 &&
    Number.isInteger(settings.globalLimit) && settings.globalLimit >= settings.userLimit && settings.globalLimit <= 100;
}

export const localDay = (zone, date = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: zone }).format(date);

export function loadSettings(app, env) {
  const values = defaults(app);
  const flags = {
    enabled: 'CONSO_ENABLED', adultAccessVerified: 'CONSO_ADULT_ACCESS_VERIFIED', directory: 'CONSO_DIRECTORY', pharmacies: 'CONSO_PHARMACIES',
    official: 'CONSO_OFFICIAL_SOURCES',
  };
  for (const [key, name] of Object.entries(flags)) {
    if (env[name] != null) values[key] = env[name] === 'true';
  }
  values.provider = env.CONSO_AI_PROVIDER ?? values.provider;
  values.model = env.CONSO_AI_MODEL ?? (values.provider === 'gemini' ? env.CONSO_GEMINI_MODEL : undefined) ?? models[values.provider];
  values.region = env.CONSO_OPENAI_REGION ?? values.region;
  values.personality = env.CONSO_PERSONALITY ?? values.personality;
  values.userLimit = Number(env.CONSO_USER_LIMIT ?? values.userLimit);
  values.globalLimit = Number(env.CONSO_GLOBAL_LIMIT ?? values.globalLimit);
  if (!validSettings(values, app)) throw new Error('Invalid Conso configuration');
  return values;
}
