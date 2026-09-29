import type {
    AnswerMap,
    ExamResultView,
    ExamSessionView
} from "./models/exam.ts";

const ACTIVE_EXAM_PREFIX = "easyprufung:active-exam:v1:";
const EXAM_PROGRESS_PREFIX = "easyprufung:exam-progress:v1:";

interface StoredActiveExam {
    version: 1;
    userId: string;
    screen: "exam" | "result";
    session: ExamSessionView;
    result: ExamResultView | null;
    savedAt: string;
}

export interface StoredExamProgress {
    version: 1;
    sessionId: string;
    index: number;
    answers: AnswerMap;
    savedAt: string;
}

function getStorage(): Storage | null {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function activeExamKey(userId: string): string {
    return `${ACTIVE_EXAM_PREFIX}${userId}`;
}

function examProgressKey(sessionId: string): string {
    return `${EXAM_PROGRESS_PREFIX}${sessionId}`;
}

function hasExpired(session: ExamSessionView): boolean {
    if (!session.expiresAt) {
        return false;
    }

    const expiresAt = new Date(session.expiresAt).getTime();
    return Number.isFinite(expiresAt) && expiresAt <= Date.now();
}

function sanitizeAnswers(value: unknown): AnswerMap {
    if (!isRecord(value)) {
        return {};
    }

    return Object.entries(value).reduce<AnswerMap>(
        (result, [questionNumber, candidate]) => {
            if (!isRecord(candidate)) {
                return result;
            }

            const selectedOptionKeys = Array.isArray(
                candidate.selectedOptionKeys
            )
                ? candidate.selectedOptionKeys.filter(
                    (key): key is string => typeof key === "string"
                )
                : [];

            const text =
                typeof candidate.text === "string"
                    ? candidate.text
                    : "";

            result[questionNumber] = {
                selectedOptionKeys,
                text
            };

            return result;
        },
        {}
    );
}

export function loadActiveExam(userId: string): StoredActiveExam | null {
    const storage = getStorage();
    const normalizedUserId = userId.trim();

    if (!storage || !normalizedUserId) {
        return null;
    }

    const key = activeExamKey(normalizedUserId);

    try {
        const serialized = storage.getItem(key);

        if (!serialized) {
            return null;
        }

        const candidate: unknown = JSON.parse(serialized);

        if (
            !isRecord(candidate) ||
            candidate.version !== 1 ||
            candidate.userId !== normalizedUserId ||
            (candidate.screen !== "exam" && candidate.screen !== "result") ||
            !isRecord(candidate.session) ||
            typeof candidate.session.sessionId !== "string"
        ) {
            storage.removeItem(key);
            return null;
        }

        const session = candidate.session as unknown as ExamSessionView;
        const screen = candidate.screen;
        const result = isRecord(candidate.result)
            ? (candidate.result as unknown as ExamResultView)
            : null;

        if (
            (screen === "exam" &&
                (hasExpired(session) || session.status === "EXPIRED")) ||
            (screen === "result" && !result)
        ) {
            storage.removeItem(key);
            clearExamProgress(session.sessionId);
            return null;
        }

        return {
            version: 1,
            userId: normalizedUserId,
            screen,
            session,
            result,
            savedAt:
                typeof candidate.savedAt === "string"
                    ? candidate.savedAt
                    : new Date().toISOString()
        };
    } catch {
        storage.removeItem(key);
        return null;
    }
}

export function saveActiveExam(input: {
    userId: string;
    screen: "exam" | "result";
    session: ExamSessionView;
    result: ExamResultView | null;
}): void {
    const storage = getStorage();
    const normalizedUserId = input.userId.trim();

    if (!storage || !normalizedUserId) {
        return;
    }

    const value: StoredActiveExam = {
        version: 1,
        userId: normalizedUserId,
        screen: input.screen,
        session: input.session,
        result: input.result,
        savedAt: new Date().toISOString()
    };

    try {
        storage.setItem(
            activeExamKey(normalizedUserId),
            JSON.stringify(value)
        );
    } catch {
        // Storage may be unavailable or full. The exam remains usable in memory.
    }
}

export function clearActiveExam(userId: string): void {
    const storage = getStorage();
    const normalizedUserId = userId.trim();

    if (!storage || !normalizedUserId) {
        return;
    }

    try {
        storage.removeItem(activeExamKey(normalizedUserId));
    } catch {
        // Ignore unavailable browser storage.
    }
}

export function loadExamProgress(
    sessionId: string
): StoredExamProgress | null {
    const storage = getStorage();

    if (!storage || !sessionId) {
        return null;
    }

    const key = examProgressKey(sessionId);

    try {
        const serialized = storage.getItem(key);

        if (!serialized) {
            return null;
        }

        const candidate: unknown = JSON.parse(serialized);

        if (
            !isRecord(candidate) ||
            candidate.version !== 1 ||
            candidate.sessionId !== sessionId ||
            typeof candidate.index !== "number" ||
            !Number.isInteger(candidate.index) ||
            candidate.index < 0
        ) {
            storage.removeItem(key);
            return null;
        }

        return {
            version: 1,
            sessionId,
            index: candidate.index,
            answers: sanitizeAnswers(candidate.answers),
            savedAt:
                typeof candidate.savedAt === "string"
                    ? candidate.savedAt
                    : new Date().toISOString()
        };
    } catch {
        storage.removeItem(key);
        return null;
    }
}

export function saveExamProgress(input: {
    sessionId: string;
    index: number;
    answers: AnswerMap;
}): void {
    const storage = getStorage();

    if (!storage || !input.sessionId) {
        return;
    }

    const value: StoredExamProgress = {
        version: 1,
        sessionId: input.sessionId,
        index: input.index,
        answers: input.answers,
        savedAt: new Date().toISOString()
    };

    try {
        storage.setItem(
            examProgressKey(input.sessionId),
            JSON.stringify(value)
        );
    } catch {
        // Storage may be unavailable or full. The exam remains usable in memory.
    }
}

export function clearExamProgress(sessionId: string): void {
    const storage = getStorage();

    if (!storage || !sessionId) {
        return;
    }

    try {
        storage.removeItem(examProgressKey(sessionId));
    } catch {
        // Ignore unavailable browser storage.
    }
}
