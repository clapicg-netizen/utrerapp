import { diaLocal, moverDia, publicos } from './datos';
const normal = valor => valor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const meses = 'enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre'.split(' ');
const dias = 'domingo lunes martes miercoles jueves viernes sabado'.split(' ');
const tipos = [['Infantil', /\b(infantil(?:es)?|ninos|familias?)\b/], ['Música',/\b(conciertos?|musica)\b/], ['Humor',/\b(humor|monologos?)\b/], ['Danza',/\b(danza|ballet)\b/], ['Teatro',/\bobras?\b/]];
export function consultaCultural(pregunta, previa, ahora = new Date(), filas = publicos(undefined, ahora)) {
  const frase = normal(pregunta);
  const temaAjeno = /\b(farmacias?|guardia|lluvia|llover|tiempo|temperatura|paraguas|meteorologia|trenes?|parking|aparcamientos?|academias?|bares?|tramites?|capital)\b/.test(frase);
  if (temaAjeno) return;
  const categoria = tipos.find(([, patron]) => patron.test(frase))?.[0];
  const precio = /\b(cuanto[s]? cuesta[n]?|precios?|cuanto valen)\b/.test(frase);
  const gratis = /\b(gratis|gratuit[oa]s?)\b/.test(frase);
  const hoy = diaLocal(ahora);
  const semana = new Date(hoy + 'T12:00:00Z').getUTCDay();
  const dia = dias.findIndex(nombre => new RegExp('\\b' + nombre + '\\b').test(frase));
  const mes = meses.findIndex(nombre => new RegExp('\\b' + nombre + '\\b').test(frase));
  let rango;
  if (/\bfin de semana\b|\bfinde\b/.test(frase)) {
    const sabado = moverDia(hoy, semana === 0 ? -1 : (6-semana));
    rango = [sabado,moverDia(sabado,1)];
  } else if (/\b(?:pasado manana|manana|hoy)\b/.test(frase)) {
    const fecha = moverDia(hoy, frase.includes('pasado manana') ? 2 : /\bmanana\b/.test(frase) ? 1 : 0);
    rango = [fecha,fecha];
  } else if (dia >= 0) {
    const fecha = moverDia(hoy, (dia-semana+7)%7);
    rango = [fecha,fecha];
  } else if (mes >= 0) {
    let year = Number(hoy.slice(0,4));
    if (mes+1 < Number(hoy.slice(5,7))) year++;
    rango = [`${year}-${String(mes+1).padStart(2,'0')}-01`, new Date(Date.UTC(year,mes+1,0)).toISOString().slice(0,10)];
  }
  const explicita = categoria || /\b(cartelera|teatro|espectaculos?|entradas|actividades|programacion cultural|eventos?)\b/.test(frase);
  const repregunta = previa && Boolean(rango || precio || gratis) &&
    /^(?:y\b|(?:el|este|para|en)\b|hoy\b|manana\b|pasado\b|cuanto\b|precios?\b|gratis\b|gratuit[oa]s?\b)/.test(frase);
  if (!explicita && !repregunta) return;
  const contexto = { categoria: categoria || (repregunta ? previa.categoria : undefined), rango: rango || (repregunta ? previa.rango : undefined), gratis: gratis || Boolean(repregunta && previa.gratis) };
  const recinto = /\b(?:el|del|al) teatro\b/.test(frase) || Boolean(repregunta && previa.recinto);
  contexto.recinto = recinto;
  const resultados = filas.filter(e =>
    (!contexto.categoria || e.categoria === contexto.categoria) &&
    (!contexto.rango || (e.fecha >= contexto.rango[0] && e.fecha <= contexto.rango[1])) &&
    (!contexto.gratis || (e.precio !== '' && Number(e.precio) === 0)) &&
    (!recinto || /enrique de la cuadra/i.test(e.lugar)));
  return { resultados, contexto };
}
