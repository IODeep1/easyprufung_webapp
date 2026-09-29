import { AlertCircle, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { startExamSession, submitExamSession } from "../../../api/exam/api-helper";
import type { IStateType } from "../../../store/models/root.interface.ts";
import type { IUserAccount } from "../../../store/models/user/userAccount.interface.ts";
import { LoadingScreen } from "./components/ExamChrome";
import {
    clearActiveExam,
    clearExamProgress,
    loadActiveExam,
    saveActiveExam
} from "./exam-storage.ts";
import { ExamRunnerPage } from "./ExamRunnerPage";
import { ResultPage } from "./ResultPage";
import { StartPage } from "./StartPage";
import type { ExamResultView, ExamSessionView, StartExamRequest, SubmitExamRequest } from "./models/exam.ts";

type Screen = "start" | "loading" | "exam" | "result" | "error";

export default function MainExamPage() {
    const account: IUserAccount = useSelector(
        (state: IStateType) => state.userAccount
    );
    const currentUserId = account.user?.uuid?.trim() ?? "";

    const [initialActiveExam] = useState(() =>
        currentUserId ? loadActiveExam(currentUserId) : null
    );

    const [screen, setScreen] = useState<Screen>(
        initialActiveExam?.screen ?? "start"
    );
    const [session, setSession] = useState<ExamSessionView | null>(
        initialActiveExam?.session ?? null
    );
    const [result, setResult] = useState<ExamResultView | null>(
        initialActiveExam?.result ?? null
    );
    const [error, setError] = useState<string | null>(null);
    const [sessionUserId, setSessionUserId] = useState<string | null>(
        initialActiveExam?.userId ?? null
    );
    const [restoredUserId, setRestoredUserId] = useState(
        currentUserId
    );

    useEffect(() => {
        if (currentUserId === restoredUserId) {
            return;
        }

        if (!currentUserId) {
            setScreen("start");
            setSession(null);
            setResult(null);
            setError(null);
            setSessionUserId(null);
            setRestoredUserId("");
            return;
        }

        const stored = loadActiveExam(currentUserId);

        setScreen(stored?.screen ?? "start");
        setSession(stored?.session ?? null);
        setResult(stored?.result ?? null);
        setError(null);
        setSessionUserId(stored?.userId ?? null);
        setRestoredUserId(currentUserId);
    }, [currentUserId, restoredUserId]);

    const start = async (request: StartExamRequest) => {
        setScreen("loading");
        setError(null);
        try {
            const created = await startExamSession(request);
            setSessionUserId(request.userId);
            setSession(created);
            setResult(null);

            saveActiveExam({
                userId: request.userId,
                screen: "exam",
                session: created,
                result: null
            });

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
            const ownerId = sessionUserId ?? currentUserId;

            setResult(evaluated);

            if (ownerId) {
                saveActiveExam({
                    userId: ownerId,
                    screen: "result",
                    session,
                    result: evaluated
                });
            }

            setScreen("result");
        } catch (cause) {
            throw cause;
        }
    };

    const reset = () => {
        const ownerId = sessionUserId ?? currentUserId;

        if (ownerId) {
            clearActiveExam(ownerId);
        }

        if (session) {
            clearExamProgress(session.sessionId);
        }

        setSession(null);
        setResult(null);
        setError(null);
        setSessionUserId(null);
        setScreen("start");
    };

    if (screen === "loading") {
        return <LoadingScreen message="Mehrere Prüfungsteile werden gleichzeitig erstellt und geprüft. Ihre vorbereiteten Hörtexte werden parallel geladen." />;
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
