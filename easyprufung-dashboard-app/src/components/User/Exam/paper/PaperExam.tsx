import { Fragment, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useShortsMode } from "../shorts/shorts-mode";
import type { AnswerMap, ExamSessionView, ExerciseView, OptionDto, QuestionResultView, QuestionView } from "../models/exam";
import "./paper-exam.css";

type Props = {
    session: ExamSessionView;
    index: number;
    answers: AnswerMap;
    onSelection: (number: string, key: string) => void;
    onText: (number: string, text: string) => void;
    onNavigate?: (index: number) => void;
    registrationRequiredFrom?: number;
    audio?: ReactNode;
    readOnly?: boolean;
    reviewResults?: ReadonlyMap<string, QuestionResultView>;
};

export function paperTiming(exercise: ExerciseView): string {
    if (/^(LESEN|SPRACHE)_/.test(exercise.partKey)) return "90 Minuten Leseverstehen und Sprachbausteine";
    if (exercise.partKey.startsWith("HOEREN_")) return "ca. 30 Minuten Hörverstehen";
    if (exercise.partKey === "SCHREIBEN_EMAIL") return "30 Minuten Schriftlicher Ausdruck";
    return exercise.sectionTitle;
}

export function paperOptions(questions: QuestionView[]): OptionDto[] {
    const options = new Map<string, OptionDto>();
    questions.forEach(q => q.options.forEach(o => { if (!options.has(o.key)) options.set(o.key, o); }));
    return Array.from(options.values());
}

export function paperGaps(content: string): string {
    return content.replace(/\{\{\s*(\d+)\s*\}\}|\[\s*(\d+)\s*\]|\(\s*(?:____\s*)?(\d+)\s*\)/g,
        (_match, a, b, c) => ` ___${a || b || c}___ `);
}

function Page({ title, timing, children, number, answerSheet = false }: {
    title: string; timing: string; children: ReactNode; number: number; answerSheet?: boolean;
}) {
    return <article className={`paper-page ${answerSheet ? "paper-answer-page" : ""}`} aria-label={`${title} · Seite ${number}`}>
        <header className="paper-page-header"><span>{timing}</span><b>{number}</b></header>
        <div className="paper-side-label" aria-hidden="true">{answerSheet ? "Antwortbogen" : title.replace(/ Teil \d+/, "")}</div>
        <div className="paper-page-body"><h2>{title}</h2>{children}</div>
        <footer className="paper-page-footer"><span>SmartPrüfung · TELC. Deutsch B1 · Übungsprüfung</span><span>{answerSheet ? "Antwortbogen" : "Aufgabenheft"}</span></footer>
    </article>;
}

function Questions({ exercise, showStimulus = true, focused = null, onFocus }: {
    exercise: ExerciseView; showStimulus?: boolean; focused?: string | null; onFocus?: (number: string) => void;
}) {
    const shortsMode = useShortsMode();
    const focusEnabled = shortsMode && exercise.partKey.startsWith("HOEREN_");
    return <div className="paper-questions">{exercise.questions.map(q => <section key={q.number}
        className={`paper-question${focusEnabled ? ` listening-focus-row${focused === q.number ? " is-listening-focused" : focused ? " is-listening-blurred" : ""}` : ""}`}>
        {focusEnabled ? <button type="button" className="listening-focus-trigger paper-listening-focus-trigger"
            aria-pressed={focused === q.number} onClick={() => onFocus?.(q.number)}>
            <b className="paper-question-number">{q.number}</b><span className="paper-prose">{q.prompt}</span>
        </button> : <>
        <b className="paper-question-number">{q.number}</b>
        <div>{showStimulus && q.stimulus && <p className="paper-prose">{q.stimulus}</p>}<p className="paper-prose">{q.prompt}</p>
            {q.type !== "TRUE_FALSE" && <ol className="paper-choice-list">{q.options.map(o => <li key={o.key}><b>{o.key.toLowerCase()}</b><span>{o.text}</span></li>)}</ol>}
        </div>
        </>}
    </section>)}</div>;
}

function instructions(exercise: ExerciseView): string {
    // Paper tasks are answered on the separate sheet, never with digital drag/drop controls.
    switch (exercise.partKey) {
        case "LESEN_1": return "Ordnen Sie jedem Text eine passende Überschrift zu. Jede Überschrift darf nur einmal verwendet werden. Tragen Sie Ihre Lösungen auf dem Antwortbogen ein.";
        case "LESEN_2": return "Lesen Sie den Text und wählen Sie für jede Aufgabe eine Lösung: a, b oder c. Tragen Sie Ihre Lösungen auf dem Antwortbogen ein.";
        case "LESEN_3": return "Ordnen Sie die Anzeigen den Situationen zu. Jede Anzeige darf nur einmal verwendet werden. Falls keine Anzeige passt, markieren Sie x auf dem Antwortbogen.";
        case "SPRACHE_1": return "Lesen Sie den Text. Wählen Sie für jede Lücke a, b oder c und markieren Sie Ihre Lösungen auf dem Antwortbogen.";
        case "SPRACHE_2": return "Ergänzen Sie die Lücken mit Wörtern aus dem Kasten. Jedes Wort darf nur einmal verwendet werden; einige Wörter bleiben übrig. Markieren Sie Ihre Lösungen auf dem Antwortbogen.";
        default: return exercise.instructions;
    }
}

function ClozePassagePreview({ exercise, answers, onSelection, readOnly }: {
    exercise: ExerciseView; answers: AnswerMap; onSelection: Props["onSelection"]; readOnly?: boolean;
}) {
    const shorts = useShortsMode();
    const [open, setOpen] = useState(true);
    const [number, setNumber] = useState(exercise.questions[0]?.number ?? "");
    const passage = useRef<HTMLDivElement>(null);
    const popup = useRef<HTMLSpanElement>(null);
    const popupId = useId();
    const question = exercise.questions.find(q => q.number === number);
    const options = exercise.partKey === "SPRACHE_2" ? paperOptions(exercise.questions) : question?.options ?? [];
    const pattern = /(\{\{\s*\d+\s*\}\}|\[\s*\d+\s*\]|\(\s*(?:____\s*)?\d+\s*\))/g;
    const marker = /^(?:\{\{\s*(\d+)\s*\}\}|\[\s*(\d+)\s*\]|\(\s*(?:____\s*)?(\d+)\s*\))$/;
    const parts = (exercise.content ?? "").split(pattern);
    const hasMarkers = parts.some(part => marker.test(part));

    useLayoutEffect(() => {
        if (!shorts || !open || !popup.current || !passage.current) return;
        const box = popup.current;
        box.style.transform = "";
        const rect = box.getBoundingClientRect();
        const bounds = passage.current.getBoundingClientRect();
        const shift = Math.max(bounds.left + 4 - rect.left, Math.min(0, bounds.right - 4 - rect.right));
        box.style.transform = `translateX(${shift}px)`;
        const gap = box.parentElement;
        const scroll = passage.current.closest<HTMLElement>(".paper-exam");
        if (gap && scroll) {
            const gapRect = gap.getBoundingClientRect();
            const view = scroll.getBoundingClientRect();
            if (gapRect.top < view.top || rect.bottom > view.bottom) {
                scroll.scrollTop = Math.max(0, scroll.scrollTop + gapRect.top - view.top - view.height * .22);
            }
        }
    }, [shorts, open, number]);

    if (!shorts) return <div className="paper-prose paper-letter">{paperGaps(exercise.content || "")}</div>;

    const unavailable = (key: string) => Boolean(readOnly || (exercise.partKey === "SPRACHE_2" &&
        exercise.questions.some(q => q.number !== number && answers[q.number]?.selectedOptionKeys.includes(key))));
    const choose = (key: string) => {
        if (unavailable(key)) return;
        onSelection(number, key);
        setOpen(false);
        Array.from(passage.current?.querySelectorAll<HTMLButtonElement>(".paper-preview-gap") ?? [])
            .find(button => button.dataset.gapNumber === number)?.focus({ preventScroll: true });
    };
    const gap = (value: string) => {
        const target = exercise.questions.find(q => q.number === value);
        const selected = target?.options.find(option => answers[value]?.selectedOptionKeys.includes(option.key));
        const text = selected ? (exercise.partKey === "SPRACHE_2" ? selected.text.toUpperCase() : selected.text) : `___${value}___`;
        return <span className="paper-preview-gap-wrap">
        <button type="button" className={`paper-preview-gap${selected ? " paper-preview-gap--filled" : ""}`} aria-label={`Antwortmöglichkeiten für Lücke ${value}`}
            data-gap-number={value}
            aria-expanded={open && value === number} aria-controls={open && value === number ? popupId : undefined}
            onClick={() => { setNumber(value); setOpen(value !== number || !open); }}>{text}</button>
        {open && value === number && <span ref={popup} id={popupId} className="paper-cloze-preview" role="region" aria-label={`Antwortmöglichkeiten · Lücke ${number}`}>
            <span className="paper-cloze-preview-heading"><button type="button" aria-label="Antwortmöglichkeiten schließen" onClick={() => setOpen(false)}>×</button></span>
            {exercise.partKey === "SPRACHE_1" ? <div className="paper-language-options paper-preview-original-options">
                <section><b>{number}</b><ol className="paper-choice-list">{options.map(option => <li key={option.key}>
                    <button type="button" className="paper-preview-option" disabled={unavailable(option.key)}
                        aria-pressed={answers[number]?.selectedOptionKeys.includes(option.key) ?? false} onClick={() => choose(option.key)}>
                        <b>{option.key.toLowerCase()}</b><span>{option.text}</span>
                    </button>
                </li>)}</ol></section>
            </div> : <ol className="paper-word-bank paper-preview-original-bank">
                {options.map(option => <li key={option.key}>
                    <button type="button" className="paper-preview-option" disabled={unavailable(option.key)}
                        aria-pressed={answers[number]?.selectedOptionKeys.includes(option.key) ?? false} onClick={() => choose(option.key)}>
                        <b>{option.key.toUpperCase()}</b> {option.text.toUpperCase()}
                    </button>
                </li>)}
            </ol>}
        </span>}
    </span>;
    };

    return <div className="paper-cloze-preview-container" onKeyDown={event => {
        if (event.key === "Escape" && open) { event.stopPropagation(); setOpen(false); }
    }}>
        <div ref={passage} className="paper-prose paper-letter">
            {parts.map((part, i) => {
                const match = part.match(marker);
                const value = match && (match[1] || match[2] || match[3]);
                return <Fragment key={i}>{value && exercise.questions.some(q => q.number === value) ? gap(value) : part}</Fragment>;
            })}
            {!hasMarkers && <div className="paper-preview-fallback">{exercise.questions.map(q => <Fragment key={q.number}>{gap(q.number)} </Fragment>)}</div>}
        </div>
    </div>;
}

function TaskPages({ exercise, answers = {}, onSelection = () => {}, readOnly = false, focusedListening, onListeningFocus }: {
    exercise: ExerciseView; answers?: AnswerMap; onSelection?: Props["onSelection"]; readOnly?: boolean;
    focusedListening?: string | null; onListeningFocus?: (number: string) => void;
}): ReactNode[] {
    const heading = <p className="paper-instructions">{instructions(exercise)}</p>;
    const content = <div className="paper-prose paper-reading">{exercise.content}</div>;
    switch (exercise.partKey) {
        case "LESEN_1":
            return [<>{heading}<ol className="paper-headlines">{paperOptions(exercise.questions).map(o => <li key={o.key}><b>{o.key.toLowerCase()}</b><span>{o.text}</span></li>)}</ol></>,
                <div className="paper-text-columns">{exercise.questions.map(q => <section className="paper-reading-card" key={q.number}><b>{q.number}</b><p className="paper-prose">{q.stimulus || q.prompt}</p></section>)}</div>];
        case "LESEN_2": return [<>{heading}{content}</>, <Questions exercise={exercise} />];
        case "LESEN_3": {
            const ads = exercise.content?.trim().split(/\n+(?=\s*[a-z]\)\s)/i).filter(Boolean) || [];
            const pages: ReactNode[] = [<>{heading}<div className="paper-questions">{exercise.questions.map(q => <section key={q.number} className="paper-question"><b>{q.number}</b><p className="paper-prose">{q.stimulus || q.prompt}</p></section>)}</div></>];
            pages.push(<div className="paper-ad-columns">{ads.map((ad, n) => <p key={n} className="paper-ad paper-prose">{ad}</p>)}</div>);
            return pages;
        }
        case "SPRACHE_1": return [<>{heading}<ClozePassagePreview key={exercise.id} exercise={exercise} answers={answers} onSelection={onSelection} readOnly={readOnly} /><div className="paper-language-options paper-cloze-static-options">{exercise.questions.map(q => <section key={q.number}><b>{q.number}</b><ol className="paper-choice-list">{q.options.map(o => <li key={o.key}><b>{o.key.toLowerCase()}</b><span>{o.text}</span></li>)}</ol></section>)}</div></>];
        case "SPRACHE_2": return [<>{heading}<ClozePassagePreview key={exercise.id} exercise={exercise} answers={answers} onSelection={onSelection} readOnly={readOnly} /><ol className="paper-word-bank paper-cloze-static-options">{paperOptions(exercise.questions).map(o => <li key={o.key}><b>{o.key.toUpperCase()}</b> {o.text.toUpperCase()}</li>)}</ol></>];
        case "HOEREN_1":
        case "HOEREN_2":
        case "HOEREN_3": return [<>{heading}<Questions exercise={exercise} showStimulus={false} focused={focusedListening} onFocus={onListeningFocus} /></>];
        case "SCHREIBEN_EMAIL": return [<>{heading}{content}{exercise.questions.map(q => <div key={q.number}>{q.stimulus && <blockquote className="paper-prose paper-letter">{q.stimulus}</blockquote>}<p className="paper-prose paper-writing-prompt">{q.prompt}</p></div>)}<p className="paper-instructions">Schreiben Sie Ihren Text auf den Antwortbogen.</p></>];
        default: return [<>{heading}{exercise.content && content}<Questions exercise={exercise} /></>];
    }
}

function AnswerRow({ question, answers, onSelection, readOnly, result, uppercaseKeys }: {
    question: QuestionView; answers: AnswerMap; onSelection: Props["onSelection"]; readOnly?: boolean; result?: QuestionResultView; uppercaseKeys?: boolean;
}) {
    const selected = answers[question.number]?.selectedOptionKeys[0] || "";
    return <fieldset className="paper-answer-row">
        <legend className="paper-sr-only">Aufgabe {question.number}</legend>
        <b aria-hidden="true">{question.number}</b>
        <div className="paper-bubbles">{question.options.map(o => {
            const isCorrect = Boolean(readOnly && result?.correctAnswers.some(key => key.toLowerCase() === o.key.toLowerCase()));
            const correct = Boolean(readOnly && result && !result.correct && isCorrect && selected !== o.key);
            const wrong = Boolean(readOnly && result && !result.correct && selected === o.key && !isCorrect);
            const feedback = isCorrect ? " – richtige Antwort" : wrong ? " – Ihre falsche Antwort" : "";
            return <label key={o.key} className={correct ? "paper-option-correct" : wrong ? "paper-option-wrong" : undefined}
                title={`${question.type === "TRUE_FALSE" ? o.text : `Antwort ${o.key}`}${feedback}`}>
                <span>{question.type === "TRUE_FALSE" ? (/^(true|richtig|r|\+)$/i.test(o.key) || /^(richtig|true)$/i.test(o.text) ? "+" : "−") : uppercaseKeys ? o.key.toUpperCase() : o.key.toLowerCase()}</span>
                <span className="paper-bubble-mark">
                    <input type="radio" name={`paper-${question.number}`} value={o.key} checked={selected === o.key} disabled={readOnly}
                        aria-label={`Aufgabe ${question.number}: ${o.key} ${question.type === "TRUE_FALSE" ? o.text : ""}${feedback}`}
                        onChange={() => onSelection(question.number, o.key)} />
                    {wrong && <span className="paper-wrong-cross" aria-hidden="true">×</span>}
                    {correct && <span className="paper-correct-check" aria-hidden="true">✓</span>}
                </span>
            </label>;
        })}</div>
        {!readOnly && selected && <button type="button" className="paper-erase" aria-label={`Antwort ${question.number} löschen`} onClick={() => onSelection(question.number, "")}>×</button>}
    </fieldset>;
}

export function PaperExam(props: Props) {
    const { session, index, answers, onSelection, onText, readOnly, reviewResults } = props;
    const [answersOpen, setAnswersOpen] = useState(true);
    const shortsMode = useShortsMode();
    const [focusedListening, setFocusedListening] = useState<string | null>(null);
    useEffect(() => { setFocusedListening(null); }, [session.sessionId, index, shortsMode]);
    const answerPanelId = useId();
    const answerToggle = useRef<HTMLButtonElement>(null);
    const exercise = session.exercises[index];
    // The runner gates these exercises before registration; retain the boundary here too.
    if (props.registrationRequiredFrom !== undefined && index >= props.registrationRequiredFrom) {
        return <section className="paper-exam" role="status">Bitte melden Sie sich an, um fortzufahren.</section>;
    }
    const focusEnabled = shortsMode && exercise.partKey.startsWith("HOEREN_");
    const pages = TaskPages({ exercise, answers, onSelection, readOnly, focusedListening: focusEnabled ? focusedListening : null,
        onListeningFocus: number => setFocusedListening(current => current === number ? null : number) });
    const firstPage = 6 + session.exercises.slice(0, index).reduce((total, part) => total + TaskPages({exercise: part}).length, 0);
    const written = exercise.questions.filter(q => q.type === "FREE_TEXT");
    const objective = exercise.questions.filter(q => q.type !== "FREE_TEXT");
    const writing = written.length > 0;
    const title = `${exercise.sectionTitle} ${exercise.partTitle}`;
    const answeredCount = objective.filter(q => answers[q.number]?.selectedOptionKeys.length).length;
    return <section className={`paper-exam${/^SPRACHE_[12]$/.test(exercise.partKey) ? " paper-exam--cloze" : ""}${exercise.partKey.startsWith("HOEREN_") ? " paper-exam--listening" : ""}`} lang="de" dir="ltr">
        <div className="paper-toolbar">
            <strong className="paper-document-label">Aufgabenheft · {title}</strong>
            <div className="paper-toolbar-actions">
                {props.onNavigate && <label className="paper-part-select">Prüfungsteil <select aria-label="Prüfungsteil" value={index} onChange={e => props.onNavigate!(Number(e.target.value))}>
                    {session.exercises.map((part, i) => <option key={part.id} value={i}>{part.sectionTitle} {part.partTitle}</option>)}
                </select></label>}
                {!writing && <button type="button" ref={answerToggle} className="paper-answer-toggle" aria-expanded={answersOpen} aria-controls={answerPanelId}
                    onClick={() => setAnswersOpen(open => !open)}>{answersOpen ? "Antwortbogen ausblenden" : "Antwortbogen anzeigen"}</button>}
            </div>
        </div>
        {props.audio && <div className="paper-audio">{props.audio}</div>}
        <p className="paper-help">{writing ? "Lesen Sie die Aufgabe und schreiben Sie Ihren Text auf dem Antwortbogen daneben." : "Alle Heftseiten dieses Teils sind gleichzeitig sichtbar. Markieren Sie Ihre Antworten im zugehörigen Antwortbogen."}</p>
        <div className={`paper-workspace ${writing ? "paper-workspace--writing" : answersOpen ? "paper-workspace--with-answers" : ""}`}>
            <div className={`paper-booklet-spread ${pages.length > 1 ? "paper-booklet-spread--multiple" : ""}`} aria-label="Aufgabenheft">
                {pages.map((content, pageIndex) => <Page key={`${exercise.id}:${pageIndex}`} title={title} timing={paperTiming(exercise)} number={firstPage + pageIndex}>{content}</Page>)}
            </div>
            {!writing && <aside id={answerPanelId} hidden={!answersOpen} className="paper-exercise-answers" aria-label={`Antwortbogen · ${title}`}>
                <div className="paper-answer-panel-heading">
                    <h2>Antwortbogen</h2>
                    <button type="button" aria-label="Antwortbogen ausblenden" aria-controls={answerPanelId} aria-expanded={answersOpen} onClick={() => { setAnswersOpen(false); answerToggle.current?.focus(); }}>×</button>
                </div>
                <h3>{title}</h3>
                <p className="paper-answer-progress">{answeredCount} / {objective.length} beantwortet</p>
                <p className="paper-answer-hint">{readOnly ? "Ihre Markierung bleibt schwarz. Bei Fehlern zeigt × Ihre Antwort und Grün mit ✓ die richtige Lösung." : "Markieren Sie je Aufgabe ein Feld. Mit × können Sie eine Antwort löschen."}</p>
                <div className="paper-current-answer-rows">{objective.map(q => <div key={q.number}
                    className={focusEnabled ? `listening-answer-focus-row${focusedListening === q.number ? " is-answer-focused" : focusedListening ? " is-answer-blurred" : ""}` : undefined}
                    onClick={focusEnabled ? () => setFocusedListening(q.number) : undefined}
                    onFocusCapture={focusEnabled ? () => setFocusedListening(q.number) : undefined}>
                    <AnswerRow question={q} answers={answers} onSelection={onSelection} readOnly={readOnly} result={reviewResults?.get(q.number)} uppercaseKeys={exercise.partKey === "SPRACHE_2"} />
                </div>)}</div>
            </aside>}
            {writing && <div className="paper-writing-sheets" aria-label="Antwortbogen · Schriftlicher Ausdruck">
                {written.map((q, writingIndex) => <Page key={q.number} title="Schriftlicher Ausdruck" timing="Antwortbogen · TELC. Deutsch B1" number={writingIndex + 1} answerSheet>
                    <label className="paper-writing-label" htmlFor={`paper-writing-${q.number}`}>Ihr Text</label>
                    <textarea id={`paper-writing-${q.number}`} className="paper-writing" aria-label="Schriftlicher Ausdruck – Ihr Text" value={answers[q.number]?.text || ""}
                        readOnly={readOnly} spellCheck={false} onChange={e => onText(q.number, e.target.value)} />
                </Page>)}
            </div>}
        </div>
    </section>;
}
