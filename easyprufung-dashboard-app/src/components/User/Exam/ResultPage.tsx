import { Eye, Lock, RotateCcw, Sparkles } from "lucide-react";
import {useEffect, useState} from "react";
import { useSelector } from "react-redux";
import { ExamReviewPage } from "./ExamReviewPage.tsx";
import type {
    ExamResultView,
    ExamSessionView
} from "./models/exam.ts";
import type { IUserAccount } from "../../../store/models/user/userAccount.interface.ts";
import type { IStateType } from "../../../store/models/root.interface.ts";
import { buildPaymentUrl } from "../Pricing/payment-links.ts";

export function ResultPage(props: {
    session: ExamSessionView;
    result: ExamResultView;
    onRestart: () => void;
}) {
    const { session, result, onRestart } = props;
    const [showDetails, setShowDetails] = useState(false);

    const account: IUserAccount = useSelector(
        (state: IStateType) => state.userAccount
    );

    const subscription = account.user.subscription;
    const currentPlan = subscription?.plan?.toLowerCase?.() || "free";

    const isTester = currentPlan === "tester";
    const isB1 = currentPlan === "b1";
    const isUnlimited = currentPlan === "b1_unlimited";

    const endDate = subscription?.endDate
        ? new Date(subscription.endDate)
        : null;

    const hasValidEndDate =
        !!endDate && !Number.isNaN(endDate.getTime());

    const isExpired =
        !isTester &&
        hasValidEndDate &&
        endDate!.getTime() <= Date.now();

    const hasPremiumAccess =
        isTester ||
        ((isB1 || isUnlimited) &&
            !isExpired &&
            subscription?.isActive !== false &&
            subscription?.status?.toLowerCase?.() !== "expired");

    const openCheckout = (plan: "b1" | "b1_unlimited") => {
        window.location.href = buildPaymentUrl(
            plan,
            account.user?.email,
            account.user?.uuid
        );
    };

    function scrollExamToTop(): void {
        const scrollContainer =
            document.getElementById("app-scroll-container");

        if (scrollContainer) {
            scrollContainer.scrollTop = 0;
        }

        window.scrollTo({
            top: 0,
            behavior: "auto"
        });
    }

    useEffect(() => {
        scrollExamToTop();
    }, []);

    if (showDetails && hasPremiumAccess) {
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

                        {/* Overall result stays visible for free users */}
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
                {/* Section breakdown */}
                <div className="relative">
                    <section
                        className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${
                            !hasPremiumAccess
                                ? "pointer-events-none select-none blur-[5px]"
                                : ""
                        }`}
                        aria-hidden={!hasPremiumAccess}
                    >
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
                                                width: `${Math.min(
                                                    Math.max(percentage, 0),
                                                    100
                                                )}%`
                                            }}
                                        />
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    {!hasPremiumAccess && (
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                            <div className="w-full max-w-xl rounded-[2rem] border border-black bg-white p-6 text-center shadow-2xl sm:p-8">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                                    <Lock size={20} />
                                </div>

                                <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-black/45">
                                    Detaillierte Auswertung
                                </p>

                                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                                    Sehen Sie, wo Sie Punkte verlieren.
                                </h2>

                                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/60">
                                    Schalten Sie die Ergebnisse der einzelnen
                                    Prüfungsteile, falsche Antworten und
                                    ausführliche Erklärungen frei.
                                </p>

                                <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs font-bold">
                                    <span className="rounded-full bg-black/5 px-3 py-2">
                                        60 Tage Zugang
                                    </span>
                                    <span className="rounded-full bg-black/5 px-3 py-2">
                                        Keine automatische Verlängerung
                                    </span>
                                </div>

                                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => openCheckout("b1")}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black bg-white px-5 py-4 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-black/5"
                                    >
                                        10 Prüfungen — €4.99
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openCheckout("b1_unlimited")}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-black/90"
                                    >
                                        <Sparkles size={17} />
                                        Unbegrenzt — €19.99
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <section className="mt-6 grid gap-4 md:grid-cols-2">
                    {/* Review */}
                    <article className="frame relative flex flex-col overflow-hidden p-6 sm:p-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black bg-white">
                            {hasPremiumAccess ? (
                                <Eye size={20} />
                            ) : (
                                <Lock size={20} />
                            )}
                        </div>

                        <h2 className="mt-6 text-2xl font-black tracking-tight">
                            Prüfung überprüfen
                        </h2>

                        <p className="mt-3 flex-1 text-sm leading-7 text-black/60">
                            Sehen Sie alle Aufgaben und Ihre abgegebenen Antworten
                            noch einmal im schreibgeschützten Prüfungsmodus. Falsche
                            Antworten werden markiert und mit einer Erklärung angezeigt.
                        </p>

                        {hasPremiumAccess ? (
                            <button
                                type="button"
                                onClick={() => setShowDetails(true)}
                                className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-black px-7 py-4 text-sm font-black text-white transition hover:-translate-y-0.5"
                            >
                                <Eye size={17} />
                                Details anzeigen
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => { window.location.href = "/pricing"; }}
                                className="mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-black bg-white px-7 py-4 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-black hover:text-white"
                            >
                                <Lock size={17} />
                                Details freischalten
                            </button>
                        )}
                    </article>

                    {/* Restart stays available; StartPage will enforce quota */}
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
