import ExamUpgradeOffer from "../Pricing/ExamUpgradeOffer";
import { ExamCertificateButton } from "./ExamCertificateButton";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ExamOutcome } from "./components/ExamOutcome";
import { useTranslation } from "react-i18next";
import ExamLanguageLock from "./ExamLanguageLock";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Check,
    Eye,
    LoaderCircle,
    Lock
} from "lucide-react";
import { useEffect, useState } from "react";
import type { PassedExamEntry } from "./models/exam.ts";
import { getPassedUserExams } from "../../../api/exam/api-helper.ts";
import { ExamReviewPage } from "./ExamReviewPage.tsx";
import type { IUserAccount } from "../../../store/models/user/userAccount.interface.ts";
import { useSelector } from "react-redux";
import type { IStateType } from "../../../store/models/root.interface.ts";

function formatScore(value: number): string {
    return Number(value).toLocaleString("de-DE", {
        maximumFractionDigits: 2
    });
}

function formatDate(value: string, language: string = "de"): string {
    return new Date(value).toLocaleDateString(language, {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function ExamResultDetails({
                               entry,
                               onBack,
                               onShowDetails,
                               hasPremiumAccess
                           }: {
    entry: PassedExamEntry;
    onBack: () => void;
    onShowDetails: () => void;
    hasPremiumAccess: boolean;
}) {
    const { i18n } = useTranslation();
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

                {/* Basic result stays visible */}
                <section className="mt-8 rounded-[2rem] border border-black bg-white p-6 sm:p-10">
                    <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
                        <div>
                            <ExamOutcome passed={result.passed} />

                            <p className="mt-4 text-lg font-medium text-black/65 sm:text-xl">
                                {session.title}
                            </p>

                            {result.passed && <ExamCertificateButton session={session} result={result} />}

                            <div className="mt-5 flex flex-wrap gap-3 text-sm font-black">
                                <span className="rounded-full border border-black px-4 py-2">
                                    {session.provider}
                                </span>

                                <span className="rounded-full border border-black px-4 py-2">
                                    {session.level}
                                </span>

                                <span className="rounded-full border border-black px-4 py-2">
                                    {formatDate(result.evaluatedAt, i18n.resolvedLanguage || i18n.language)}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-end gap-8 border-t border-black/10 pt-6 lg:border-t-0 lg:border-s lg:ps-8 lg:pt-0">
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

                {/* Premium detail area */}
                <div className="mt-6">
                    {hasPremiumAccess && <div
                        className={
                            !hasPremiumAccess
                                ? "pointer-events-none select-none blur-[5px]"
                                : ""
                        }
                        aria-hidden={!hasPremiumAccess}
                    >
                        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                                                /{" "}
                                                {formatScore(
                                                    section.maximumScore
                                                )}
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
                                            {formatScore(
                                                question.maximumScore
                                            )}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>}

                    {!hasPremiumAccess && <ExamUpgradeOffer source="exam_history_result" />}
                </div>

                {hasPremiumAccess ? (
                    <button
                        type="button"
                        onClick={onShowDetails}
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-7 py-4 text-sm font-black text-white"
                    >
                        <Eye size={17} />
                        Alle Aufgaben ansehen
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => { window.location.href = "/pricing"; }}
                        className="mt-6 inline-flex items-center gap-2 rounded-full border border-black bg-white px-7 py-4 text-sm font-black text-black transition hover:bg-black hover:text-white"
                    >
                        <Lock size={17} />
                        Details freischalten
                    </button>
                )}
            </div>
        </main>
    );
}

export function PassedExamsPage() {
    const { t } = useTranslation();
    const account: IUserAccount = useSelector(
        (state: IStateType) => state.userAccount
    );

    const userId = account.user?.uuid || "";
    const subscription = account.user?.subscription;

    const currentPlan =
        subscription?.plan?.toLowerCase?.() || "free";

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

    const [exams, setExams] = useState<PassedExamEntry[]>([]);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const entry = exams.find(item => item.session.sessionId === searchParams.get("exam")) ?? null;
    const reviewExam = searchParams.get("view") === "review" ? entry : null;
    const selectedExam = reviewExam ? null : entry;
    const openExam = (exam: PassedExamEntry, view: "result" | "review") => {
        const query = new URLSearchParams({ exam: exam.session.sessionId, view });
        navigate(`/exams?${query}`, { state: { fromExamHistory: true } });
    };
    const backToHistory = () => {
        if (location.state?.fromExamHistory) navigate(-1);
        else navigate("/exams", { replace: true });
    };
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        let active = true;

        if (!userId) {
            setLoading(false);
            setError("Benutzerkonto konnte nicht geladen werden.");

            return () => {
                active = false;
            };
        }

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

    if (reviewExam && hasPremiumAccess) {
        return (
            <ExamLanguageLock><ExamReviewPage
                session={reviewExam.session}
                result={reviewExam.result}
                onBack={backToHistory}
            /></ExamLanguageLock>
        );
    }

    if (selectedExam) {
        return (
            <ExamResultDetails
                entry={selectedExam}
                onBack={backToHistory}
                onShowDetails={() => {
                    if (hasPremiumAccess) {
                        openExam(selectedExam, "review");
                    } else {
                        window.location.href = "/pricing";
                    }
                }}
                hasPremiumAccess={hasPremiumAccess}
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

                    <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <h1 className="font-display text-4xl leading-none tracking-[-0.04em] sm:text-6xl">
                            {t("examOutcome.historyTitle")}
                        </h1>

                        {!hasPremiumAccess && (
                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black px-4 py-2 text-xs font-black">
                                <Lock size={14} />
                                Detailansicht gesperrt
                            </div>
                        )}
                    </div>
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
                            {t("examOutcome.emptyTitle")}
                        </h2>

                        <p className="mt-3 text-black/55">
                            {t("examOutcome.emptyMessage")}
                        </p>
                    </div>
                )}

                {!loading && !error && exams.length > 0 && (
                    <>
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

                                        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                            <h2 className="text-xl font-black">{entry.session.title}</h2>
                            <p className="mt-2 text-xs font-semibold">{entry.session.format === "PAPER" ? "Papierbasiert" : "Digital"}</p>
                                            <ExamOutcome passed={entry.result.passed} compact />
                                        </div>

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
                                            {formatScore(
                                                entry.result.score
                                            )}{" "}
                                            /{" "}
                                            {formatScore(
                                                entry.result.maximumScore
                                            )}{" "}
                                            Punkte
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {hasPremiumAccess ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openExam(entry, "review")
                                                    }
                                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-black text-white"
                                                >
                                                    Prüfung ansehen
                                                    <Eye size={17} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openExam(entry, "result")
                                                    }
                                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-black text-white"
                                                >
                                                    Ergebnis öffnen
                                                    <ArrowRight size={17} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => { window.location.href = "/pricing"; }}
                                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-black text-white"
                                                >
                                                    Details freischalten
                                                    <Lock size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openExam(entry, "result")
                                                    }
                                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-black bg-white px-6 py-3 text-sm font-black text-black"
                                                >
                                                    Ergebnis öffnen
                                                    <ArrowRight size={17} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                        {!hasPremiumAccess && (
                            <div className="mt-8"><ExamUpgradeOffer source="exam_history" /></div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
