const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path'),ts=require('typescript');
const source=fs.readFileSync(path.join(__dirname,'../src/components/User/Pricing/payment-links.ts'),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const links={
 development:{b1:'https://buy.stripe.com/test_eVq14m96V7RB8oCecU33W01',b1_unlimited:'https://buy.stripe.com/test_dRmeVcaaZ7RBcES0m433W00'},
 production:{b1:'https://buy.stripe.com/4gM00i3JgcK24I0czs1wY02',b1_unlimited:'https://buy.stripe.com/5kQ3cu1B87pIgqI8jc1wY01'}
};
for(const env of ['development','production']){
 const context={exports:{},process:{env:{NODE_ENV:env}},URLSearchParams};vm.runInNewContext(code,context);
 for(const plan of ['b1','b1_unlimited']){
  assert.equal(context.exports.getPaymentLinkBase(plan),links[env][plan]);
  assert.equal(context.exports.buildPaymentUrl(plan),links[env][plan]);
  const url=new URL(context.exports.buildPaymentUrl(plan,'learner+test@example.com','user-123'));
  assert.equal(url.origin+url.pathname,links[env][plan]);
  assert.equal(url.searchParams.get('prefilled_email'),'learner+test@example.com');
  assert.equal(url.searchParams.get('client_reference_id'),'user-123');
  assert.equal([...url.searchParams].length,2);
 }
}
console.log('Original individual Payment Links passed: both plans, test/live selection and encoded account details.');
// Saved /purchase routes must use those links too, without creating a Checkout Session.
const bridgeCode=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/components/Teacher/StudentPurchase.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
for(const plan of ['b1','b1_unlimited','invalid']){
 const redirects=[],errors=[];
 const linkRuntime={exports:{},process:{env:{NODE_ENV:'production'}},URLSearchParams};vm.runInNewContext(code,linkRuntime);
 const context={exports:{},window:{location:{replace:url=>redirects.push(url)}},require:name=>{
  if(name==='react')return{useEffect:fn=>fn(),useState:()=>['',v=>errors.push(v)]};
  if(name==='react/jsx-runtime')return require(name);
  if(name==='react-router-dom')return{useSearchParams:()=>[new URLSearchParams({plan})],Link:()=>null};
  if(name==='react-redux')return{useSelector:fn=>fn({userAccount:{user:{uuid:'saved-user',email:'saved@example.test'}}})};
  if(name.endsWith('feature-i18n'))return{tr:x=>x,useFeatureLocale:()=>({locale:'en',dir:'ltr'})};
  if(name==='./api')return{button:'',card:''};
  if(name.endsWith('payment-links'))return linkRuntime.exports;
  throw Error('Unexpected bridge dependency '+name);
 }};
 vm.runInNewContext(bridgeCode,context);context.exports.default();
 if(plan==='invalid'){assert.equal(redirects.length,0);assert.ok(errors.includes('Choose an exam plan.'));}
 else{assert.equal(redirects.length,1);const url=new URL(redirects[0]);assert.equal(url.origin+url.pathname,links.production[plan]);assert.equal(url.searchParams.get('client_reference_id'),'saved-user');assert.equal(url.searchParams.get('prefilled_email'),'saved@example.test');}
}
console.log('Saved individual purchase routes redirect to Payment Links; invalid plans cannot redirect.');
