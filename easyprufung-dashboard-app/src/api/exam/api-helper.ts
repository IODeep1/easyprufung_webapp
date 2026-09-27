import type {
    ApiErrorBody,
    ExamResultView, ExamSessionSummaryView,
    ExamSessionView, PageResponse,
    PassedExamEntry,
    StartExamRequest,
    SubmitExamRequest
} from "../../components/User/Exam/models/exam.ts";


export class ExamApiError extends Error {
    readonly status: number;
    readonly details?: ApiErrorBody;

    constructor(status: number, message: string, details?: ApiErrorBody) {
        super(message);
        this.name = "ExamApiError";
        this.status = status;
        this.details = details;
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const accessToken = localStorage.getItem("access-token");
    const response = await fetch(`${path}`, {
        ...init,
        headers: {
            Accept: "application/json",
            ...(init?.body ? { "Content-Type": "application/json" } : {}),
            ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            ...init?.headers
        }
    });

    if (!response.ok) {
        let details: ApiErrorBody | undefined;
        try {
            details = (await response.json()) as ApiErrorBody;
        } catch {
            details = undefined;
        }
        throw new ExamApiError(
            response.status,
            details?.message || details?.error || `Request failed with status ${response.status}`,
            details
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}

export function startExamSession(payload: StartExamRequest): Promise<ExamSessionView> {
    return request<ExamSessionView>("/api/exams/sessions", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

export function getExamSession(sessionId: string): Promise<ExamSessionView> {
    return request<ExamSessionView>(`/api/exams/sessions/${encodeURIComponent(sessionId)}`);
}

export function submitExamSession(
    sessionId: string,
    payload: SubmitExamRequest
): Promise<ExamResultView> {
    return request<ExamResultView>(
        `/api/exams/sessions/${encodeURIComponent(sessionId)}/submit`,
        { method: "POST", body: JSON.stringify(payload) }
    );
}

export function getExamResult(sessionId: string): Promise<ExamResultView> {
    return request<ExamResultView>(
        `/api/exams/sessions/${encodeURIComponent(sessionId)}/result`
    );
}

export function getUserExamSessionsPage(
    userId: string,
    page = 0,
    size = 20
): Promise<PageResponse<ExamSessionSummaryView>> {
    const query = new URLSearchParams({
        userId,
        page: page.toString(),
        size: size.toString()
    });

    return request<PageResponse<ExamSessionSummaryView>>(
        `/api/exams/sessions?${query.toString()}`
    );
}

export async function getAllUserExamSessions(
    userId: string
): Promise<ExamSessionSummaryView[]> {
    const firstPage = await getUserExamSessionsPage(
        userId,
        0,
        20
    );

    if (firstPage.totalPages <= 1) {
        return firstPage.content;
    }

    const remainingPages = await Promise.all(
        Array.from(
            {
                length: firstPage.totalPages - 1
            },
            (_, index) =>
                getUserExamSessionsPage(userId, index + 1, 20)
        )
    );

    return [
        ...firstPage.content,
        ...remainingPages.flatMap((page) => page.content)
    ];
}

export async function getPassedUserExams(
    userId: string
): Promise<PassedExamEntry[]> {
    const summaries =
        await getAllUserExamSessions(userId);

    const evaluatedSummaries = summaries.filter(
        (session) => session.status === "EVALUATED"
    );

    const entries: PassedExamEntry[] =
        await Promise.all(
            evaluatedSummaries.map(async (summary) => {
                const session = await getExamSession(
                    summary.sessionId
                );

                const result = await getExamResult(
                    summary.sessionId
                );

                return {
                    session,
                    result
                };
            })
        );

    console.log("Loaded exam entries:", entries);

    return entries
        .filter(
            (entry): entry is PassedExamEntry =>
                entry !== null
        )
        .sort(
            (first, second) =>
                new Date(second.result.evaluatedAt).getTime() -
                new Date(first.result.evaluatedAt).getTime()
        );
}