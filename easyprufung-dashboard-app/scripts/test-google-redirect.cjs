const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const ts=require('typescript');
const file=path.resolve(__dirname,'../src/components/User/Login/google-redirect.ts');
const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const key='smartpruefung:google-redirect:v1';
function storage(){const data=new Map();return{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};}
function load({session=storage(),search='',exchange=async()=>({token:'app-token'}),pathname='/login'}={}){
 const navigations=[],history=[];
 const sandbox={exports:{},process:{env:{}},Uint8Array,TextEncoder,URLSearchParams,Date,crypto:crypto.webcrypto,btoa:v=>Buffer.from(v,'binary').toString('base64'),sessionStorage:session,
 window:{location:{origin:'https://app.smartpruefung.com',pathname,search,assign:v=>navigations.push(v)},history:{state:null,replaceState:(...args)=>history.push(args)}},
 require:name=>name.includes('api-helper')?{authenticateGoogleCode:exchange}:{normalizeLanguage:v=>v.slice(0,2)}};
 vm.runInNewContext(source,sandbox,{filename:file});return{api:sandbox.exports,navigations,history,session};
}
(async()=>{
 const started=load();await started.api.startGoogleRedirect('fr-FR');
 assert.equal(started.navigations.length,1);const google=new URL(started.navigations[0]);
 assert.equal(google.origin,'https://accounts.google.com');assert.equal(google.searchParams.get('response_type'),'code');
 assert.equal(google.searchParams.get('redirect_uri'),'https://app.smartpruefung.com/google/callback');
 const pending=JSON.parse(started.session.getItem(key));assert.equal(pending.language,'fr');
 assert.equal(google.searchParams.get('state'),pending.state);
 assert.equal(google.searchParams.get('code_challenge'),crypto.createHash('sha256').update(pending.verifier).digest('base64url'));
 let calls=0;
 const returned=load({session:started.session,pathname:'/google/callback',search:'?code=one-use&state='+pending.state,exchange:async(...args)=>{
  calls++;assert.deepEqual(args,['one-use',pending.verifier,pending.redirectUri,'fr']);return{token:'app-token'};
 }});
 assert.equal(returned.history[0][2],'/google/callback');
 const one=returned.api.completeGoogleRedirect(),two=returned.api.completeGoogleRedirect();assert.equal(one,two);
 assert.equal((await one).token,'app-token');assert.equal(calls,1);assert.equal(started.session.getItem(key),null);
 for(const condition of ['state mismatch','cancelled','expired','no attempt']){
  const session=storage();session.setItem(key,JSON.stringify({...pending,createdAt:condition==='expired'?Date.now()-700000:Date.now()}));
  if(condition==='no attempt')session.removeItem(key);
  let attempted=false;
  const bad=load({session,pathname:'/google/callback',search:condition==='cancelled'?'?error=access_denied&state='+pending.state:'?code=x&state='+(condition==='state mismatch'?'wrong':pending.state),exchange:async()=>{attempted=true;throw new Error('must not call backend');}});
  await assert.rejects(bad.api.completeGoogleRedirect());assert.equal(session.getItem(key),null);assert.equal(attempted,false);
 }
 const blocked=load({session:{getItem:()=>null,setItem:()=>{throw Error('blocked')},removeItem:()=>{}}});await assert.rejects(blocked.api.startGoogleRedirect('en'));assert.equal(blocked.navigations.length,0);
 console.log('Same-tab Google redirect, PKCE, state validation, query cleanup, single exchange, cancellation, expiry and blocked-storage checks passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
