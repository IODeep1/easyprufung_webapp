import { Eye, RotateCcw } from "lucide-react";
import { useState } from "react";
import { ExamReviewPage } from "./ExamReviewPage.tsx";
import type {
    ExamResultView,
    ExamSessionView
} from "./models/exam.ts";

export function ResultPage(props: {
    session: ExamSessionView;
    result: ExamResultView;
    onRestart: () => void;
}) {
    const { session, result, onRestart } = props;
    const [showDetails, setShowDetails] = useState(false);

    if (showDetails) {
        return (
            <ExamReviewPage
                session={session}
                result={result}
                onBack={() => setShowDetails(false)}
            />
        );
    }

    return (
        <main className="min-h-screen bg-white text-black">
            <section className="border-b border-black bg-white px-5 py-12 text-black sm:px-10 sm:py-16">
                <div className="mx-auto max-w-6xl">
                    <div className="mt-14 grid items-end gap-10 lg:grid-cols-[1fr_auto]">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.25em] text-black/50">
                                Prüfung abgeschlossen
                            </p>

                            <h1 className="mt-4 max-w-3xl font-display text-5xl leading-none tracking-[-0.055em] sm:text-7xl">
                                {result.passed ? "Bestanden." : "Weiter üben."}
                            </h1>

                            <p className="mt-5 text-black/50">
                                {session.title}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-end gap-8 sm:gap-12">
                            <div>
                                <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-black/50">
                                    Punkte
                                </p>

                                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black tracking-[-0.06em] text-black sm:text-6xl">
                    {Number(result.score).toLocaleString("de-DE", {
                        maximumFractionDigits: 2
                    })}
                  </span>

                                    <span className="pb-1 text-xl font-black text-black/35">
                    /{" "}
                                        {Number(result.maximumScore).toLocaleString("de-DE", {
                                            maximumFractionDigits: 2
                                        })}
                  </span>
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-black/50">
                                    Ergebnis
                                </p>

                                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black tracking-[-0.08em] text-black sm:text-6xl">
                    {Math.round(result.percentage)}
                  </span>

                                    <span className="pb-2 text-2xl font-black text-black/35">
                    %
                  </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-7 sm:py-12">
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {result.sections.map((section) => {
                        const percentage = section.maximumScore
                            ? (section.score / section.maximumScore) * 100
                            : 0;

                        return (
                            <article
                                key={section.sectionKey}
                                className="frame p-5"
                            >
                                <p className="eyebrow">
                                    {section.title}
                                </p>

                                <p className="mt-5 text-3xl font-black">
                                    {section.score}

                                    <span className="text-base text-black/35">
                    {" "}
                                        / {section.maximumScore}
                  </span>
                                </p>

                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/10">
                                    <div
                                        className="h-full bg-black"
                                        style={{
                                            width: `${Math.min(Math.max(percentage, 0), 100)}%`
                                        }}
                                    />
                                </div>
                            </article>
                        );
                    })}
                </section>
                <section className="mt-6 grid gap-4 md:grid-cols-2">
                    <article className="frame flex flex-col p-6 sm:p-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black bg-white">
                            <Eye size={20} />
                        </div>

                        <h2 className="mt-6 text-2xl font-black tracking-tight">
                            Prüfung überprüfen
                        </h2>

                        <p className="mt-3 flex-1 text-sm leading-7 text-black/60">
                            Sehen Sie alle Aufgaben und Ihre abgegebenen Antworten noch
                            einmal im schreibgeschützten Prüfungsmodus. Falsche Antworten
                            werden markiert und mit einer Erklärung angezeigt.
                        </p>

                        <button
                            type="button"
                            onClick={() => setShowDetails(true)}
                            className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-black px-7 py-4 text-sm font-black text-white transition hover:-translate-y-0.5"
                        >
                            <Eye size={17} />
                            Details anzeigen
                        </button>
                    </article>

                    <article className="frame flex flex-col p-6 sm:p-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black bg-white">
                            <RotateCcw size={20} />
                        </div>

                        <h2 className="mt-6 text-2xl font-black tracking-tight">
                            Noch einmal üben
                        </h2>

                        <p className="mt-3 flex-1 text-sm leading-7 text-black/60">
                            Starten Sie eine neue Prüfung und trainieren Sie mit neuen
                            Aufgaben. So können Sie Ihre Kenntnisse weiter verbessern und
                            sich noch sicherer auf die echte Prüfung vorbereiten.
                        </p>

                        <button
                            type="button"
                            onClick={onRestart}
                            className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-black px-7 py-4 text-sm font-black text-white transition hover:-translate-y-0.5"
                        >
                            <RotateCcw size={17} />
                            Neue Prüfung
                        </button>
                    </article>
                </section>
            </div>
        </main>
    );
}