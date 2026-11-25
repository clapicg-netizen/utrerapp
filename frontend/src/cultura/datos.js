export const categorias = ['Teatro', 'Música', 'Humor', 'Infantil', 'Danza', 'Otras'];
export const demoCultural = /^(?:localhost|127\.0\.0\.1|utrerapp-[\w-]+-juan-ra1\.vercel\.app)$/.test(window.location.hostname);
const clave = 'utrerapp-cultural-preview-v1';
export const diaLocal = (fecha = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid' }).format(fecha);
export function moverDia(dia, dias) {
  const fecha = new Date(dia + 'T12:00:00Z');
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}
const base = { lugar: 'Teatro Enrique de la Cuadra', direccion: 'Calle Sevilla, s/n, Utrera, Sevilla', estado: 'publicado', venta: 'normal', compra: '', cartel: '', fin: '' };
function ejemplos() {
  const hoy = diaLocal();
  return [
    { ...base, id: 'muestra-escena', titulo: 'La última función', categoria: 'Teatro', fecha: moverDia(hoy, 1), hora: '20:30', precio: '12', descripcion: 'Una compañía vuelve a reunirse para una última función. Entre bambalinas, cada personaje tiene una historia pendiente.' },
    { ...base, id: 'muestra-familia', titulo: 'La ciudad de papel', categoria: 'Infantil', fecha: moverDia(hoy, 2), hora: '12:00', precio: '0', descripcion: 'Una aventura familiar de títeres y música entre calles que se despliegan como las páginas de un libro.' },
    { ...base, id: 'muestra-musica', titulo: 'Noches de cuerda', categoria: 'Música', fecha: moverDia(hoy, 4), hora: '19:30', precio: '8', venta: 'agotado', descripcion: 'Un cuarteto imaginario reúne música de cámara y ritmos del sur.' },
  ];
}
let copia;
export function leerCultura() {
  if (!demoCultural) return [];
  if (copia) return copia;
  try { return JSON.parse(localStorage.getItem(clave)) ?? ejemplos(); } catch { return ejemplos(); }
}
export function guardarCultura(filas) {
  if (!demoCultural) return;
  localStorage.setItem(clave, JSON.stringify(filas));
  copia = filas;
}
export function publicos(filas = leerCultura(), ahora = new Date()) {
  const hoy = diaLocal(ahora);
  const hora = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(ahora);
  return filas.filter(e => e.estado === 'publicado' && (e.fecha > hoy || (e.fecha === hoy && (e.fin || '24:00') > hora)))
    .sort((a,b) => (a.fecha+a.hora).localeCompare(b.fecha+b.hora));
}
export function enlaceCompra(valor) {
  try {
    const url = new URL(valor);
    if (url.protocol === 'https:' && ['www.giglon.com','giglon.com'].includes(url.hostname) &&
        (/^\/evento\/[\w-]+\/?$/.test(url.pathname) || (url.pathname === '/todos' && /^[\w-]+$/.test(url.searchParams.get('idEvent') || '')))) return url.href;
  } catch { /* Enlace opcional. */ }
  return '';
}
export const moneda = valor => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(valor));
export const fechaVisible = fecha => new Intl.DateTimeFormat('es-ES', { dateStyle: 'full', timeZone: 'Europe/Madrid' }).format(new Date(fecha + 'T12:00:00Z'));
