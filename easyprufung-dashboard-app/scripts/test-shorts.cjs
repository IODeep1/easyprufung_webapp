const assert = require('assert/strict');
const fs = require('fs'), path = require('path'), vm = require('vm'), ts = require('typescript');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/login' });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Event', 'KeyboardEvent']) global[key] = dom.window[key];
global.IS_REACT_ACT_ENVIRONMENT = true;
window.scrollTo = () => {};
const React = require('react'), { createRoot } = require('react-dom/client'), { act, Simulate } = require('react-dom/test-utils');
const base = path.resolve(__dirname, '../src/components/User/Exam');
const cache = new Map();
function load(file) {
    file = path.resolve(file);
    if (file.endsWith('.css')) return {};
    if (!fs.existsSync(file)) file += fs.existsSync(file + '.tsx') ? '.tsx' : '.ts';
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {
        module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true
    }}).outputText;
    vm.runInNewContext(source, {exports, window, document, Event, require: name =>
        name.startsWith('.') ? load(path.resolve(path.dirname(file), name)) : require(name)
    }, {filename: file});
    return exports;
}
const mode = load(path.join(base, 'shorts/shorts-mode.ts'));
const { ShortsFrame } = load(path.join(base, 'shorts/ShortsFrame.tsx'));
const { PaperExam } = load(path.join(base, 'paper/PaperExam.tsx'));
const { ExamHeader } = load(path.join(base, 'components/ExamChrome.tsx'));
const { PartRenderer } = load(path.join(base, 'components/PartRenderer.tsx'));
const parts = ['LESEN_1','LESEN_2','LESEN_3','SPRACHE_1','SPRACHE_2','HOEREN_1','HOEREN_2','HOEREN_3','SCHREIBEN_EMAIL'];
const exercises = parts.map((partKey, i) => ({
    id: partKey, partKey, sectionKey: partKey.split('_')[0], sectionTitle: 'Deutsch B1', partTitle: `Teil ${i + 1}`,
    instructions: 'Bearbeiten Sie die Aufgabe.',
    content: i === 2 ? 'a) Anzeige eins\n\nb) Anzeige zwei' : `Liebe Anna, [${i + 1}] geht es dir?`,
    questions: [{id: `q${i}`, number: String(i + 1), type: i === 8 ? 'FREE_TEXT' : i >= 5 ? 'TRUE_FALSE' : 'SINGLE_CHOICE',
        stimulus: 'Ein kurzer Text für die Prüfung.', prompt: 'Wählen Sie eine Antwort.',
        options: i === 8 ? [] : [{key: 'a', text: 'Antwort A'}, {key: 'b', text: 'Antwort B'}]}]
}));
for (const i of [0, 1, 5, 6, 7]) exercises[i].questions.push({...exercises[i].questions[0], id: 'second-' + i, number: String(101 + i), stimulus: 'Zweiter Lesetext.', prompt: 'Zweite Frage.'});
const session = {sessionId: 'shorts-test', title: 'Deutsch B1', level: 'B1', format: 'PAPER', exercises};
let latest = {};
function Harness({index, paper}) {
    const [answers, setAnswers] = React.useState({}); latest = answers;
    const onSelection = (number, key) => setAnswers(old => ({...old, [number]: {selectedOptionKeys: key ? [key] : [], text: ''}}));
    const onText = (number, text) => setAnswers(old => ({...old, [number]: {selectedOptionKeys: [], text}}));
    return React.createElement(ShortsFrame, {resetKey: index}, paper
        ? React.createElement(PaperExam, {session, index, answers, onSelection, onText})
        : React.createElement(PartRenderer, {exercise: exercises[index], answers, onSelection, onText}));
}
const root = createRoot(document.getElementById('root'));
async function render(index, paper) { await act(async () => root.render(React.createElement(Harness, {key: `${index}-${paper}`, index, paper}))); }
(async () => {
    const header = require('react-dom/server').renderToStaticMarkup(React.createElement(ExamHeader, {title:'Deutsch',level:'B1',expiresAt:null,currentIndex:0,total:9}));
    assert.ok(header.includes('TELC. Deutsch B1'), 'Exact requested exam title');
    await render(0, false);
    assert.equal(document.querySelector('[data-shorts-mode]'), null, 'Default exam layout stays unchanged');
    await act(async () => mode.setShortsMode(true));
    assert.equal(window.localStorage.getItem('smartpruefung.shorts-mode'), 'true');
    assert.ok(document.querySelector('.shorts-stage'));
    assert.equal(document.querySelector('.shorts-caption-space').textContent, '', 'Caption area is blank');
    assert.equal(document.querySelector('.shorts-brand').textContent, 'SmartPrüfung');
    assert.equal(document.body.style.overflow, 'hidden');
    assert.ok(document.getElementById('root').hasAttribute('inert'), 'Background navigation cannot receive focus');
    await act(async () => root.render(React.createElement(ExamHeader, {title:'Deutsch',level:'B1',expiresAt:null,currentIndex:0,total:9})));
    assert.equal(document.querySelector('[aria-label$="verbleibend"]'), null, 'Countdown is absent in Shorts mode');
    await act(async () => mode.setShortsMode(false));
    assert.ok(document.querySelector('[aria-label$="verbleibend"]'), 'Normal exam countdown is retained');
    await act(async () => mode.setShortsMode(true));
    for (const paper of [false, true]) for (let index = 0; index < parts.length; index++) {
        await render(index, paper);
        const content = document.querySelector('.shorts-content');
        assert.ok(content.querySelector('input, select, textarea, [aria-label^="Lücke"]'), `${parts[index]} renders (${paper ? 'paper' : 'digital'})`);
        if (index === 8) {
            const textarea = content.querySelector('textarea');
            await act(async () => Simulate.change(textarea, {target: {value: 'Liebe Anna, vielen Dank!'}}));
            assert.equal(latest['9'].text, 'Liebe Anna, vielen Dank!');
        } else if (!paper && index === 4) {
            await act(async () => content.querySelector('[aria-label="Lücke 5"]').click());
            await act(async () => content.querySelector('.exam-word-options button').click());
            assert.equal(latest['5'].selectedOptionKeys[0], 'a');
        } else {
            const select = content.querySelector('select');
            const radio = content.querySelector('input[type="radio"]');
            if (select && !(paper && (index === 3 || index === 4))) await act(async () => Simulate.change(select, {target: {value: 'a'}}));
            else if (radio) await act(async () => radio.click());
            assert.ok(latest[String(index + 1)]?.selectedOptionKeys.length, `${parts[index]} answer is retained`);
        }
        if (paper && (index === 3 || index === 4)) {
            const region = () => content.querySelector('.paper-cloze-preview');
            assert.ok(region(), 'Answer possibilities are shown below the gap');
            assert.ok(!region().textContent.includes('Lücke'), 'Overlay has no visible gap heading');
            if(index === 4) assert.equal(region().querySelector('ol').textContent, region().querySelector('ol').textContent.toUpperCase());
            assert.ok(content.querySelector('.paper-cloze-static-options'), 'Original printed answer lists remain below the passage');
            assert.equal(region().querySelectorAll('li').length, exercises[index].questions[0].options.length);
            assert.equal(content.querySelector('.paper-cloze-preview-toolbar'), null, 'No gap selector or show-options toolbar');
            const toggle = () => content.querySelector('.paper-preview-gap');
            await act(async () => toggle().click());
            assert.equal(region(), null, 'Options can be hidden without hiding the passage');
            assert.ok(content.querySelector('.paper-letter'));
            const before = JSON.stringify(latest);
            await act(async () => toggle().click());
            assert.ok(region());
            await act(async () => content.querySelector('[aria-label="Antwortmöglichkeiten schließen"]').click());
            assert.equal(region(), null);
            await act(async () => content.querySelector('.paper-preview-gap').click());
            assert.ok(region());
            assert.equal(JSON.stringify(latest), before, 'Previewing choices never marks the answer sheet');
            assert.ok(content.querySelector('.paper-exam--cloze .paper-exercise-answers input:checked'), 'Actual answer remains on the original answer sheet');
            await act(async () => region().querySelectorAll('.paper-preview-option')[1].click());
            assert.equal(region(), null, 'Overlay closes after choosing an answer');
            const number = String(index + 1);
            assert.equal(latest[number].selectedOptionKeys[0], 'b');
            assert.ok(content.querySelector(`input[name="paper-${number}"][value="b"]`).checked, 'Overlay fills the answer sheet');
            const expectedText = index === 4 ? 'ANTWORT B' : 'Antwort B';
            assert.equal(content.querySelector('.paper-preview-gap').textContent, expectedText, 'Overlay fills the text gap');
            assert.ok(content.querySelector('.paper-preview-gap--filled'), 'Filled answer uses dedicated black and bold styling');
            await act(async () => content.querySelector(`input[name="paper-${number}"][value="a"]`).click());
            assert.equal(content.querySelector('.paper-preview-gap').textContent, index === 4 ? 'ANTWORT A' : 'Antwort A', 'Answer-sheet edits update the gap');
            await act(async () => content.querySelector(`[aria-label="Antwort ${number} löschen"]`).click());
            assert.equal(content.querySelector('.paper-preview-gap').textContent, `___${number}___`, 'Clearing the answer sheet clears the gap');
        }
        if (index >= 5 && index <= 7) {
            const triggers = content.querySelectorAll('.listening-focus-trigger');
            assert.equal(triggers.length, 2);
            if (triggers[0].getAttribute('aria-pressed') === 'true') await act(async () => triggers[0].click());
            const beforeFocus = JSON.stringify(latest);
            await act(async () => triggers[0].click());
            assert.equal(triggers[0].getAttribute('aria-pressed'), 'true');
            assert.equal(content.querySelectorAll('.is-listening-focused').length, 1);
            assert.equal(content.querySelectorAll('.is-listening-blurred').length, 1);
            if (paper) {
                assert.equal(content.querySelectorAll('.is-answer-focused').length, 1);
                assert.equal(content.querySelectorAll('.is-answer-blurred').length, 1);
            }
            await act(async () => triggers[1].click());
            assert.equal(triggers[0].getAttribute('aria-pressed'), 'false');
            assert.equal(triggers[1].getAttribute('aria-pressed'), 'true');
            await act(async () => triggers[1].click());
            assert.equal(content.querySelectorAll('.is-listening-blurred').length, 0);
            assert.equal(content.querySelectorAll('.is-listening-focused').length, 0);
            assert.equal(JSON.stringify(latest), beforeFocus, 'Focusing never changes exam answers');
            if (paper) {
                await act(async () => content.querySelectorAll('.listening-answer-focus-row')[1].click());
                assert.equal(triggers[1].getAttribute('aria-pressed'), 'true', 'Answer-row focus also focuses its statement');
                assert.equal(content.querySelectorAll('.is-answer-blurred').length, 1);
            }
        }
        assert.equal(content.querySelector('[data-short-question]'), null, 'No replacement quiz cards');
        if (paper) {
            assert.ok(content.querySelector('.paper-booklet-spread'), 'Original booklet is retained');
            if (index >= 5 && index <= 7) assert.ok(content.querySelector('.paper-exam--listening'));
            if (index !== 8) assert.ok(content.querySelector('.paper-exercise-answers'), 'Original answer sheet is retained');
            if (index === 0) assert.equal(content.querySelectorAll('.paper-booklet-spread .paper-page').length, 2, 'Original booklet pages remain together');
        } else {
            assert.ok(content.querySelector('.frame'), 'Original digital task renderer is retained');
            if (index === 1) assert.ok(content.querySelector('.exam-reading-pair'), 'Original reading and question panels');
            if (index === 4) assert.ok(content.querySelector('.exam-word-bank'), 'Original word-bank controls');
            if (index >= 5 && index <= 7) assert.ok(content.querySelector('.exam-listening-table'), 'Original listening table');
        }
    }
    await require('i18next').init({lng:'de',resources:{de:{translation:{}}}});
    const { ExamReviewPage } = load(path.join(base, 'ExamReviewPage.tsx'));
    const result = {passed:true, score:1, maximumScore:1, percentage:100, sections:[], overallFeedback:null,
        questions:exercises.flatMap(part => part.questions.map(q => ({number:q.number, correct:false, score:0, maximumScore:1,
            submittedAnswers:q.type === 'FREE_TEXT' ? ['Saved writing'] : ['a'], correctAnswers:q.type === 'FREE_TEXT' ? [] : ['b'], explanation:'Saved feedback'})))};
    await act(async () => root.render(React.createElement(ExamReviewPage, {session, result, onBack:()=>{}})));
    assert.equal(document.querySelector('.shorts-reference'), null, 'No right-side answer reference');
    assert.ok(document.querySelector('.shorts-stage input[name="paper-1"][value="a"]').checked);
    assert.ok(document.querySelector('.shorts-stage input[name="paper-1"]').disabled, 'Saved review stays read-only');
    await render(1, true);
    document.querySelector('.shorts-content').scrollTop = 100;
    await render(0, true);
    assert.equal(document.querySelector('.shorts-content').scrollTop, 0);
    await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'})));
    assert.equal(document.querySelector('.shorts-stage'), null);
    assert.equal(document.body.style.overflow, '');
    assert.ok(!document.getElementById('root').hasAttribute('inert'));
    assert.equal(window.localStorage.getItem('smartpruefung.shorts-mode'), 'false');
    await act(async () => root.unmount());
    console.log('Shorts mode: preference, frame, all 18 exercise layouts, answers, original exam layouts, scrolling and exit passed.');
})().catch(error => {console.error(error); process.exitCode = 1;});
