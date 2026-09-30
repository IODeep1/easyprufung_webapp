import { AlertCircle, ArrowLeft, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";
import {
    getExamResult,
    getExamSession
} from "../../../api/exam/api-helper.ts";
import type {
    ExamResultView,
    ExamSessionView
} from "./models/exam.ts";
import { ExamReviewPage } from "./ExamReviewPage.tsx";

interface PassedExamReviewLocationState {
    session?: ExamSessionView;
    result?: ExamResultView;
}

export function PassedExamReviewRoute() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const routeState =
        location.state as PassedExamReviewLocationState | null;

    const stateSession =
        routeState?.session?.sessionId === sessionId
            ? routeState.session
            : null;

    const stateResult =
        routeState?.result?.sessionId === sessionId &&
        routeState.result.passed
            ? routeState.result
            : null;

    const [session, setSession] =
        useState<ExamSessionView | null>(stateSession);

    const [result, setResult] =
        useState<ExamResultView | null>(stateResult);

    const [loading, setLoading] = useState(
        !stateSession || !stateResult
    );

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setError("Die Prüfungs-ID fehlt.");
            setLoading(false);
            return;
        }

        if (
            session?.sessionId === sessionId &&
            result?.sessionId === sessionId
        ) {
            setLoading(false);
            return;
        }

        let active = true;

        setLoading(true);
        setError(null);

        Promise.all([
            getExamSession(sessionId),
            getExamResult(sessionId)
        ])
            .then(([loadedSession, loadedResult]) => {

                if (!active) {
                    return;
                }

                setSession(loadedSession);
                setResult(loadedResult);
            })
            .catch((cause: unknown) => {
                if (!active) {
                    return;
                }

                setError(
                    cause instanceof Error
                        ? cause.message
                        : "Die Prüfung konnte nicht geladen werden."
                );
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [sessionId, session, result]);

    const handleBack = () => {
        navigate("/exams");
    };

    if (loading) {
        return (
            <main className="grid min-h-screen place-items-center bg-white p-6 text-black">
                <section className="w-full max-w-md rounded-2xl border border-black bg-white p-8 text-center">
                    <LoaderCircle
                        size={32}
                        className="mx-auto animate-spin"
                    />

                    <h1 className="mt-5 text-xl font-black">
                        Prüfung wird geladen
                    </h1>

                    <p className="mt-2 text-sm text-black/55">
                        Die Aufgaben und Ergebnisse werden vorbereitet.
                    </p>
                </section>
            </main>
        );
    }

    if (error || !session || !result) {
        return (
            <main className="grid min-h-screen place-items-center bg-white p-6 text-black">
                <section className="w-full max-w-lg rounded-2xl border border-black bg-white p-8 text-center">
                    <AlertCircle
                        size={34}
                        className="mx-auto"
                    />

                    <h1 className="mt-5 text-2xl font-black">
                        Prüfung konnte nicht geöffnet werden
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-black/60">
                        {error ??
                            "Für diese Prüfung sind keine vollständigen Daten verfügbar."}
                    </p>

                    <button
                        type="button"
                        onClick={handleBack}
                        className="mt-7 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-black text-white"
                    >
                        <ArrowLeft size={17} />
                        Zurück zu meinen Prüfungen
                    </button>
                </section>
            </main>
        );
    }

    return (
        <ExamReviewPage
            session={session}
            result={result}
            onBack={handleBack}
        />
    );
}