import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Check,
    LoaderCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import {PassedExamEntry} from "./models/exam.ts";
import {getPassedUserExams} from "../../../api/exam/api-helper.ts";


function formatScore(value: number): string {
    return Number(value).toLocaleString("de-DE", {
        maximumFractionDigits: 2
    });
}

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function ExamResultDetails({
                               entry,
                               onBack
                           }: {
    entry: PassedExamEntry;
    onBack: () => void;
}) {
    const { session, result } = entry;

    return (
        <main className="min-h-screen bg-white px-4 py-8 text-black sm:px-8">
            <div className="mx-auto max-w-6xl">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-black text-white"
                >
                    <ArrowLeft size={17} />
                    Zurück zu meinen Prüfungen
                </button>

                <section className="mt-8 rounded-[2rem] border border-black bg-white p-6 sm:p-10">
                    <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-black/50">
                                Bestandene Prüfung
                            </p>

                            <h1 className="mt-3 font-display text-4xl leading-none tracking-[-0.04em] sm:text-6xl">
                                {session.title}
                            </h1>

                            <div className="mt-5 flex flex-wrap gap-3 text-sm font-black">
                <span className="rounded-full border border-black px-4 py-2">
                  {session.provider}
                </span>

                                <span className="rounded-full border border-black px-4 py-2">
                  {session.level}
                </span>

                                <span className="rounded-full border border-black px-4 py-2">
                  {formatDate(result.evaluatedAt)}
                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-end gap-8">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-black/50">
                                    Punkte
                                </p>

                                <p className="mt-2 text-4xl font-black">
                                    {formatScore(result.score)}
                                    <span className="text-lg text-black/40">
                    {" "}
                                        / {formatScore(result.maximumScore)}
                  </span>
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-black/50">
                                    Ergebnis
                                </p>

                                <p className="mt-2 text-6xl font-black">
                                    {Math.round(result.percentage)}
                                    <span className="text-2xl text-black/40">
                    %
                  </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {result.sections.map((section) => {
                        const percentage =
                            section.maximumScore > 0
                                ? (section.score /
                                    section.maximumScore) *
                                100
                                : 0;

                        return (
                            <article
                                key={section.sectionKey}
                                className="rounded-2xl border border-black bg-white p-5"
                            >
                                <p className="text-xs font-black uppercase tracking-widest text-black/50">
                                    {section.title}
                                </p>

                                <p className="mt-4 text-3xl font-black">
                                    {formatScore(section.score)}
                                    <span className="text-base text-black/40">
                    {" "}
                                        / {formatScore(section.maximumScore)}
                  </span>
                                </p>

                                <div className="mt-4 h-2 overflow-hidden rounded-full border border-black bg-white">
                                    <div
                                        className="h-full bg-black"
                                        style={{
                                            width: `${Math.min(
                                                100,
                                                percentage
                                            )}%`
                                        }}
                                    />
                                </div>
                            </article>
                        );
                    })}
                </section>

                {result.overallFeedback && (
                    <section className="mt-6 rounded-2xl border border-black bg-white p-6 sm:p-8">
                        <p className="text-xs font-black uppercase tracking-widest text-black/50">
                            Gesamtfeedback
                        </p>

                        <p className="mt-4 whitespace-pre-wrap leading-8 text-black/70">
                            {result.overallFeedback}
                        </p>
                    </section>
                )}

                <section className="mt-6 overflow-hidden rounded-2xl border border-black bg-white">
                    <div className="border-b border-black p-6 sm:p-8">
                        <p className="text-xs font-black uppercase tracking-widest text-black/50">
                            Aufgabenübersicht
                        </p>

                        <h2 className="mt-2 text-2xl font-black">
                            Ergebnisse im Detail
                        </h2>
                    </div>

                    <div className="divide-y divide-black">
                        {result.questions.map((question) => (
                            <article
                                key={question.number}
                                className="grid gap-4 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-start sm:p-6"
                            >
                <span className="grid h-10 w-10 place-items-center rounded-full border border-black bg-white">
                  {question.correct ? (
                      <Check size={18} />
                  ) : (
                      question.number
                  )}
                </span>

                                <div>
                                    <p className="text-sm font-black">
                                        Aufgabe {question.number}
                                    </p>

                                    {question.submittedAnswers.length >
                                        0 && (
                                            <p className="mt-2 text-sm text-black/60">
                                                Ihre Antwort:{" "}
                                                {question.submittedAnswers.join(
                                                    ", "
                                                )}
                                            </p>
                                        )}

                                    {question.explanation && (
                                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-black/60">
                                            {question.explanation}
                                        </p>
                                    )}
                                </div>

                                <p className="text-lg font-black">
                                    {formatScore(question.score)} /{" "}
                                    {formatScore(question.maximumScore)}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}

export function PassedExamsPage() {
    const userId = "user-12223";
    const [exams, setExams] = useState<
        PassedExamEntry[]
    >([]);
    const [selectedExam, setSelectedExam] =
        useState<PassedExamEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(
        null
    );

    useEffect(() => {
        let active = true;

        setLoading(true);
        setError(null);

        getPassedUserExams(userId)
            .then((entries) => {
                if (active) {
                    setExams(entries);
                }
            })
            .catch((cause) => {
                if (active) {
                    setError(
                        cause instanceof Error
                            ? cause.message
                            : "Die Prüfungen konnten nicht geladen werden."
                    );
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [userId]);

    if (selectedExam) {
        return (
            <ExamResultDetails
                entry={selectedExam}
                onBack={() => setSelectedExam(null)}
            />
        );
    }

    return (
        <main className="min-h-screen bg-white px-4 py-8 text-black sm:px-8">
            <div className="mx-auto max-w-6xl">
                <header className="mt-10 border-b border-black pb-8">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-black/50">
                        Mein Prüfungsverlauf
                    </p>

                    <h1 className="mt-3 font-display text-4xl leading-none tracking-[-0.04em] sm:text-6xl">
                        Bestandene Prüfungen
                    </h1>

                    <p className="mt-4 text-black/55">
                        Benutzer: {userId}
                    </p>
                </header>

                {loading && (
                    <div className="mt-8 flex items-center gap-3 rounded-2xl border border-black bg-white p-6">
                        <LoaderCircle
                            className="animate-spin"
                            size={22}
                        />

                        <p className="font-black">
                            Prüfungen werden geladen …
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mt-8 flex items-start gap-3 rounded-2xl border border-black bg-white p-6">
                        <AlertCircle
                            size={22}
                            className="shrink-0"
                        />

                        <p className="font-bold">{error}</p>
                    </div>
                )}

                {!loading && !error && exams.length === 0 && (
                    <div className="mt-8 rounded-2xl border border-black bg-white p-8 text-center">
                        <h2 className="text-2xl font-black">
                            Noch keine bestandenen Prüfungen
                        </h2>

                        <p className="mt-3 text-black/55">
                            Sobald Sie eine Prüfung bestanden haben,
                            wird sie hier angezeigt.
                        </p>
                    </div>
                )}

                {!loading && !error && exams.length > 0 && (
                    <div className="mt-8 space-y-4">
                        {exams.map((entry) => (
                            <article
                                key={entry.session.sessionId}
                                className="grid items-center gap-6 rounded-2xl border border-black bg-white p-5 sm:grid-cols-[1fr_auto_auto] sm:p-6"
                            >
                                <div>
                                    <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-black px-3 py-1 text-xs font-black">
                      {entry.session.provider}
                    </span>

                                        <span className="rounded-full border border-black px-3 py-1 text-xs font-black">
                      {entry.session.level}
                    </span>
                                    </div>

                                    <h2 className="mt-4 text-xl font-black">
                                        {entry.session.title}
                                    </h2>

                                    <p className="mt-2 text-sm text-black/50">
                                        {formatDate(
                                            entry.result.evaluatedAt
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-black/50">
                                        Ergebnis
                                    </p>

                                    <p className="mt-1 text-3xl font-black">
                                        {Math.round(
                                            entry.result.percentage
                                        )}
                                        %
                                    </p>

                                    <p className="mt-1 text-xs font-bold text-black/50">
                                        {formatScore(entry.result.score)} /{" "}
                                        {formatScore(
                                            entry.result.maximumScore
                                        )}{" "}
                                        Punkte
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedExam(entry)
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-black text-white"
                                >
                                    Ergebnis öffnen
                                    <ArrowRight size={17} />
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}