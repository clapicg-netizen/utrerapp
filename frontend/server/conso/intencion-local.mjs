import { normalizePreviewQuestion } from './preview.mjs';

export const contextosLocales = ['education', 'food', 'municipal', 'transport', 'fuel', 'events'];
const temaEducacion = /\b(academias?|formacion|cursos?|oposiciones?)\b/;
const temaComida = /\b(restaurantes?|comer|cenar|almorzar|hosteleria|tapas|tapear)\b/;
const temaPadron = /\b(empadronamiento|empadronarme|padron(?: municipal)?)\b/;
const eventoLocal = /\b(?:fiestas|feria|procesiones|agenda municipal|actividades municipales)\b/;
const temaTren = /\b(?:trenes?|cercanias|renfe|ferrocarril)\b/;
const temaGasolina = /\b(?:gasolineras?|gasolina|diesel|gasoleo|repostar|glp)\b/;
const sensible = /[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b\d{8}[a-z]\b|\b[xyz]\d{7}[a-z]\b|\b(?:\d[ -]?){9,}\b/i;

export function consultaSensible(question) {
  return sensible.test(question);
}
export function localIntent(question, context) {
  const frase = normalizePreviewQuestion(question);
  const ubicacion = frase.match(/\ben (utrera|guadalema(?: de los quintero)?|pinzon|trajano|[a-z]+(?: [a-z]+){0,3})$/)?.[1];
  if (ubicacion && !/^(?:utrera|guadalema(?: de los quintero)?|pinzon|trajano|familia|pareja|grupo|diciembre)$/.test(ubicacion)) return;
  if (/\b(?:fuera del directorio|extern[oa]s?|sin gluten|vegano|vegana|alergias?|a domicilio|menu del dia|terraza)\b/.test(frase)) return;

  // El contexto solo completa un fragmento; una intención nueva tiene prioridad.
  const fragmento = /^(?:y\s+)?(?:(?:de|para)\s+)?(?:oposiciones?|formacion|formacion profesional)$/;
  const seguimiento = /^(?:y\s+)?(?:cuanto (?:cuesta|vale)|tienen? (?:pagina web|horario)|que horario tienen)(?:\s+.*)?$/;
  if (temaPadron.test(frase) && !/\bdatos de (?:otra persona|terceros)\b/.test(frase)) {
    if (/\b(?:certificados?|volantes?|acreditar|justificantes?)\b/.test(frase)) return { topic:'municipal', action:'certificado' };
    return { topic:'municipal', action:'padron' };
  }
  if (temaEducacion.test(frase) || (context==='education' && fragmento.test(frase))) {
    return { topic:'education', especialidad: /\boposiciones?\b/.test(frase) ? 'oposicion' :
      /\bformacion profesional\b/.test(frase) ? 'formacion profesional' : '' };
  }
  if (temaComida.test(frase)) return {topic:'food'};
  if (temaGasolina.test(frase)) return {topic:'fuel', fuel:/diesel|gasoleo/.test(frase)?'diesel':/\b98\b/.test(frase)?'gasolina98':/\bglp\b/.test(frase)?'glp':/95|gasolina/.test(frase)?'gasolina95':null};
  if (temaTren.test(frase)) {
    const destinos = [...new Set((frase.match(/\b(?:sevilla|cadiz|dos hermanas|santa justa|lebrija|las cabezas|aeropuerto|madrid|cordoba|malaga|huelva)\b/g) || []))];
    const ahora = !/\b(?:manana|domingo|sabado|lunes|martes|miercoles|jueves|viernes|semana|mes)\b/.test(frase);
    return {topic:'transport', tipo:/\bllegad/.test(frase)?'arrival':'departure', ahora, destinos};
  }
  if (eventoLocal.test(frase)) return {topic:'events'};
  if (['education','food'].includes(context) && seguimiento.test(frase)) return {topic:context, ficha:true};
}

const enlaces = {
  padron: {label:'Servicio municipal de padrón',url:'https://www.utrera.org/project/servicio-de-expedicion-de-certificados-de-empadronamiento/'},
  certificado: {label:'Certificado de empadronamiento individual · Ayuntamiento',url:'https://www.utrera.org/project/servicio-de-certificado-de-empadronamiento-individual/'},
  sede:{label:'Sede Electrónica de Utrera',url:'https://sede.utrera.org/'},
  eventos:{label:'Agenda oficial del Ayuntamiento',url:'https://www.utrera.org/agenda/'},
  fuel:{label:'Comparador de gasolineras de UtrerApp',url:'/?vista=gasolineras'},
};

export async function contestarLocal(intent, {app,settings,sources,loadFuel,loadTrain}) {
  const {topic} = intent;
  if (topic==='municipal' && settings.official) {
    return intent.action==='certificado' ? {
      answer:'En la Sede Electrónica de Utrera, busca «Certificado de empadronamiento individual». Puedes identificarte con Cl@ve o certificado digital. Para solicitarlo en persona, la ficha municipal indica que debes pedir cita en el Servicio de Atención a la Ciudadanía.',
      links:[enlaces.certificado,enlaces.sede],
    } : {answer:'¿Buscas acreditar tu empadronamiento, darte de alta o cambiar de domicilio? El trámite depende de lo que necesites.',links:[enlaces.padron,enlaces.sede]};
  }
  if (topic==='events' && settings.official) return {
    answer:'La agenda municipal publica las fiestas y actividades de Utrera. Consulta su ficha para confirmar fecha, lugar y posibles cambios.',
    links:[enlaces.eventos,app.sections.events],
  };
  if (topic==='transport' && settings.official) {
    const link = [app.sections.transport];
    if (!intent.ahora || intent.destinos.length) return {answer:'El panel de Cercanías muestra las salidas y llegadas de Utrera. Para otra fecha o un trayecto concreto, confirma el itinerario en Renfe.',links:[...link,app.official.find(f=>f.label==='Renfe')].filter(Boolean)};
    const board = await loadTrain().catch(()=>null);
    const eventos = board?.events?.[intent.tipo]?.slice(0,3) || [];
    const hora = new Intl.DateTimeFormat('es-ES',{timeZone:app.timeZone,hour:'2-digit',minute:'2-digit'});
    return {answer:eventos.length ? (intent.tipo==='arrival'?'Próximas llegadas a Utrera según Renfe:':'Próximas salidas de Utrera según Renfe:')+
      '\n'+eventos.map(e=>`${hora.format(new Date((e.expected ?? e.scheduled)*1000))} · ${intent.tipo==='arrival'?e.origin:e.destination} · ${e.status}`).join('\n')
      : 'Ahora mismo no puedo confirmar los próximos trenes.',links:link};
  }
  if (topic==='fuel' && settings.official) {
    if (!intent.fuel) return {answer:'¿Qué combustible quieres comparar: gasolina 95, gasolina 98, diésel o GLP?',links:[enlaces.fuel]};
    const datos = await loadFuel().catch(()=>null);
    const formato = new Intl.NumberFormat('es-ES',{minimumFractionDigits:3,maximumFractionDigits:3});
    const opciones = (datos?.stations || []).filter(e=>Number.isFinite(e.prices[intent.fuel])).sort((a,b)=>a.prices[intent.fuel]-b.prices[intent.fuel]).slice(0,3);
    return {answer:opciones.length && datos.publishedAt ? 'Precios publicados por el Geoportal del MITECO ('+datos.publishedAt+'):\n'+
      opciones.map(e=>`${e.name} · ${e.address} · ${formato.format(e.prices[intent.fuel])} €/l`).join('\n')
      : 'Ahora mismo no puedo confirmar los precios de ese combustible.',links:[enlaces.fuel]};
  }
  if (!['education','food'].includes(topic) || !settings.directory) return;
  if (intent.ficha) return {answer:'¿De qué establecimiento quieres saber el precio o el horario? Indícame su nombre para identificar la ficha.'};
  const filas = await sources.directory(app.db);
  const coincidencias = filas.filter(f=>{
    const categoria = normalizePreviewQuestion([f.categoria,f.subcategoria,f.nombre].join(' '));
    if (topic==='food') return /\b(?:hosteleria|restaurantes?|comidas?|tapas|bares?|taberna)\b/.test(categoria);
    if (!temaEducacion.test(categoria)) return false;
    const evidencia = categoria+' '+normalizePreviewQuestion(f.descripcion || '');
    return !intent.especialidad || evidencia.includes(intent.especialidad);
  }).sort((a,b)=>settings.commercialPriority ? Number(b.destacado===true)-Number(a.destacado===true) : 0).slice(0,5);
  if (!coincidencias.length) return {
    answer:'No encuentro una ficha del directorio de UtrerApp que confirme esa especialidad. Si tienes el nombre de un centro, puedo ayudarte a localizarlo.',
  };
  return {
    answer:topic==='food'?'Estas fichas de hostelería del directorio de UtrerApp aparecen registradas en Utrera. Confirma los horarios y la disponibilidad en cada ficha.'
      : 'Estas fichas del directorio de UtrerApp coinciden con la formación que buscas.',
    links:coincidencias.map(f=>({label:String(f.nombre).slice(0,110)+(f.destacado?' (destacado promocional)':''),url:app.directoryLink(f.id)})),
  };
}
