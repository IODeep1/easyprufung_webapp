const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const {JSDOM}=require('jsdom'),React=require('react'),ReactDOM=require('react-dom'),{act}=require('react-dom/test-utils');
const dom=new JSDOM('<div id="test"></div>',{url:'http://localhost:3006/guest-exam'});for(const key of ['window','document','navigator','HTMLElement','Event'])global[key]=dom.window[key];global.IS_REACT_ACT_ENVIRONMENT=true;window.scrollTo=()=>{};
const root=path.resolve(__dirname,'../src/components/User/Exam');const exportsObject={};let saved=[],gates=[],submissions=0,releaseSave;
const saveProgress=async(id,draft)=>{saved.push(JSON.parse(JSON.stringify(draft)));if(releaseSave)await new Promise(resolve=>releaseSave=resolve);return{...draft,revision:draft.revision+1};};
const requireRegistration=async draft=>gates.push(JSON.parse(JSON.stringify(draft)));
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'ExamRunnerPage.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{exports:exportsObject,window,document,require:name=>{
 if(name.includes('shorts/ShortsFrame'))return{ShortsFrame:p=>p.children};
 if(name==='react')return React;if(name==='react/jsx-runtime')return require('react/jsx-runtime');
 if(name==='react-i18next')return{useTranslation:()=>({t:x=>x,i18n:{resolvedLanguage:'en',dir:()=> 'ltr'}})};
 if(name.includes('api/exam'))return{ExamApiError:class extends Error{}};
 if(name.includes('HoldToSubmit'))return{SubmitConfirmation:()=>null};
 if(name.includes('exam-storage'))return{saveExamProgress:()=>{},clearExamProgress:()=>{}};
 if(name.includes('ExamChrome'))return{ExamHeader:()=>null,PartInformation:()=>null,BottomNavigation:p=>React.createElement('button',{onClick:p.onNext},'Next')};
 if(name.includes('PartRenderer'))return{PartRenderer:p=>React.createElement('div',{'data-part':p.exercise.partKey},React.createElement('button',{onClick:()=>p.onSelection('1','a')},'Answer'))};
 return{};
}});
const Runner=exportsObject.ExamRunnerPage,target=document.getElementById('test');
const session={sessionId:'guest-session',exercises:Array.from({length:4},(_,i)=>({partKey:'part-'+i,sectionKey:i===3?'SPRACHBAUSTEINE':'LESEN',questions:[{number:String(i+1),type:'CHOICE'}]}))};
const base={session,saveProgress,onRegistrationRequired:requireRegistration,onSubmit:async()=>{submissions++;},preserveProgressOnSubmit:true};
const flush=()=>act(async()=>{await new Promise(r=>setTimeout(r,0));});
async function mount(index,blocked){await act(async()=>ReactDOM.render(React.createElement(Runner,{...base,initialProgress:{revision:0,index,answers:{'1':{selectedOptionKeys:['a'],text:''}}},registrationRequiredFrom:blocked?3:undefined}),target));await flush();}
async function unmount(){await act(async()=>ReactDOM.unmountComponentAtNode(target));}
(async()=>{
 await mount(2,true);assert.equal(target.querySelector('[data-part]').getAttribute('data-part'),'part-2');
 releaseSave=true;await act(async()=>Array.from(target.querySelectorAll('button')).find(x=>x.textContent==='Next').click());await flush();
 assert.equal(target.querySelector('[data-part]'),null);assert.equal(gates.length,0,'Popup waits for server progress save');
 assert.equal(saved.at(-1).index,3);assert.equal(saved.at(-1).answers['1'].selectedOptionKeys[0],'a');
 const release=releaseSave;releaseSave=null;await act(async()=>release());await flush();assert.equal(gates.length,1);assert.equal(gates[0].index,3);assert.equal(gates[0].revision,1);assert.equal(submissions,0);
 await unmount();gates=[];await mount(3,true);assert.equal(target.querySelector('[data-part]'),null);assert.equal(gates.length,1,'Reload at checkpoint still requires registration');assert.equal(submissions,0);
 await unmount();gates=[];await mount(3,false);assert.equal(target.querySelector('[data-part]').getAttribute('data-part'),'part-3');assert.equal(gates.length,0,'Signed-in user resumes the checkpoint');assert.equal(submissions,0);await unmount();
 console.log('Guest checkpoint checks passed: block before language section, await server save, retain answers/index/revision, gate anonymous reload and resume signed-in without early submission.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>dom.window.close());
