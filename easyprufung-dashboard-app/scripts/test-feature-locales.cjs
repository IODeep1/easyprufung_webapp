const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const i18n=require('i18next');
const base=path.resolve(__dirname,'../src'),cache=new Map();
function load(file){if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);const source=fs.readFileSync(path.join(base,file),'utf8');const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
function resolve(name){if(name.startsWith('.')){const f=path.posix.normalize(path.posix.join(path.posix.dirname(file),name));if(f.endsWith('.json'))return JSON.parse(fs.readFileSync(path.join(base,f),'utf8'));return load(f+'.ts');}return require(name);}
vm.runInNewContext(code,{exports,require:resolve,Intl,URL,URLSearchParams,localStorage:{getItem:()=>null}},{filename:file});return exports;}
(async()=>{
await i18n.init({fallbackLng:'en',resources:Object.fromEntries(['en','de','fr','ar','uk','tr'].map(l=>[l,{translation:{}}]))});
const helper=load('localization/feature-i18n.ts'),api=load('components/Teacher/api.ts');
const catalog=JSON.parse(fs.readFileSync(path.join(base,'locales/feature-phrases.json'),'utf8'));
for(const lang of ['en','de','fr','ar','uk','tr']){
 await i18n.changeLanguage(lang);
 assert.equal(helper.featureLocale(),lang);
 assert.equal(helper.tr('My classes'),lang==='en'?'My classes':catalog['My classes'][lang]);
 assert.equal(api.money(23985),new Intl.NumberFormat(lang,{style:'currency',currency:'EUR'}).format(239.85));
 assert.equal(api.date('2026-12-03T12:00:00Z'),new Date('2026-12-03T12:00:00Z').toLocaleString(lang));
 assert.equal(api.date(null),helper.tr('No due date'));
 assert.equal(helper.tr('Private class name'),'Private class name');
 assert.ok(helper.tr('Request failed (409).').includes('409'));
 if(lang!=='en')assert.notEqual(helper.tr('Invitation is invalid or expired.'),'Invitation is invalid or expired.');
 assert.ok(!helper.tr('You save {{amount}} ({{percent}}%) compared with {{price}} per seat.',{amount:'60',percent:20,price:'19.99'}).includes('{{'));
}
console.log('App localization passed: six locales, API messages, interpolation, dates, currency and preserved class data.');
})().catch(e=>{console.error(e);process.exitCode=1;});
