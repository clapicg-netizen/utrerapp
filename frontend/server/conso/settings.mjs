import { model } from './gemini.mjs';

export const models = [model];
export const rates = {
  [model]: { input: 250, output: 1500 },
};

export function defaults(app) {
  return {
    enabled: false, model, personality: app.defaultPersonality,
    directory: true, pharmacies: true, official: true,
    commercialPriority: true, externalSearch: false, userLimit: 20, globalLimit: 200,
  };
}

export function validSettings(settings, app) {
  const shape = defaults(app);
  if (!settings || typeof settings !== 'object' || Object.keys(settings).length !== Object.keys(shape).length) return false;
  return Object.keys(shape).every(key => typeof settings[key] === typeof shape[key]) &&
    models.includes(settings.model) && settings.personality.trim().length > 0 && settings.personality.length <= 480 &&
    Number.isInteger(settings.userLimit) && settings.userLimit > 0 && settings.userLimit <= 20 &&
    Number.isInteger(settings.globalLimit) && settings.globalLimit >= settings.userLimit && settings.globalLimit <= 200;
}

export const localDay = (zone, date = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: zone }).format(date);

export function loadSettings(app, env) {
  const values = defaults(app);
  const flags = {
    enabled: 'CONSO_ENABLED', directory: 'CONSO_DIRECTORY', pharmacies: 'CONSO_PHARMACIES',
    official: 'CONSO_OFFICIAL_SOURCES', commercialPriority: 'CONSO_COMMERCIAL_PRIORITY',
    externalSearch: 'CONSO_EXTERNAL_SEARCH',
  };
  for (const [key, name] of Object.entries(flags)) {
    if (env[name] != null) values[key] = env[name] === 'true';
  }
  values.model = env.CONSO_GEMINI_MODEL ?? values.model;
  values.personality = env.CONSO_PERSONALITY ?? values.personality;
  values.userLimit = Number(env.CONSO_USER_LIMIT ?? values.userLimit);
  values.globalLimit = Number(env.CONSO_GLOBAL_LIMIT ?? values.globalLimit);
  if (!validSettings(values, app)) throw new Error('Invalid Conso configuration');
  return values;
}
