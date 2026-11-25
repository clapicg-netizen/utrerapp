import assert from 'node:assert/strict';

const { REACT_APP_CULTURA_SUPABASE_URL: url, REACT_APP_CULTURA_SUPABASE_ANON_KEY: key } = process.env;
if (!url && !key) process.exit(0);
assert.equal(url, 'https://bkpusgqsatyymqbisjcv.supabase.co');
assert.ok(key, 'Falta la clave pública de Supabase de pruebas');

const headers = { apikey:key, 'Content-Type':'application/json' };
const lectura = new URL('/rest/v1/programacion_cultural',url);
lectura.searchParams.set('select','id,estado,seccion,programacion_cultural_funciones(id,fecha,retirada_en)');
lectura.searchParams.set('limit','20');
const respuesta = await fetch(lectura,{headers,signal:AbortSignal.timeout(10000)});
assert.equal(respuesta.status,200,'La lectura anónima HTTP del Teatro falló');
const filas = await respuesta.json();
assert.ok(Array.isArray(filas));
assert.ok(filas.every(f=> f.estado==='publicado' && f.seccion==='teatro' &&
  f.programacion_cultural_funciones.every(p=>p.fecha && !p.retirada_en)));
const escritura = await fetch(new URL('/rest/v1/rpc/guardar_programacion_teatro',url),{
  method:'POST', headers, body:JSON.stringify({ficha:{},revision_esperada:0}), signal:AbortSignal.timeout(10000),
});
assert.ok([401,403].includes(escritura.status),`Respuesta HTTP inesperada a escritura anónima: ${escritura.status}`);
console.log(`Teatro Supabase HTTP: ${filas.length} publicaciones visibles; escritura anónima denegada.`);
