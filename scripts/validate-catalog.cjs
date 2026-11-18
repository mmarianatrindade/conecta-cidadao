const fs=require('fs');
const ts=require('typescript');
const assert=require('node:assert/strict');
const path=require('path');
function readTS(file){
  const p=path.resolve(__dirname,'../src/data',file);
  const js=ts.transpileModule(fs.readFileSync(p,'utf8'),{fileName:p,compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
  const mod={exports:{}};
  new Function('exports','require','module',js)(mod.exports,require,mod);
  return mod.exports;
}
const {CATALOG}=readTS('catalog.ts');
const {CATEGORIES}=readTS('categories.ts');
const ids=new Set(),categories=new Set(CATEGORIES.map(c=>c.id));
for(const unit of CATALOG){
  assert(!ids.has(unit.id),`ID duplicado: ${unit.id}`); ids.add(unit.id);
  assert(categories.has(unit.category),`Categoria inválida: ${unit.id}`);
  assert(/^https:\/\//.test(unit.source),`Fonte não HTTPS: ${unit.id}`);
  assert(unit.name && unit.summary && unit.access && unit.services.length,`Dados incompletos: ${unit.id}`);
  assert(unit.checkedAt && /^\d{4}-\d{2}-\d{2}$/.test(unit.checkedAt),`Data inválida: ${unit.id}`);
  assert(unit.type==='digital'||unit.address,`Endereço não informado: ${unit.id}`);
}
for(const cat of categories)assert(CATALOG.some(x=>x.category===cat),`Categoria vazia: ${cat}`);
console.log(`OK: ${CATALOG.length} registros, ${categories.size} categorias, todos com fonte HTTPS.`);
