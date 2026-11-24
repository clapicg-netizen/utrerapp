import publicSupabase from '../../src/lib/publicSupabase.cjs';

export const app = {
  id: 'utrerapp-preview',
  name: 'UtrerApp',
  assistant: 'Conso',
  area: 'Utrera (Sevilla), Guadalema de los Quintero, Pinzón, Trajano y demás pedanías y núcleos del municipio',
  previewQuestions: [
    '¿Qué bares hay en Utrera?',
    '¿Qué academias hay en Utrera?',
    '¿Dónde puedo consultar las gestiones municipales de Utrera?',
    '¿Qué puedo visitar en Utrera?',
    '¿Dónde veo la información del tren?',
    '¿Cuál es la capital de Canadá?',
  ],
  directoryQueries: {
    '¿Qué bares hay en Utrera?': ['bar', 'bares', 'taberna', 'tapas'],
    '¿Qué academias hay en Utrera?': ['academia', 'academias', 'formación'],
  },
  timeZone: 'Europe/Madrid',
  defaultPersonality: 'Cercana, amable y directa. Responde en español por defecto y cambia al idioma de la consulta si procede.',
  db: publicSupabase,
  official: [
    { label: 'Ayuntamiento de Utrera', url: 'https://www.utrera.org/' },
    { label: 'Renfe', url: 'https://www.renfe.com/' },
    { label: 'Junta de Andalucía', url: 'https://www.juntadeandalucia.es/' },
  ],
  sections: {
    pharmacy: { label: 'Farmacias de UtrerApp', url: '/?vista=farmacias' },
    transport: { label: 'Cercanías en UtrerApp', url: '/?vista=cercanias' },
    municipal: { label: 'Agenda de gestiones de UtrerApp', url: '/?vista=agenda-gestiones' },
    tourism: { label: 'Qué ver en UtrerApp', url: '/?vista=que-ver' },
    events: { label: 'Agenda de UtrerApp', url: '/?vista=menu-agenda' },
  },
  directoryLink: id => '/?vista=market&ficha=' + encodeURIComponent(id),
};

export async function readPublic(db, table, params) {
  const response = await fetch(db.url + '/rest/v1/' + table + '?' + new URLSearchParams(params), {
    headers: { apikey: db.anonKey, Authorization: 'Bearer ' + db.anonKey },
    signal: AbortSignal.timeout(4500),
  });
  if (!response.ok) throw new Error('Public source unavailable');
  return response.json();
}

export async function directory(db) {
  const rows = [];
  for (let offset = 0; offset < 10000; offset += 200) {
    const page = await readPublic(db, 'comercios_utrera', {
      select: 'id,nombre,categoria,subcategoria,descripcion,destacado',
      order: 'id', limit: '200', offset: String(offset),
    });
    rows.push(...page);
    if (page.length < 200) return rows;
  }
  throw new Error('Directory exceeds retrieval capacity');
}
