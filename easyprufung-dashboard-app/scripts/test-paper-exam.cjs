const assert = require('assert/strict'), fs = require('fs'), path = require('path'), vm = require('vm'), ts = require('typescript');
const {JSDOM} = require('jsdom'), React = require('react'), {createRoot} = require('react-dom/client'), {act} = require('react-dom/test-utils');
const dom = new JSDOM('<div id="test"></div>', {url:'http://localhost/guest-exam'});
for (const key of ['window','document','navigator','HTMLElement','Event']) global[key] = dom.window[key];
global.IS_REACT_ACT_ENVIRONMENT = true; window.scrollTo = () => {};
const rootDir = path.resolve(__dirname, '../src/components/User/Exam');
function compile(file, overrides = {}) {
    const exports = {};
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(rootDir,file),'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,
        {exports, window, document, performance:{now:()=>{clock+=100000;return clock;}}, require:name => overrides[name] || (name.endsWith('.css') ? {} : require(name))});
    return exports;
}
const {PaperExam, paperGaps} = compile('paper/PaperExam.tsx');
const selectorLocale = require('../src/locales/de/translation.json').examFormatSelector;
const {ExamFormatSelector} = compile('components/ExamFormatSelector.tsx', {'react-i18next':{useTranslation:()=>({t:key=>selectorLocale[key.split('.').pop()],i18n:{resolvedLanguage:'de',dir:()=> 'ltr'}})}});
const parts = ['LESEN_1','LESEN_2','LESEN_3','SPRACHE_1','SPRACHE_2','HOEREN_1','HOEREN_2','HOEREN_3','SCHREIBEN_EMAIL'];
let number = 0;
const exercises = parts.map((partKey,index) => ({id:partKey, partKey, sectionKey:index<3?'LESEVERSTEHEN':index<5?'SPRACHBAUSTEINE':index<8?'HOERVERSTEHEN':'SCHREIBEN',
    sectionTitle:index<3?'Leseverstehen':index<5?'Sprachbausteine':index<8?'Hörverstehen':'Schriftlicher Ausdruck', partTitle:`Teil ${index+1}`,
    instructions:'Bearbeiten Sie die Aufgaben.', content:index===2?'a) Anzeige eins\n\nb) Anzeige zwei':index===3?'Liebe Anna, [4] geht es?':`Text ${index}`,
    questions:[{id:`q${index}`,number:String(++number),type:index===8?'FREE_TEXT':index>=5?'TRUE_FALSE':'SINGLE_CHOICE',prompt:index===3?'SECRET_GATED_TEXT':`Aufgabe ${index}`,
        stimulus:index===0?'Lesetext eins':null, options:index===8?[]:index>=5?[{key:'true',text:'Richtig'},{key:'false',text:'Falsch'}]:[{key:'a',text:'Antwort A'},{key:'b',text:'Antwort B'}]}]}));
const session = {sessionId:'paper-session',title:'B1',level:'B1',format:'PAPER',exercises,expiresAt:null};
const target = document.getElementById('test'); const root = createRoot(target);
const flush = async () => act(async () => {await new Promise(r=>setTimeout(r,0));});
async function render(element) {await act(async()=>root.render(element));await flush();}
async function click(text) {const b=[...target.querySelectorAll('button')].find(b=>b.textContent===text);assert.ok(b,`Missing button ${text}`);await act(async()=>b.click());await flush();}
const progress = {revision:0,index:0,answers:{}}; const saved = [], gates = [], submissions = [];
const {ExamRunnerPage} = compile('ExamRunnerPage.tsx', {
    'i18next':{__esModule:true,default:{}},
    'react-i18next':{useTranslation:()=>({t:x=>x,i18n:{resolvedLanguage:'de',dir:()=> 'ltr'}})},
    '../../../api/exam/api-helper':{ExamApiError:class extends Error{}},
    './paper/PaperExam':{PaperExam},
    './components/ExamChrome':{ExamHeader:()=>null,PartInformation:()=>null,BottomNavigation:p=>React.createElement('div',null,
        React.createElement('button',{onClick:p.onNext},'Next'),React.createElement('button',{onClick:p.onSubmit},'Submit'))},
    './components/HoldToSubmit':{SubmitConfirmation:p=>p.open?React.createElement('button',{onClick:p.onConfirm},'Confirm'):null},
    './components/PartRenderer':{PartRenderer:()=>React.createElement('div',{'data-digital':true},'Digital renderer')},
    './components/AudioPlayer.tsx':{AudioPlayer:()=>null},
    './exam-storage.ts':{saveExamProgress:()=>{},clearExamProgress:()=>{}}
});
const saveProgress = async (_id,draft) => {saved.push(JSON.parse(JSON.stringify(draft)));return {...draft,revision:draft.revision+1};};
let clock=0, guestActive=null; const guestRequests=[];
const guestToken={token:'token'}, navigate=()=>assert.fail('Guest should stay in the exam flow'), dispatch=()=>{};
const GuestPage = compile('guest/GuestExamPage.tsx', {
    'react-redux':{useSelector:()=>null,useDispatch:()=>dispatch},
    'react-router-dom':{useNavigate:()=>navigate},
    'react-i18next':{useTranslation:()=>({t:x=>x,i18n:{language:'de'}})},
    '../components/ExamFormatSelector':{ExamFormatSelector},
    '../ExamRunnerPage':{ExamRunnerPage:p=>React.createElement('div',{'data-guest-format':p.session.format},p.session.format)},
    '../ExamLanguageLock':{__esModule:true,default:p=>p.children},
    '../ResultPage':{ResultPage:()=>null},
    '../components/ExamChrome':{LoadingScreen:()=>null},
    '../exam-storage':{loadExamProgress:()=>null},
    './GuestAuthChoice':{__esModule:true,default:()=>null},
    './GuestSubmissionPage':{__esModule:true,default:()=>null},
    './guest-copy':{guestCopy:()=>({loading:'Loading'})},
    '../../../../api/exam/api-helper':{},
    '../../../../api/user/api-helper':{},
    '../../../../store/actions/user/userAccount.actions':{},
    './guest-api':{readGuest:()=>guestToken,ensureGuest:async()=>guestToken,saveGuest:()=>{},saveGuestProgress:async(_token,draft)=>draft,
        guestRequest:async(_token,suffix)=>{
            guestRequests.push(suffix);
            if(suffix.startsWith('/start')) {guestActive={...session,format:suffix.endsWith('PAPER')?'PAPER':'DIGITAL'};return guestActive;}
            return {session:guestActive,progress:{revision:0,index:0,answers:{}},finished:false};
        }}
}).default;
(async () => {
    let selected='DIGITAL';
    await render(React.createElement(ExamFormatSelector,{value:selected,onChange:v=>selected=v}));
    await act(async()=>target.querySelector('input[value="PAPER"]').click());assert.equal(selected,'PAPER');
    assert.equal(paperGaps('A {{21}} B [22] C (____23) D (24)'), 'A  ___21___  B  ___22___  C  ___23___  D  ___24___ ');
    await render(React.createElement(ExamRunnerPage,{session,initialProgress:progress,saveProgress,onSubmit:async p=>submissions.push(p),registrationRequiredFrom:3,onRegistrationRequired:async p=>gates.push(p)}));
    assert.equal(target.querySelector('.paper-booklet-spread input[type="radio"]'),null,'Task booklet has no inline digital answer controls');
    assert.equal(target.querySelectorAll('.paper-booklet-spread .paper-page').length,2,'Both booklet pages render together');
    assert.equal(target.querySelector('.paper-page-controls'),null,'Booklet pagination is removed');
    assert.ok(!target.querySelector('input[name="paper-2"]'),'Only the current exercise has answer rows');
    assert.ok(target.textContent.includes('Leseverstehen Teil 1'));
    assert.ok(target.textContent.includes('Lesetext eins'));
    assert.ok(!target.textContent.includes('SECRET_GATED_TEXT'));
    assert.ok(!target.querySelector('input[name="paper-4"]'),'Gated answer rows are not exposed');
    await act(async()=>target.querySelector('input[name="paper-1"][value="b"]').click());
    assert.ok(target.querySelector('input[name="paper-1"][value="b"]').checked);
    await click('Antwortbogen ausblenden');
    assert.ok(target.querySelector('.paper-exercise-answers').hidden);
    assert.equal(target.querySelectorAll('.paper-booklet-spread .paper-page').length,2,'Hiding answers retains both task pages');
    await click('Antwortbogen anzeigen');
    assert.ok(!target.querySelector('.paper-exercise-answers').hidden);
    assert.ok(target.querySelector('input[name="paper-1"][value="b"]').checked,'Answers survive panel toggling');
    await act(async()=>{const select=target.querySelector('select');select.value='1';select.dispatchEvent(new Event('change',{bubbles:true}));});await flush();
    assert.ok(target.querySelector('input[name="paper-2"]'));assert.ok(!target.querySelector('input[name="paper-1"]'),'Changing exercise switches the answer panel');
    await act(async()=>{const select=target.querySelector('select');select.value='3';select.dispatchEvent(new Event('change',{bubbles:true}));});await flush();
    assert.equal(target.querySelector('.paper-exam'),null,'Checkpoint removes all gated task/audio rendering');
    assert.equal(gates.length,1);assert.equal(gates[0].index,3);assert.equal(gates[0].answers['1'].selectedOptionKeys[0],'b');
    // Resume the same saved paper session after authentication with the same answer map.
    await render(React.createElement(ExamRunnerPage,{key:'resumed',session,initialProgress:gates[0],saveProgress,onSubmit:async p=>submissions.push(p)}));
    assert.ok(target.querySelector('.paper-exam'));
    assert.ok(target.querySelector('input[name="paper-4"]'));
    assert.ok(!target.querySelector('input[name="paper-1"]'));
    await act(async()=>{const select=target.querySelector('select');select.value='0';select.dispatchEvent(new Event('change',{bubbles:true}));});await flush();
    assert.ok(target.querySelector('input[name="paper-1"][value="b"]').checked);
    await act(async()=>target.querySelector('[aria-label="Antwort 1 löschen"]').click());
    assert.ok(!target.querySelector('input[name="paper-1"]:checked'));
    await render(React.createElement(ExamRunnerPage,{key:'digital',session:{...session,format:undefined},initialProgress:progress,saveProgress,onSubmit:async()=>{}}));
    assert.ok(target.querySelector('[data-digital]'));assert.equal(target.querySelector('.paper-exam'),null,'Legacy sessions use the original digital renderer');
    const answers = Object.fromEntries(exercises.map(p=>[p.questions[0].number,{selectedOptionKeys:p.questions[0].type==='FREE_TEXT'?[]:[p.questions[0].options[0].key],text:p.questions[0].type==='FREE_TEXT'?'Liebe Anna, vielen Dank!':''}]));
    await render(React.createElement(ExamRunnerPage,{key:'complete',session,initialProgress:{revision:2,index:8,answers},saveProgress,onSubmit:async p=>submissions.push(p)}));
    assert.ok(target.querySelector('.paper-workspace--writing .paper-booklet-spread .paper-page'));
    assert.ok(target.querySelector('.paper-workspace--writing .paper-writing-sheets textarea'));
    assert.equal(target.querySelector('.paper-answer-toggle'),null,'Writing remains visible beside the prompt');
    assert.equal(target.querySelector('textarea').value,'Liebe Anna, vielen Dank!');
    await click('Submit');await click('Confirm');assert.equal(submissions.length,1);assert.equal(submissions[0].answers.length,9);assert.equal(submissions[0].answers[8].text,'Liebe Anna, vielen Dank!');
    await render(React.createElement(PaperExam,{session,index:8,answers,onSelection:()=>assert.fail('Read-only selection changed'),onText:()=>assert.fail('Read-only text changed'),readOnly:true}));
    assert.ok(target.querySelector('textarea').readOnly);
    await render(React.createElement(PaperExam,{session,index:0,answers,onSelection:()=>assert.fail('Read-only selection changed'),onText:()=>{},readOnly:true}));
    assert.ok([...target.querySelectorAll('input')].every(input=>input.disabled));
    await render(React.createElement(GuestPage,{key:'new-guest'}));
    assert.equal(guestRequests.filter(p=>p.startsWith('/start')).length,0,'No guest exam is generated before format choice');
    await act(async()=>target.querySelector('input[value="PAPER"]').click());await click('Prüfung starten');
    assert.ok(guestRequests.includes('/start?format=PAPER'));assert.equal(target.querySelector('[data-guest-format]').getAttribute('data-guest-format'),'PAPER');
    await render(React.createElement(GuestPage,{key:'guest-reload'}));assert.equal(target.querySelector('[data-guest-format]').getAttribute('data-guest-format'),'PAPER','Reload uses server-saved format');
    assert.equal(guestRequests.filter(p=>p.startsWith('/start')).length,1,'Reload never creates another attempt');
    await act(async()=>root.unmount());
    console.log('Paper exam checks passed: format choice, simultaneous booklet pages, current-exercise answer panel, hide/show persistence, side-by-side writing, clearing, checkpoint privacy, save/restore, digital fallback, submission payload and read-only review.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>dom.window.close());
