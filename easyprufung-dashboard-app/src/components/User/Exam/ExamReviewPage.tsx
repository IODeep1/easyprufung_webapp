import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AudioPlayer } from "./components/AudioPlayer.tsx";
import { PartInformation } from "./components/ExamChrome.tsx";
import { PartRenderer } from "./components/PartRenderer.tsx";
import type {
    AnswerMap,
    ExamResultView,
    ExamSessionView,
    QuestionResultView,
    QuestionView
} from "./models/exam.ts";

function formatAnswer(question: QuestionView | undefined, keys: string[]): string {
    if (keys.length === 0) return "Keine Antwort";

    return keys
        .map((key) => {
            const option = question?.options.find((item) => item.key === key);
            return option ? `${option.key}: ${option.text}` : key;
        })
        .join(", ");
}

function ExerciseExplanationFrame({
                                      exerciseQuestions,
                                      resultByNumber,
                                      overallFeedback
                                  }: {
    exerciseQuestions: QuestionView[];
    resultByNumber: ReadonlyMap<string, QuestionResultView>;
    overallFeedback: string | null;
}) {
    const wrongAnswers = exerciseQuestions
        .filter((question) => question.type !== "FREE_TEXT")
        .map((question) => ({
            question,
            result: resultByNumber.get(question.number)
        }))
        .filter(
            (item): item is { question: QuestionView; result: QuestionResultView } =>
                Boolean(item.result && !item.result.correct)
        );

    const writtenQuestion = exerciseQuestions.find(
        (question) => question.type === "FREE_TEXT"
    );
    const writtenResult = writtenQuestion
        ? resultByNumber.get(writtenQuestion.number)
        : undefined;

    return (
        <section className="mt-6 rounded-[1.75rem] border border-black bg-white p-5 sm:p-7 lg:p-9">
            <p className="eyebrow">Auswertung dieses Prüfungsteils</p>

            {wrongAnswers.length === 0 && !writtenQuestion && (
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-black bg-white p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-black">
                        <Check size={18} />
                    </span>
                    <p className="text-sm font-black">Alle Antworten in diesem Teil sind richtig.</p>
                </div>
            )}

            {wrongAnswers.length > 0 && (
                <div className="mt-5 space-y-4">
                    {wrongAnswers.map(({ question, result }) => (
                        <article
                            key={question.number}
                            className="rounded-xl border border-red-600 bg-red-50 p-5"
                        >
                            <div className="flex items-start gap-3">
                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-red-600 bg-white text-red-700">
                                    <X size={18} strokeWidth={3} />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-red-800">
                                        Aufgabe {question.number}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-black/70">
                                        <strong>Ihre Antwort:</strong>{" "}
                                        {formatAnswer(question, result.submittedAnswers)}
                                    </p>
                                    {result.correctAnswers.length > 0 && (
                                        <p className="mt-1 text-sm leading-6 text-black/70">
                                            <strong>Richtige Antwort:</strong>{" "}
                                            {formatAnswer(question, result.correctAnswers)}
                                        </p>
                                    )}
                                    <div className="mt-4 border-t border-red-200 pt-4">
                                        <p className="text-xs font-black uppercase tracking-widest text-red-800">
                                            Erklärung
                                        </p>
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-black/70">
                                            {result.explanation?.trim() ||
                                                "Für diese Antwort ist keine zusätzliche Erklärung gespeichert."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {writtenQuestion && (
                <article className="mt-5 rounded-xl border border-black bg-white p-5">
                    <p className="text-sm font-black">Feedback zum schriftlichen Ausdruck</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-black/70">
                        {writtenResult?.explanation?.trim() ||
                            overallFeedback?.trim() ||
                            "Für den schriftlichen Ausdruck ist kein zusätzliches Feedback gespeichert."}
                    </p>
                    {writtenResult && (
                        <p className="mt-4 text-sm font-black">
                            {writtenResult.score} / {writtenResult.maximumScore} Punkte
                        </p>
                    )}
                </article>
            )}
        </section>
    );
}

export function ExamReviewPage({
                                   session,
                                   result,
                                   onBack
                               }: {
    session: ExamSessionView;
    result: ExamResultView;
    onBack: () => void;
}) {
    const [index, setIndex] = useState(0);
    const exercise = session.exercises[index];

    const resultByNumber = useMemo(
        () => new Map(result.questions.map((question) => [question.number, question])),
        [result.questions]
    );

    const questionsByNumber = useMemo(
        () =>
            new Map(
                session.exercises.flatMap((item) =>
                    item.questions.map((question) => [question.number, question] as const)
                )
            ),
        [session.exercises]
    );

    const answers = useMemo<AnswerMap>(() => {
        const restored: AnswerMap = {};

        result.questions.forEach((questionResult) => {
            const question = questionsByNumber.get(questionResult.number);
            const freeText = question?.type === "FREE_TEXT";

            restored[questionResult.number] = {
                selectedOptionKeys: freeText ? [] : questionResult.submittedAnswers,
                text: freeText ? questionResult.submittedAnswers.join("\n") : ""
            };
        });

        return restored;
    }, [questionsByNumber, result.questions]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [index]);

    if (!exercise) {
        return (
            <main className="grid min-h-screen place-items-center bg-white p-6 text-black">
                <div className="rounded-2xl border border-black bg-white p-8 text-center">
                    <p className="text-xl font-black">Keine Prüfungsaufgaben verfügbar.</p>
                    <button
                        type="button"
                        onClick={onBack}
                        className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-black text-white"
                    >
                        Zurück
                    </button>
                </div>
            </main>
        );
    }

    const last = index === session.exercises.length - 1;
    const audio = exercise.audioUrl ? (
        <AudioPlayer src={exercise.audioUrl} playLimit={exercise.audioPlayLimit} />
    ) : undefined;

    return (
        <div className="min-h-screen bg-white pb-10 text-black">
            <header className="sticky top-0 z-30 border-b border-black bg-white">
                <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-7 lg:px-10">
                    <button
                        type="button"
                        onClick={onBack}
                        className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-black text-white"
                    >
                        <ArrowLeft size={17} />
                        Zurück zum Ergebnis
                    </button>
                    <div className="text-right">
                        <p className="text-xs font-black uppercase tracking-widest text-black/45">
                            Schreibgeschützte Ansicht
                        </p>
                        <p className="mt-1 text-sm font-black">
                            Teil {index + 1} von {session.exercises.length}
                        </p>
                    </div>
                </div>
                <div className="h-1 bg-black/10">
                    <div
                        className="h-full bg-black transition-all duration-300"
                        style={{ width: `${((index + 1) / session.exercises.length) * 100}%` }}
                    />
                </div>
            </header>

            <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
                <PartInformation
                    exercise={exercise}
                    index={index}
                    total={session.exercises.length}
                    extra={audio}
                />

                <div className="mt-6">
                    <PartRenderer
                        exercise={exercise}
                        answers={answers}
                        onSelection={() => undefined}
                        onText={() => undefined}
                        readOnly
                        reviewResults={resultByNumber}
                    />
                </div>

                <ExerciseExplanationFrame
                    exerciseQuestions={exercise.questions}
                    resultByNumber={resultByNumber}
                    overallFeedback={result.overallFeedback}
                />

                <footer className="mt-6 flex flex-col-reverse justify-between gap-4 border-t border-black/10 pt-6 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => setIndex((value) => Math.max(0, value - 1))}
                        disabled={index === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
                    >
                        <ArrowLeft size={17} />
                        Return
                    </button>

                    <button
                        type="button"
                        onClick={last ? onBack : () => setIndex((value) => value + 1)}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-7 py-3 text-sm font-black text-white"
                    >
                        {last ? "Zurück zum Ergebnis" : "Next"}
                        <ArrowRight size={17} />
                    </button>
                </footer>
            </main>
        </div>
    );
}
