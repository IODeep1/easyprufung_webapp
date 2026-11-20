const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const source=fs.readFileSync(path.join(__dirname,'../src/api/user/api-helper.ts'),'utf8');
const start=source.indexOf('export async function requestGetUser(dispatch) {');
const end=source.indexOf('\nexport async function requestGetUserWithProjects',start);
const code=ts.transpileModule(source.slice(start,end),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
function runtime(fetch){const storage=new Map([['access-token','original-token']]),actions=[],saved=[];const context={exports:{},fetch,localStorage:{getItem:k=>storage.get(k)||null},rememberUser:user=>saved.push(user),logout:()=>({type:'logout'})};vm.runInNewContext(code,context);return{run:()=>context.exports.requestGetUser(a=>actions.push(a)),storage,actions,saved};}
(async()=>{
 for(const status of [401,403]){const r=runtime(async()=>({status,ok:false}));await r.run();assert.equal(r.actions.length,1);}
 for(const failure of ['abort','network','500']){const r=runtime(async()=>{if(failure==='500')return{status:500,ok:false};throw new Error(failure);});await r.run();assert.equal(r.actions.length,0);assert.equal(r.storage.get('access-token'),'original-token');}
 const success=runtime(async()=>({status:200,ok:true,json:async()=>({email:'learner@example.com',uuid:'account'})}));await success.run();assert.equal(success.saved[0].token,'original-token');
 let finish;const old=runtime(()=>new Promise(resolve=>finish=resolve));const pending=old.run();old.storage.set('access-token','new-account-token');finish({status:401,ok:false});await pending;assert.equal(old.actions.length,0);assert.equal(old.saved.length,0);
 console.log('Profile checks passed: authentication rejection, aborted/network/server failures, retained token and stale-account isolation.');
})().catch(e=>{console.error(e);process.exitCode=1;});
