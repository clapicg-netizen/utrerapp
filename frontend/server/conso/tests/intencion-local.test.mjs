import assert from 'node:assert/strict';
import test from 'node:test';
import { contestarLocal, consultaSensible, localIntent } from '../intencion-local.mjs';

const settings={official:true,directory:true,commercialPriority:true};
const app={sections:{transport:{url:'/?vista=cercanias'},events:{url:'/?vista=menu-agenda'}},official:[],timeZone:'Europe/Madrid',directoryLink:id=>'/market/'+id};
const sources={directory:async()=>[
  {id:1,nombre:'Centro genérico',categoria:'Formación'},
  {id:2,nombre:'Centro especializado',categoria:'Formación',subcategoria:'Preparamos oposiciones',destacado:true},
  {id:3,nombre:'Mesón',categoria:'Hostelería',subcategoria:'Tapas'},
]};
test('distingue categorías del directorio y conserva la especialidad',async()=>{
  for(const frase of ['Academia de oposiciones','¿Qué centro prepara oposiciones?','¿Y para oposiciones?']){
    const resultado=await contestarLocal(localIntent(frase,'education'),{app,settings,sources});
    assert.deepEqual(resultado.links.map(x=>x.url),['/market/2']);
  }
  assert.equal((await contestarLocal(localIntent('Academia de formación'),{app,settings,sources})).links.length,2);
  assert.deepEqual((await contestarLocal(localIntent('¿Dónde puedo comer en Utrera?'),{app,settings,sources})).links.map(x=>x.url),['/market/3']);
  assert.equal(localIntent('¿Dónde puedo comer en Sevilla?'),undefined);
  assert.equal(localIntent('¿Dónde puedo comer sin gluten?'),undefined);
});
test('deriva al trámite oficial y reduce la exposición de datos personales',async()=>{
  for(const frase of ['Solicitud de certificado de empadronamiento','Necesito un volante del padrón municipal']){
    const r=await contestarLocal(localIntent(frase),{app,settings,sources});
    assert.match(r.answer,/Cl@ve/);
    assert.ok(r.links.some(l=>l.url==='https://sede.utrera.org/'));
  }
  assert.equal(consultaSensible('Mi correo es prueba@example.com'),true);
  assert.equal(consultaSensible('DNI 12345678Z'),true);
});
test('consume el panel de trenes y el comparador de carburantes cuando procede',async()=>{
  const train=await contestarLocal(localIntent('Próximos trenes'),{app,settings,loadTrain:async()=>({events:{departure:[{scheduled:1795698000,destination:'Sevilla',status:'programado'}]}})});
  assert.match(train.answer,/Sevilla.*programado/);
  const fuel=await contestarLocal(localIntent('¿Dónde repostar diésel?'),{app,settings,loadFuel:async()=>({publishedAt:'25/11/2026',stations:[{name:'Estación de prueba',address:'Utrera',prices:{diesel:1.55}}]})});
  assert.match(fuel.answer,/1,550 €\/l/);
});
