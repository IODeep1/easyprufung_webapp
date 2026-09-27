export type ExamProvider = "TELC" | "GOETHE";
export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type SessionStatus =
    | "CREATED"
    | "IN_PROGRESS"
    | "SUBMITTED"
    | "EVALUATED"
    | "EVALUATION_FAILED"
    | "EXPIRED";
export type QuestionType =
    | "SINGLE_CHOICE"
    | "MULTIPLE_CHOICE"
    | "TRUE_FALSE"
    | "MATCHING"
    | "CLOZE_CHOICE"
    | "FREE_TEXT";

export interface OptionDto {
    key: string;
    text: string;
}

export interface QuestionView {
    id: string;
    number: string;
    stimulus?: string | null;
    prompt: string;
    type: QuestionType;
    options: OptionDto[];
    maximumScore: number;
}

export interface ExerciseView {
    id: string;
    sectionKey: string;
    sectionTitle: string;
    partKey: string;
    partTitle: string;
    instructions: string;
    content: string | null;
    audioUrl: string | null;
    audioContentType: string | null;
    audioPlayLimit: number | null;
    durationSeconds: number | null;
    questions: QuestionView[];
}

export interface ExamSessionView {
    sessionId: string;
    examCode: string;
    title: string;
    provider: ExamProvider;
    level: CefrLevel;
    definitionVersion: number;
    status: SessionStatus;
    startedAt: string;
    expiresAt: string | null;
    exercises: ExerciseView[];
}

export interface StartExamRequest {
    userId: string;
    provider: ExamProvider;
    level: CefrLevel;
    examCode?: string;
}

export interface AnswerPayload {
    questionNumber: string;
    selectedOptionKeys: string[];
    text: string | null;
}

export interface SubmitExamRequest {
    compactAnswers?: string | null;
    answers: AnswerPayload[];
}

export interface SectionResultView {
    sectionKey: string;
    title: string;
    score: number;
    maximumScore: number;
}

export interface QuestionResultView {
    number: string;
    correct: boolean;
    score: number;
    maximumScore: number;
    submittedAnswers: string[];
    correctAnswers: string[];
    explanation: string | null;
}

export interface ExamResultView {
    sessionId: string;
    score: number;
    maximumScore: number;
    percentage: number;
    passed: boolean;
    sections: SectionResultView[];
    questions: QuestionResultView[];
    overallFeedback: string | null;
    evaluatedAt: string;
}

export interface ApiErrorBody {
    status?: number;
    error?: string;
    message?: string;
    violations?: Record<string, string>;
}

export interface LocalAnswer {
    selectedOptionKeys: string[];
    text: string;
}


export interface ExamSessionSummaryView {
    sessionId: string;
    examCode: string;
    title: string;
    provider: ExamProvider;
    level: CefrLevel;
    definitionVersion: number;
    status: SessionStatus;
    createdAt: string;
    startedAt: string;
    expiresAt: string | null;
    submittedAt: string | null;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}
export interface PassedExamEntry {
    session: ExamSessionView;
    result: ExamResultView;
}

export type AnswerMap = Record<string, LocalAnswer>;
