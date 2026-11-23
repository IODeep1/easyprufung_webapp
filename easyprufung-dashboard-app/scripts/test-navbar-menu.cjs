const fs = require('fs'), path = require('path'), vm = require('vm'), ts = require('typescript'), assert = require('assert/strict');
const React = require('react'), {createRoot} = require('react-dom/client'), {act} = require('react-dom/test-utils'), {JSDOM} = require('jsdom');
const dom = new JSDOM('<div id="test"></div><button id="outside">Outside</button>', {url:'http://localhost/'});
for (const key of ['window','document','navigator','HTMLElement','Node','Event','KeyboardEvent']) global[key] = dom.window[key];
global.IS_REACT_ACT_ENVIRONMENT = true;
const src = path.resolve(__dirname,'../src'), cache = new Map(), navigations = [], dispatched = [];
let pathname = '/', locale = 'en', role = {isTeacher:false,status:'NOT_REGISTERED'}, subscription = {plan:'free',quota:0};
const feature = require('../src/locales/feature-phrases.json'), legacy = require('../src/locales/ui-phrases.json');
const translate = key => locale === 'en' ? key : feature[key]?.[locale] || legacy[key]?.[locale] || key;
const navigate = to => {pathname=to;navigations.push(to);};
function load(file) {
    if(cache.has(file)) return cache.get(file);
    const exported = {}; cache.set(file,exported);
    const resolve = name => {
        if(name === 'react') return React;
        if(name.endsWith('feature-i18n')) return {tr:translate,useFeatureLocale:()=>({locale,dir:locale==='ar'?'rtl':'ltr'})};
        if(name.endsWith('TeacherRole')) return {useTeacherRole:()=>role};
        if(name === 'react-i18next') return {useTranslation:()=>({t:key=>require(`../src/locales/${locale}/translation.json`)[key] || key,i18n:{language:locale,resolvedLanguage:locale}})};
        if(name === 'react-redux') return {useSelector:fn=>fn({userAccount:{user:{firstname:'Aziz',lastname:'Bel Abed',subscription}}}),useDispatch:()=>action=>dispatched.push(action)};
        if(name.endsWith('userAccount.actions')) return {logout:()=>({type:'LOGOUT'})};
        if(name.endsWith('useColorMode')) return {useTheme:()=>{const [colorMode,setColorMode]=React.useState('light');return {colorMode,setColorMode};}};
        if(name === 'react-router-dom') return {useLocation:()=>({pathname}),useNavigate:()=>navigate,NavLink:p=>React.createElement('a',{
            href:p.to,className:typeof p.className==='function'?p.className({isActive:p.end?pathname===p.to:pathname.startsWith(p.to)}):p.className,
            onClick:e=>{e.preventDefault();p.onClick?.(e);navigate(p.to);}
        },p.children)};
        if(name.startsWith('.')) {
            const base=path.resolve(path.dirname(file),name), found=[base,base+'.tsx',base+'.ts'].find(p=>fs.existsSync(p));
            return load(found);
        }
        return require(name);
    };
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,
        {exports:exported,require:resolve,window,document,Node}, {filename:file});
    return exported;
}
const Header=load(path.join(src,'components/User/Root/Header.tsx')).default;
const Dropdown=load(path.join(src,'components/User/Root/DropdownUser.tsx')).default;
const root=createRoot(document.getElementById('test'));
const trigger=()=>document.querySelector('#test button[aria-haspopup]');
const menu=()=>document.querySelector('[data-header-user-dropdown]');
const flush=()=>act(async()=>{await new Promise(r=>setTimeout(r,0));});
async function mount(key) {await act(async()=>root.render(React.createElement(Header,{key,sidebarOpen:false,setSidebarOpen:()=>{}})));await flush();}
async function open() {trigger().getBoundingClientRect=()=>({top:24,bottom:56,left:600,right:780});await act(async()=>trigger().click());}
async function clickText(text) {const item=[...menu().querySelectorAll('button,a')].find(el=>el.textContent===text);assert.ok(item,text);await act(async()=>item.click());}
(async()=>{
    await mount('learner');assert.ok(!document.querySelector('header').textContent.includes('Free'));assert.ok(!document.querySelector('header').textContent.includes('0 exams'));
    await open();assert.equal(menu().getAttribute('role'),'dialog');assert.equal(menu().style.top,'64px');assert.equal(menu().style.width,'320px');assert.equal(menu().style.overflowY,'auto');
    for(const group of ['Practice','Learning together','Plans','Help','Appearance and account'])assert.ok(menu().querySelector(`section[aria-label="${group}"]`),group);
    for(const href of ['/new','/my-classes','/pricing','/code_redemption','/contact'])assert.ok(menu().querySelector(`a[href="${href}"]`),href);
    assert.equal(menu().querySelector('a[href="/teacher"]'),null);
    await clickText('Exam history');assert.ok(menu().querySelector('a[href="/exams"]'));await clickText('All exams');assert.equal(menu(),null);assert.equal(navigations.at(-1),'/exams');
    await open();await clickText('Dark mode');assert.ok(menu());assert.ok(menu().textContent.includes('Light mode'));
    await act(async()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));assert.equal(menu(),null);assert.equal(document.activeElement,trigger());
    await open();const links=[...menu().querySelectorAll('a,button')];assert.equal(document.activeElement,links[0]);
    await act(async()=>links[0].dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true})));assert.equal(document.activeElement,links.at(-1));
    await act(async()=>document.getElementById('outside').focus());assert.equal(menu(),null,'Focus leaving closes the popup');
    role={isTeacher:true,status:'ACTIVE'};await mount('teacher');await open();
    assert.ok(menu().querySelector('section[aria-label="Teacher workspace"]'));assert.ok(menu().querySelector('section[aria-label="Personal practice"]'));
    for(const href of ['/teacher','/teacher/classes','/teacher/seats','/teacher/billing'])assert.ok(menu().querySelector(`a[href="${href}"]`),href);
    assert.equal(menu().querySelector('a[href="/my-classes"]'),null);
    subscription={plan:'b1',isActive:true,status:'active',endDate:'2030-12-01'};await mount('paid-teacher');await open();assert.equal(menu().querySelector('section[aria-label="Plans"]'),null);
    subscription={...subscription,status:'expired'};await mount('expired-teacher');await open();assert.ok(menu().querySelector('a[href="/pricing"]'));
    const settings=[...menu().querySelectorAll('button')].find(el=>el.textContent.includes('Settings'));await act(async()=>settings.click());assert.equal(menu(),null);assert.equal(navigations.at(-1),'/settings');
    await open();await act(async()=>menu().querySelectorAll('button')[menu().querySelectorAll('button').length-1].click());assert.equal(dispatched.at(-1).type,'LOGOUT');assert.equal(menu(),null);
    role={isTeacher:false,status:'NOT_REGISTERED'};subscription={plan:'free'};
    for(locale of ['de','fr','ar','uk','tr']) {await mount(locale);await open();assert.equal(menu().dir,locale==='ar'?'rtl':'ltr');assert.ok(menu().textContent.includes(translate('Learning together')));assert.ok(menu().textContent.includes(translate('Pricing')));}
    await act(async()=>root.render(React.createElement(Dropdown,{key:'sidebar',variant:'sidebar',sidebarOpen:true})));await act(async()=>trigger().click());assert.ok(document.querySelector('[data-sidebar-user-dropdown]'));assert.equal(document.querySelector('[data-sidebar-user-dropdown] nav'),null,'Sidebar account menu remains compact');
    await act(async()=>root.unmount());dom.window.close();
    console.log('Navbar menu checks passed: learner/teacher groups, subscription visibility, translations/RTL, history, routing, theme, keyboard/focus, logout, compact sidebar and removed navbar badges.');
})().catch(error=>{console.error(error);process.exitCode=1;dom.window.close();});
