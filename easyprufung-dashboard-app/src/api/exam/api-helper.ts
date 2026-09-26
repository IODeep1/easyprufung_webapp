import type {
    ApiErrorBody,
    ExamResultView,
    ExamSessionView,
    StartExamRequest,
    SubmitExamRequest
} from "../../store/models/user/exam/exam";


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
