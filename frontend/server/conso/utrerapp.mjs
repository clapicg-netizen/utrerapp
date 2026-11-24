import publicSupabase from '../../src/lib/publicSupabase.cjs';

export const app = {
  id: 'utrerapp-preview',
  name: 'UtrerApp',
  assistant: 'Conso',
  area: 'Utrera (Sevilla), Guadalema de los Quintero, Pinzón, Trajano y demás pedanías y núcleos del municipio',
  previewIntents: [
    { question: '¿Qué bares hay en Utrera?', variants: /^(?:(?:donde (?:puedo )?(?:tomar tapas|tapear))|(?:(?:recomiendame|busco|dime|que) (?:algunos )?(?:bares|tabernas)(?: hay)?))(?: en utrera)?$/ },
    { question: '¿Qué academias hay en Utrera?', variants: /^(?:busco|conoces|recomiendame|dime|donde (?:puedo )?encontrar|que) (?:una |alguna |algunas )?(?:academias?|centros? de formacion)(?: hay)?(?: en utrera)?$/ },
    { question: '¿Dónde puedo consultar las gestiones municipales de Utrera?', variants: /^(?:donde (?:puedo )?(?:consultar|hacer)|como (?:puedo )?hacer|quiero (?:consultar|hacer)) (?:las |los )?(?:gestiones municipales|tramites(?: municipales| del ayuntamiento)?)(?: (?:de|en) utrera)?$/ },
    { question: '¿Qué puedo visitar en Utrera?', variants: /^(?:que (?:puedo )?(?:ver|visitar|hacer)|que (?:sitios|lugares) recomiendas)(?: en utrera)?$/ },
    { question: '¿Dónde veo la información del tren?', variants: /^(?:donde (?:puedo )?(?:ver|consultar)|quiero (?:ver|consultar)|cual es) (?:el |los |la )?(?:horarios?|informacion)(?: del? | de los )(?:trenes?|cercanias)(?: (?:de|en) utrera)?$/ },
    {
      question: 'Hola',
      variants: /^(?:buenas(?: tardes| noches)?|buenos dias)$/,
      answer: '¡Hola! Puedo orientarte sobre comercios, sitios que visitar, trámites y trenes de Utrera.',
    },
    {
      question: '¿Dónde consulto las farmacias de guardia?',
      variants: /^(?:donde (?:puedo )?(?:consultar|ver)|que|cuales son) (?:las )?farmacias?(?: hay| estan| esta)? de guardia(?: hoy)?(?: en utrera)?$/,
      answer: 'Puedes consultar el calendario de farmacias de guardia en UtrerApp.',
      links: [{ label: 'Farmacias de guardia en UtrerApp', url: '/?vista=farmacias' }],
    },
    { question: '¿Cuál es la capital de Canadá?' },
  ],
  weather: {
    code: '41095', name: 'Utrera',
    url: 'https://www.aemet.es/es/eltiempo/prediccion/municipios/utrera-id41095',
  },
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
