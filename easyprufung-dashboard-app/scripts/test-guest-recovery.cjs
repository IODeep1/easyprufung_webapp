const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
const {JSDOM}=require('jsdom'),React=require('react'),ReactDOM=require('react-dom'),{act}=require('react-dom/test-utils');
const dom=new JSDOM('<div id="test"></div>',{url:'http://localhost:3006/guest-exam'});
for(const key of ['window','document','navigator','localStorage','Event','HTMLElement'])global[key]=dom.window[key];global.IS_REACT_ACT_ENVIRONMENT=true;
class ExamApiError extends Error{constructor(status,message){super(message);this.status=status;}}
const guestKey='smartpruefung:guest-exam:v1',saved={token:'t'.repeat(43),sessionId:'saved-session',pending:true};
const target=document.getElementById('test'),navigations=[],requests=[];let user={uuid:'google-user',email:'test@example.com'},status=404,submissions=0,submissionFailure=false;
const navigate=(...args)=>navigations.push(args),dispatch=()=>{};
function compile(file,requireFn){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{exports,require:requireFn,localStorage,window,performance,fetch:async(url,options)=>{requests.push({url,options});return{ok:status===200,status,json:async()=>status===200?{sessionId:'saved-session',status:'IN_PROGRESS',exercises:[{questions:[{number:1,type:'CHOICE'}]}]}:{message:'Guest exam unavailable'}};}},{filename:file});return exports;}
const root=path.resolve(__dirname,'../src/components/User/Exam/guest');
const api=compile(path.join(root,'guest-api.ts'),()=>({ExamApiError}));
const Page=compile(path.join(root,'GuestExamPage.tsx'),name=>{
 if(name==='react')return React;
 if(name==='react/jsx-runtime')return require('react/jsx-runtime');
 if(name==='react-redux')return{useSelector:fn=>fn({userAccount:{user}}),useDispatch:()=>dispatch};
 if(name==='react-router-dom')return{useNavigate:()=>navigate};
 if(name==='react-i18next')return{useTranslation:()=>({t:x=>x,i18n:{language:'en'}})};
 if(name==='./guest-api')return api;
 if(name==='./guest-copy')return{guestCopy:()=>({loading:'Loading'})};
 if(name==='./GuestSubmissionPage')return{__esModule:true,default:props=>React.createElement('div',{'data-error':props.error},React.createElement('button',{onClick:props.onRetry},'Retry'))};
 if(name.endsWith('/ResultPage'))return{ResultPage:()=>React.createElement('div',{'data-result':true},'Result')};
 if(name.includes('api/exam/api-helper'))return{ExamApiError,getExamProgress:async()=>({answers:{1:{selectedOptionKeys:['a']}}}),getExamResult:async()=>({}),submitExamSession:async()=>{submissions++;if(submissionFailure)throw new ExamApiError(500,'Evaluation unavailable');return{};}};
 if(name.includes('api/user/api-helper'))return{requestGetUser:async()=>user};
 if(name.includes('userAccount.actions'))return{updateUser:x=>x};
 return{};
}).default;
const flush=async()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,0));});
async function mount(){await act(async()=>ReactDOM.render(React.createElement(Page),target));await flush();}
async function unmount(){await act(async()=>ReactDOM.unmountComponentAtNode(target));}
(async()=>{
 localStorage.setItem(guestKey,JSON.stringify(saved));localStorage.setItem('access-token','google-session');
 await mount();assert.equal(navigations.at(-1)[0],'/');assert.equal(navigations.at(-1)[1].replace,true);
 assert.deepEqual(JSON.parse(localStorage.getItem(guestKey)),saved);assert.equal(localStorage.getItem('access-token'),'google-session');
 await unmount();status=200;const before=navigations.length;await mount();assert.ok(target.querySelector('[data-result]'));assert.equal(submissions,1);assert.equal(navigations.length,before);
 assert.equal(requests[1].url,'/api/exams/sessions/guest/claim');assert.equal(requests[1].options.headers['X-Guest-Token'],saved.token);
 await unmount();submissionFailure=true;await mount();assert.equal(navigations.at(-1)[0],'/');
 await unmount();status=401;await mount();assert.equal(navigations.at(-1)[0],'/');
 await unmount();user=null;status=404;await mount();assert.equal(navigations.at(-1)[0],'/');
 assert.deepEqual(JSON.parse(localStorage.getItem(guestKey)),saved);await unmount();
 console.log('Guest recovery React checks passed: claim, submission and authentication errors redirect to root; guest/auth storage preserved; successful return auto-submits.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>dom.window.close());
