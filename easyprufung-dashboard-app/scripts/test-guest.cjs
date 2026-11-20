const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/components/User/Exam/guest/guest-api.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const storage=new Map(),calls=[];
class ApiError extends Error {constructor(status,message){super(message);this.status=status;}}
const context={exports:{},require:()=>({ExamApiError:ApiError}),localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},fetch:async(url,options)=>{calls.push({url,options});return{ok:true,status:200,json:async()=>({token:'t'.repeat(43)})};}};
vm.runInNewContext(code,context);
(async()=>{
 const api=context.exports;assert.equal(api.authDestination(),'/');
 const [a,b]=await Promise.all([api.ensureGuest(),api.ensureGuest()]);assert.equal(a.token,b.token);assert.equal(calls.length,1);
 assert.equal(calls[0].url,'/public/exams/guest');
 await api.ensureGuest();assert.equal(calls.length,1);
 api.saveGuest({...a,pending:false,sessionId:'unfinished-session'});assert.equal(api.authDestination(),'/guest-exam');
 api.saveGuest({...a,pending:true,sessionId:'session'});assert.equal(api.authDestination(),'/guest-exam');
 await api.saveGuestProgress(a.token,{revision:4,index:2,answers:{'1':{selectedOptionKeys:['a'],text:''}}});
 const request=calls[1];assert.equal(request.options.keepalive,true);assert.equal(request.options.headers['X-Guest-Token'],a.token);
 assert.equal(request.options.headers.Authorization,undefined);assert.ok(!request.url.includes(a.token));
 assert.equal(JSON.parse(request.options.body).revision,4);
 context.fetch=async()=>({ok:false,status:402,json:async()=>({message:'Purchase required'})});
 await assert.rejects(()=>api.claimGuest(a.token),e=>e.status===402);assert.equal(api.readGuest().sessionId,'session');assert.equal(api.authDestination(),'/guest-exam');
 console.log('Guest client checks passed: concurrent creation, persistent token, registration destination, server draft, keepalive, token isolation, recovery after rejected claim.');
})().catch(e=>{console.error(e);process.exitCode=1;});
