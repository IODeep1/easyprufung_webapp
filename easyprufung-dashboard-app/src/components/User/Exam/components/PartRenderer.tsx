import { GripVertical, X } from "lucide-react";
import {Fragment, useMemo, useState, type DragEvent, useRef} from "react";
import type { AnswerMap, ExerciseView, QuestionView } from "../../../../store/models/user/exam/exam.ts";
import { AnswerSelect, RadioAnswers, TrueFalseAnswers } from "./AnswerControls.tsx";
import { ContentFrame } from "./ExamChrome";

interface PartRendererProps {
  exercise: ExerciseView;
  answers: AnswerMap;
  onSelection: (questionNumber: string, key: string) => void;
  onText: (questionNumber: string, text: string) => void;
}

function QuestionNumber({ value }: { value: string }) {
  return (
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-black bg-white text-xs font-black text-black">
      {value}
    </span>
  );
}

function SharedContent({ content }: { content: string | null }) {
  if (!content) {
    return <p className="italic text-black/40">Kein gemeinsamer Text vorhanden.</p>;
  }
  return (
      <p className="whitespace-pre-wrap text-[0.98rem] leading-8 text-black/75">
        {content}
      </p>
  );
}

function LesenTeil1({
                      exercise,
                      answers,
                      onSelection
                    }: PartRendererProps) {
  const usedOptionKeys = useMemo(
      () =>
          new Set(
              exercise.questions
                  .map(
                      (question) =>
                          answers[question.number]?.selectedOptionKeys[0]
                  )
                  .filter((key): key is string => Boolean(key))
          ),
      [answers, exercise.questions]
  );

  return (
      <ContentFrame>
        <div className="space-y-5">
          {exercise.questions.map((question) => {
            const selectedKey =
                answers[question.number]?.selectedOptionKeys[0];

            return (
                <article
                    key={question.id}
                    className="rounded-2xl border border-black bg-white p-5 sm:p-6"
                >
                  <div
                      className={`mb-2 max-w-xl rounded-xl border border-black p-2 ${
                          selectedKey ? "bg-yellow-200" : "bg-white"
                      }`}
                  >
                    <AnswerSelect
                        id={`question-${question.number}`}
                        value={selectedKey}
                        options={question.options}
                        disabledOptionKeys={usedOptionKeys}
                        onChange={(key) =>
                            onSelection(question.number, key)
                        }
                    />
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-7 text-black">
                    {question.stimulus || question.prompt}
                  </p>
                </article>
            );
          })}
        </div>
      </ContentFrame>
  );
}

function LesenTeil2({ exercise, answers, onSelection }: PartRendererProps) {
  return (
      <ContentFrame>
        <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-black bg-white p-6 lg:p-8">
            <p className="eyebrow">Lesetext</p>
            <div className="mt-5">
              <SharedContent content={exercise.content} />
            </div>
          </section>
          <section className="space-y-4 rounded-2xl border border-black bg-white p-5 lg:p-6">
            <p className="eyebrow">Fragen und Antworten</p>
            {exercise.questions.map((question) => (
                <article key={question.id} className="border-t border-black pt-5 first:border-t-0 first:pt-0">
                  <p className="mb-4 text-sm font-bold leading-6">{question.number}. {question.prompt}</p>
                  <RadioAnswers
                      name={`question-${question.number}`}
                      value={answers[question.number]?.selectedOptionKeys[0]}
                      options={question.options}
                      onChange={(key) => onSelection(question.number, key)}
                  />
                </article>
            ))}
          </section>
        </div>
      </ContentFrame>
  );
}

function LesenTeil3({
                      exercise,
                      answers,
                      onSelection
                    }: PartRendererProps) {
  const contentParts = useMemo(() => {
    if (!exercise.content?.trim()) {
      return [];
    }

    return exercise.content
        .trim()
        .split(/\n+(?=\s*[a-z]\)\s)/i)
        .map((part) => part.trim())
        .filter(Boolean);
  }, [exercise.content]);

  const usedOptionKeys = useMemo(
      () =>
          new Set(
              exercise.questions
                  .map(
                      (question) =>
                          answers[question.number]?.selectedOptionKeys[0]
                  )
                  .filter((key): key is string => Boolean(key))
          ),
      [answers, exercise.questions]
  );

  return (
      <ContentFrame>
        <div className="grid items-start gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="space-y-5 rounded-2xl border border-black bg-white p-5 lg:p-6">
            <p className="eyebrow">Situationen</p>

            {exercise.questions.map((question) => {
              const selectedKey =
                  answers[question.number]?.selectedOptionKeys[0] ?? "";

              return (
                  <article
                      key={question.id}
                      className="rounded-xl border border-black bg-white p-5"
                  >
                    <div
                        className={`rounded-xl border-2 border-black p-1 ${
                            selectedKey ? "bg-yellow-200" : "bg-white"
                        }`}
                    >
                      <select
                          id={`question-${question.number}`}
                          aria-label={`Antwort für Aufgabe ${question.number}`}
                          value={selectedKey}
                          onChange={(event) =>
                              onSelection(
                                  question.number,
                                  event.target.value
                              )
                          }
                          className={`w-full cursor-pointer rounded-lg border-0 px-4 text-sm font-black text-black outline-none ${
                              selectedKey
                                  ? "bg-yellow-200"
                                  : "bg-white"
                          }`}
                      >
                        <option value="" disabled>
                          Antwort auswählen
                        </option>

                        {question.options.map((option) => {
                          const usedByAnotherQuestion =
                              usedOptionKeys.has(option.key) &&
                              option.key !== selectedKey;

                          return (
                              <option
                                  key={option.key}
                                  value={option.key}
                                  disabled={usedByAnotherQuestion}
                                  className={
                                    usedByAnotherQuestion
                                        ? "bg-gray-100 text-gray-400"
                                        : "bg-white text-black"
                                  }
                              >
                                {option.key.toLowerCase()}){" "}
                                {option.text}
                                {usedByAnotherQuestion
                                    ? " — bereits verwendet"
                                    : ""}
                              </option>
                          );
                        })}
                      </select>
                    </div>

                    <p className="mt-5 whitespace-pre-wrap text-sm font-bold leading-7 text-black">
                      {question.stimulus || question.prompt}
                    </p>
                  </article>
              );
            })}
          </section>

          <section className="space-y-4 rounded-2xl border border-black bg-white p-5 lg:p-6">
            <p className="eyebrow">Anzeigen</p>

            {contentParts.map((contentPart, index) => (
                <article
                    key={`${index}-${contentPart.slice(0, 20)}`}
                    className="rounded-xl border border-black bg-white p-5"
                >
                  <p className="whitespace-pre-wrap text-sm leading-7 text-black">
                    {contentPart}
                  </p>
                </article>
            ))}
          </section>
        </div>
      </ContentFrame>
  );
}

function SprachbausteineTeil1({ exercise, answers, onSelection }: PartRendererProps) {
  const questions = useMemo(
      () => new Map(exercise.questions.map((question) => [question.number, question])),
      [exercise.questions]
  );
  const gapPattern =
      /(\{\{\s*\d+\s*\}\}|\[\s*\d+\s*\]|\(\s*(?:____\s*)?\d+\s*\))/g;

  const markerPattern =
      /^(?:\{\{\s*\d+\s*\}\}|\[\s*\d+\s*\]|\(\s*(?:____\s*)?\d+\s*\))$/;
  const parts = exercise.content?.split(gapPattern) ?? [];
  const hasMarkers = parts.some((part) => markerPattern.test(part));

  return (
      <ContentFrame>
        <div className="rounded-2xl border border-black bg-white p-6 sm:p-9">
          <p className="eyebrow">Text mit Lücken</p>
          {hasMarkers ? (
              <div className="mt-6 whitespace-pre-wrap text-base leading-[3.4rem] text-black/75">
                {parts.map((part, index) => {
                  const match = part.match(/\d+/);
                  if (!match) return <Fragment key={index}>{part}</Fragment>;
                  const question = questions.get(match[0]);
                  if (!question) return <Fragment key={index}>{part}</Fragment>;
                  return (
                      <select
                          key={`${question.number}-${index}`}
                          aria-label={`Lücke ${question.number}`}
                          value={answers[question.number]?.selectedOptionKeys[0] ?? ""}
                          onChange={(event) => onSelection(question.number, event.target.value)}
                          className={`mx-1 inline-block min-w-32 rounded-lg border border-black px-3 py-2 text-sm font-black ${answers[question.number]?.selectedOptionKeys[0] ? "bg-yellow-200" : "bg-white"}`}
                      >
                        <option value="" disabled>(____{question.number})</option>
                        {question.options.map((option) => (
                            <option key={option.key} value={option.key}>{option.key}: {option.text}</option>
                        ))}
                      </select>
                  );
                })}
              </div>
          ) : (
              <>
                <div className="mt-5"><SharedContent content={exercise.content} /></div>
                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {exercise.questions.map((question) => (
                      <AnswerSelect
                          key={question.id}
                          id={`question-${question.number}`}
                          label={`Lücke ${question.number}`}
                          value={answers[question.number]?.selectedOptionKeys[0]}
                          options={question.options}
                          onChange={(key) => onSelection(question.number, key)}
                      />
                  ))}
                </div>
              </>
          )}
        </div>
        {!hasMarkers && (
            <p className="mt-4 text-xs text-black/40">
              Für Dropdowns direkt im Text sollte der Inhalt Marker wie {"(____21)"}, {"(____22)"} oder {"{{21}}"} enthalten.
            </p>
        )}
      </ContentFrame>
  );
}

function SprachbausteineTeil2({ exercise, answers, onSelection }: PartRendererProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const wordBank = useMemo(() => {
    const unique = new Map<string, string>();
    exercise.questions.flatMap((question) => question.options).forEach((option) => unique.set(option.key, option.text));
    return Array.from(unique, ([key, text]) => ({ key, text }));
  }, [exercise.questions]);
  const used = new Set(exercise.questions.flatMap((question) => answers[question.number]?.selectedOptionKeys ?? []));

  const assign = (question: QuestionView, key: string) => {
    exercise.questions.forEach((other) => {
      if (other.number !== question.number && answers[other.number]?.selectedOptionKeys[0] === key) {
        onSelection(other.number, "");
      }
    });
    onSelection(question.number, key);
    setActiveKey(null);
  };

  const onDrop = (event: DragEvent<HTMLSpanElement>, question: QuestionView) => {
    event.preventDefault();
    const key = event.dataTransfer.getData("text/plain");
    if (key) assign(question, key);
  };

  const gapPattern =
      /(\{\{\s*\d+\s*\}\}|\[\s*\d+\s*\]|\(\s*(?:____\s*)?\d+\s*\))/g;

  const markerPattern =
      /^(?:\{\{\s*\d+\s*\}\}|\[\s*\d+\s*\]|\(\s*(?:____\s*)?\d+\s*\))$/;
  const parts = exercise.content?.split(gapPattern) ?? [];
  const questions = new Map(exercise.questions.map((question) => [question.number, question]));

  return (
      <ContentFrame>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-black bg-white p-6 sm:p-8">
            <p className="eyebrow">Text und Lücken</p>
            <div className="mt-6 whitespace-pre-wrap text-base leading-[3.5rem] text-black/75">
              {parts.map((part, index) => {
                if (!markerPattern.test(part)) return <Fragment key={index}>{part}</Fragment>;
                const number = part.match(/\d+/)?.[0];
                const question = number ? questions.get(number) : undefined;
                if (!question) return <Fragment key={index}>{part}</Fragment>;
                const selectedKey = answers[question.number]?.selectedOptionKeys[0];
                const selected = wordBank.find((option) => option.key === selectedKey);
                return (
                    <span
                        key={`${question.number}-${index}`}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => onDrop(event, question)}
                        onClick={() => activeKey && assign(question, activeKey)}
                        className={`mx-1 inline-flex min-h-10 min-w-32 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-black px-3 py-1 align-middle text-sm font-black leading-6 ${selected ? "bg-yellow-200" : "bg-white"}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`Lücke ${question.number}`}
                    >
                  <span>{selected ? selected.text : `(____${question.number})`}</span>
                      {selected && (
                          <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onSelection(question.number, "");
                              }}
                              className="grid h-6 w-6 place-items-center rounded-full bg-black text-white"
                              aria-label={`Antwort für Lücke ${question.number} entfernen`}
                          >
                            <X size={12} />
                          </button>
                      )}
                </span>
                );
              })}
            </div>
          </div>
          <aside className="rounded-2xl border border-black bg-white p-6 lg:self-start">
            <p className="eyebrow">Antworten</p>
            <p className="mt-2 text-xs leading-5 text-black/45">Ziehen Sie eine Antwort direkt in die passende Lücke oder wählen Sie sie aus und klicken Sie auf die Lücke.</p>
            <div className="mt-5 space-y-2">
              {wordBank.map((option) => {
                const unavailable = used.has(option.key);
                const active = activeKey === option.key;
                return (
                    <button
                        type="button"
                        key={option.key}
                        draggable={!unavailable}
                        disabled={unavailable}
                        onDragStart={(event) => event.dataTransfer.setData("text/plain", option.key)}
                        onClick={() => setActiveKey(active ? null : option.key)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-bold transition ${
                            active ? "border-black bg-yellow-200 text-black" : "border-black bg-white text-black"
                        } disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-600`}
                    >
                      {option.text.toUpperCase()}
                    </button>
                );
              })}
            </div>
          </aside>
        </div>
      </ContentFrame>
  );
}

function Hoerverstehen({ exercise, answers, onSelection }: PartRendererProps) {
  return (
      <ContentFrame>
        <div className="divide-y divide-black overflow-hidden rounded-2xl border border-black">
          {exercise.questions.map((question) => (
              <article key={question.id} className="grid gap-5 bg-white p-5 sm:grid-cols-[auto_1fr] sm:items-center sm:p-6">
                <TrueFalseAnswers
                    name={`question-${question.number}`}
                    value={answers[question.number]?.selectedOptionKeys[0]}
                    options={question.options}
                    onChange={(key) => onSelection(question.number, key)}
                />
                <p className="text-sm font-bold leading-6">{question.number}. {question.prompt}</p>
              </article>
          ))}
        </div>
      </ContentFrame>
  );
}

function Schreiben({ exercise, answers, onText }: PartRendererProps) {
  const question = exercise.questions[0];
  const value = answers[question.number]?.text ?? "";
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const specialCharacters = ["ä", "ö", "ü", "Ä", "Ö", "Ü", "ß"];

  const insertCharacter = (character: string) => {
    const editor = editorRef.current;
    const start = editor?.selectionStart ?? value.length;
    const end = editor?.selectionEnd ?? value.length;
    const nextValue = `${value.slice(0, start)}${character}${value.slice(end)}`;
    onText(question.number, nextValue);
    window.setTimeout(() => {
      editor?.focus();
      editor?.setSelectionRange(start + character.length, start + character.length);
    }, 0);
  };

  return (
      <ContentFrame>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-black bg-white p-6 text-black sm:p-8">
            <p className="eyebrow">Aufgabe {question.number}</p>
            {exercise.content && <p className="mt-5 whitespace-pre-wrap text-sm leading-8 text-black/70">{exercise.content}</p>}
            {question.stimulus && <p className="mt-5 whitespace-pre-wrap text-sm leading-8 text-black/70">{question.stimulus}</p>}
            <div className="mt-6 border-t border-black pt-6">
              <p className="whitespace-pre-wrap text-sm font-bold leading-7">{question.prompt}</p>
            </div>
          </div>
          <div className="flex min-h-[34rem] flex-col rounded-2xl border border-black bg-white p-5 sm:p-7">
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="eyebrow">Ihre Antwort</span>
              <span className="rounded-full border border-black px-3 py-1 text-xs font-black text-black">
              {words} Wörter
            </span>
            </div>
            <textarea
                ref={editorRef}
                value={value}
                onChange={(event) => onText(question.number, event.target.value)}
                placeholder="Schreiben Sie hier Ihre E-Mail …"
                spellCheck="true"
                className="min-h-0 flex-1 resize-none rounded-xl border border-black bg-white p-5 text-base leading-8 outline-none transition placeholder:text-black/25"
            />
            <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Deutsche Sonderzeichen">
              {specialCharacters.map((character) => (
                  <button
                      key={character}
                      type="button"
                      onClick={() => insertCharacter(character)}
                      className="grid h-10 min-w-10 place-items-center rounded-lg bg-black px-3 text-sm font-black text-white"
                  >
                    {character}
                  </button>
              ))}
            </div>
          </div>
        </div>
      </ContentFrame>
  );
}

function GenericPart({ exercise, answers, onSelection }: PartRendererProps) {
  return (
      <ContentFrame>
        {exercise.content && <div className="mb-7 rounded-2xl border border-black bg-white p-6"><SharedContent content={exercise.content} /></div>}
        <div className="space-y-5">
          {exercise.questions.map((question) => (
              <article key={question.id} className="rounded-2xl border border-black p-5">
                <div className="flex gap-4">
                  <QuestionNumber value={question.number} />
                  <div className="flex-1">
                    <p className="mb-4 font-bold">{question.prompt}</p>
                    <RadioAnswers
                        name={`question-${question.number}`}
                        value={answers[question.number]?.selectedOptionKeys[0]}
                        options={question.options}
                        onChange={(key) => onSelection(question.number, key)}
                    />
                  </div>
                </div>
              </article>
          ))}
        </div>
      </ContentFrame>
  );
}

export function PartRenderer(props: PartRendererProps) {
  switch (props.exercise.partKey) {
    case "LESEN_1":
      return <LesenTeil1 {...props} />;
    case "LESEN_2":
      return <LesenTeil2 {...props} />;
    case "LESEN_3":
      return <LesenTeil3 {...props} />;
    case "SPRACHE_1":
      return <SprachbausteineTeil1 {...props} />;
    case "SPRACHE_2":
      return <SprachbausteineTeil2 {...props} />;
    case "HOEREN_1":
    case "HOEREN_2":
    case "HOEREN_3":
      return <Hoerverstehen {...props} />;
    case "SCHREIBEN_EMAIL":
      return <Schreiben {...props} />;
    default:
      return <GenericPart {...props} />;
  }
}

