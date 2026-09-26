import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import type { ExamResultView, ExamSessionView, QuestionType } from "../../../store/models/user/exam/exam.ts";

export function ResultPage(props: {
    session: ExamSessionView;
    result: ExamResultView;
    onRestart: () => void;
}) {
    const { session, result, onRestart } = props;
    const questionTypes = new Map<string, QuestionType>();
    session.exercises.forEach((exercise) =>
        exercise.questions.forEach((question) => questionTypes.set(question.number, question.type))
    );

    return (
        <main className="min-h-screen bg-white text-black">
            <section className="border-b border-black bg-white px-5 py-12 text-black sm:px-10 sm:py-16">
                <div className="mx-auto max-w-6xl">
                    <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-full border border-black bg-white font-black text-black">E</span>
                        <span className="text-sm font-black uppercase tracking-[0.18em]">EasyPrüfung</span>
                    </div>
                    <div className="mt-14 grid items-end gap-10 lg:grid-cols-[1fr_auto]">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.25em] text-black/50">Prüfung abgeschlossen</p>
                            <h1 className="mt-4 max-w-3xl font-display text-5xl leading-none tracking-[-0.055em] sm:text-7xl">
                                {result.passed ? "Bestanden." : "Weiter üben."}
                            </h1>
                            <p className="mt-5 text-black/50">{session.title}</p>
                        </div>
                        <div className="flex items-end gap-3">
              <span className="text-7xl font-black tracking-[-0.08em] text-black sm:text-8xl">
                {Math.round(result.percentage)}
              </span>
                            <span className="pb-2 text-2xl font-black text-black/35">%</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-7 sm:py-12">
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {result.sections.map((section) => {
                        const percentage = section.maximumScore ? (section.score / section.maximumScore) * 100 : 0;
                        return (
                            <article key={section.sectionKey} className="frame p-5">
                                <p className="eyebrow">{section.title}</p>
                                <p className="mt-5 text-3xl font-black">{section.score}<span className="text-base text-black/35"> / {section.maximumScore}</span></p>
                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/10">
                                    <div className="h-full bg-black" style={{ width: `${percentage}%` }} />
                                </div>
                            </article>
                        );
                    })}
                </section>

                {result.overallFeedback && (
                    <section className="frame mt-6 p-6 sm:p-8">
                        <p className="eyebrow">Feedback zum Schreiben</p>
                        <p className="mt-4 whitespace-pre-wrap leading-8 text-black/65">{result.overallFeedback}</p>
                    </section>
                )}

                <section className="frame mt-6 overflow-hidden">
                    <div className="border-b border-black/10 p-6 sm:p-8">
                        <p className="eyebrow">Aufgabenübersicht</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight">Ergebnisse im Detail</h2>
                    </div>
                    <div className="divide-y divide-black/10">
                        {result.questions.map((question) => {
                            const written = questionTypes.get(question.number) === "FREE_TEXT";
                            return (
                                <article key={question.number} className="grid gap-4 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-start sm:p-6">
                  <span className={`grid h-10 w-10 place-items-center rounded-full ${
                      written || question.correct ? "border border-black bg-white" : "border border-black bg-white text-black"
                  }`}>
                    {written ? <ArrowRight size={17} /> : question.correct ? <Check size={17} /> : <X size={17} />}
                  </span>
                                    <div>
                                        <p className="text-sm font-black">Aufgabe {question.number}</p>
                                        {question.explanation && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-black/55">{question.explanation}</p>}
                                    </div>
                                    <p className="text-lg font-black">{question.score} / {question.maximumScore}</p>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <button
                    type="button"
                    onClick={onRestart}
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-7 py-4 text-sm font-black text-white transition hover:-translate-y-0.5"
                >
                    <RotateCcw size={17} /> Neue Prüfung
                </button>
            </div>
        </main>
    );
}
