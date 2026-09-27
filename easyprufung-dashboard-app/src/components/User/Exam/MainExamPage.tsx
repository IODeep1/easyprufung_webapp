import { AlertCircle, RotateCcw } from "lucide-react";
import { useState } from "react";
import { startExamSession, submitExamSession } from "../../../api/exam/api-helper";
import { LoadingScreen } from "./components/ExamChrome";
import { ExamRunnerPage } from "./ExamRunnerPage";
import { ResultPage } from "./ResultPage";
import { StartPage } from "./StartPage";
import type { ExamResultView, ExamSessionView, StartExamRequest, SubmitExamRequest } from "./models/exam.ts";

type Screen = "start" | "loading" | "exam" | "result" | "error";

export default function MainExamPage() {
    const [screen, setScreen] = useState<Screen>("start");
    const [session, setSession] = useState<ExamSessionView | null>(null);
    const [result, setResult] = useState<ExamResultView | null>(null);
    const [error, setError] = useState<string | null>(null);

    const start = async (request: StartExamRequest) => {
        setScreen("loading");
        setError(null);
        try {
            const created = await startExamSession(request);
            setSession(created);
            setScreen("exam");
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Die Prüfung konnte nicht erstellt werden.");
            setScreen("error");
        }
    };

    const submit = async (request: SubmitExamRequest) => {
        if (!session) return;
        try {
            const evaluated = await submitExamSession(session.sessionId, request);
            setResult(evaluated);
            setScreen("result");
        } catch (cause) {
            throw cause;
        }
    };

    const reset = () => {
        setSession(null);
        setResult(null);
        setError(null);
        setScreen("start");
    };

    if (screen === "loading") {
        return <LoadingScreen message="Die KI erstellt die Lese-, Sprach- und Schreibaufgaben. Ihre Hörtexte werden geladen." />;
    }
    if (screen === "exam" && session) {
        return <ExamRunnerPage session={session} onSubmit={submit} />;
    }
    if (screen === "result" && session && result) {
        return <ResultPage session={session} result={result} onRestart={reset} />;
    }
    if (screen === "error") {
        return (
            <main className="grid min-h-screen place-items-center bg-white p-6 text-black">
                <div className="w-full max-w-lg rounded-[2rem] border border-black bg-white p-8 text-center">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-black bg-white text-black"><AlertCircle /></span>
                    <h1 className="mt-6 text-3xl font-black">Sitzung nicht verfügbar</h1>
                    <p className="mt-3 leading-7 text-black/55">{error}</p>
                    <button type="button" onClick={reset} className="mt-7 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-black text-white">
                        <RotateCcw size={16} /> Erneut versuchen
                    </button>
                </div>
            </main>
        );
    }
    return <StartPage onStart={start} />;
}

