import ExamLanguageLock from "./ExamLanguageLock";
import { useTranslation } from "react-i18next";
import { AlertCircle, RotateCcw } from "lucide-react";
import {Dispatch, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
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
import {requestGetUser} from "../../../api/user/api-helper.ts";
import {updateUser} from "../../../store/actions/user/userAccount.actions.ts";

type Screen = "start" | "loading" | "exam" | "result" | "error";

const FAST_PREPARATION_DURATION_MS = 10 * 1000;
const NORMAL_PREPARATION_DURATION_MS = 90 * 1000;

export default function MainExamPage() {
    const { t } = useTranslation();
    const dispatch: Dispatch<any> = useDispatch();
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
    const [preparationStartedAt, setPreparationStartedAt] = useState<number | undefined>();
    const [preparationDurationMs, setPreparationDurationMs] = useState(NORMAL_PREPARATION_DURATION_MS);
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

    useEffect(() => {
        if (screen !== "result") {
            return;
        }

        const ownerId = sessionUserId ?? currentUserId;

        if (ownerId) {
            clearActiveExam(ownerId);
        }

        if (session) {
            clearExamProgress(session.sessionId);
        }
    }, [
        screen,
        session,
        sessionUserId,
        currentUserId
    ]);

    // Invalidate pending work when the account changes or this page unmounts.
    const preparationRun = useRef(0);
    const preparationDelay = useRef<{
        timer: number;
        resolve: () => void;
    } | null>(null);

    useEffect(() => {
        return () => {
            preparationRun.current += 1;
            const pending = preparationDelay.current;
            preparationDelay.current = null;
            if (pending) {
                window.clearTimeout(pending.timer);
                pending.resolve();
            }
        };
    }, [currentUserId]);

    const start = async (request: StartExamRequest) => {
        const run = ++preparationRun.current;
        const previousDelay = preparationDelay.current;
        preparationDelay.current = null;
        if (previousDelay) {
            window.clearTimeout(previousDelay.timer);
            previousDelay.resolve();
        }
        const startedAt = performance.now();
        setPreparationStartedAt(startedAt);
        setPreparationDurationMs(NORMAL_PREPARATION_DURATION_MS);
        setScreen("loading");
        setError(null);
        try {
            const created = await startExamSession(request);
            if (run !== preparationRun.current) return;

            const responseTime = performance.now() - startedAt;
            // A quick response shortens the TOTAL preparation to 10 seconds.
            // A later response keeps the TOTAL preparation at 90 seconds.
            const duration = responseTime <= FAST_PREPARATION_DURATION_MS
                ? FAST_PREPARATION_DURATION_MS
                : NORMAL_PREPARATION_DURATION_MS;
            setPreparationDurationMs(duration);
            const remaining = Math.max(0, duration - (performance.now() - startedAt));
            if (remaining > 0) {
                await new Promise<void>((resolve) => {
                    const timer = window.setTimeout(() => {
                        preparationDelay.current = null;
                        resolve();
                    }, remaining);
                    preparationDelay.current = { timer, resolve };
                });
            }
            if (run !== preparationRun.current) return;

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
            if (run !== preparationRun.current) return;
            setError(cause instanceof Error ? cause.message : "Die Prüfung konnte nicht erstellt werden.");
            setScreen("error");
        }
    };

    const submit = async (request: SubmitExamRequest) => {
        if (!session) return;
        try {
            const evaluated = await submitExamSession(session.sessionId, request);
            const user = await requestGetUser(dispatch);
            if (user !== null && user !== undefined) {
                dispatch(updateUser(user));
            }
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
        return <LoadingScreen
            message={t("examPreparation.loadingMessage")}
            durationMs={preparationDurationMs}
            startedAt={preparationStartedAt}
        />;
    }
    if (screen === "exam" && session) {
        return <ExamLanguageLock><ExamRunnerPage session={session} onSubmit={submit} /></ExamLanguageLock>;
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
