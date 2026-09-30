import { AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    BottomNavigation,
    ExamHeader,
    PartInformation
} from "./components/ExamChrome";
import { SubmitConfirmation } from "./components/HoldToSubmit";
import { PartRenderer } from "./components/PartRenderer";
import { AudioPlayer } from "./components/AudioPlayer.tsx";
import {
    clearExamProgress,
    loadExamProgress,
    saveExamProgress
} from "./exam-storage.ts";
import type {
    AnswerMap,
    ExamSessionView,
    SubmitExamRequest
} from "./models/exam.ts";

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

export function ExamRunnerPage(props: {
    session: ExamSessionView;
    onSubmit: (
        request: SubmitExamRequest
    ) => Promise<void>;
}) {
    const { session, onSubmit } = props;

    const [restoredProgress] = useState(() =>
        loadExamProgress(session.sessionId)
    );

    const [index, setIndex] = useState(() =>
        Math.min(
            restoredProgress?.index ?? 0,
            Math.max(
                session.exercises.length - 1,
                0
            )
        )
    );

    const [answers, setAnswers] =
        useState<AnswerMap>(
            () => restoredProgress?.answers ?? {}
        );

    const [confirmOpen, setConfirmOpen] =
        useState(false);

    const [
        incompleteParts,
        setIncompleteParts
    ] = useState<string[]>([]);

    const [submitting, setSubmitting] =
        useState(false);

    const [submitError, setSubmitError] =
        useState<string | null>(null);

    const exercise = session.exercises[index];

    useEffect(() => {
        scrollExamToTop();
    }, [index]);

    useEffect(() => {
        saveExamProgress({
            sessionId: session.sessionId,
            index,
            answers
        });
    }, [
        answers,
        index,
        session.sessionId
    ]);

    const payload = useMemo<SubmitExamRequest>(
        () => ({
            compactAnswers: null,

            answers: session.exercises.flatMap(
                (part) =>
                    part.questions.map(
                        (question) => ({
                            questionNumber:
                            question.number,

                            selectedOptionKeys:
                                answers[
                                    question.number
                                    ]?.selectedOptionKeys ??
                                [],

                            text:
                                question.type ===
                                "FREE_TEXT"
                                    ? answers[
                                    question.number
                                    ]?.text ?? ""
                                    : null
                        })
                    )
            )
        }),
        [
            answers,
            session.exercises
        ]
    );

    if (!exercise) {
        return (
            <main className="grid min-h-screen place-items-center bg-white p-6 text-black">
                <div className="max-w-lg rounded-[2rem] border border-black bg-white p-8 text-center">
                    <AlertCircle
                        className="mx-auto text-black"
                        size={36}
                    />

                    <h1 className="mt-5 text-3xl font-black">
                        Keine Prüfungsteile vorhanden
                    </h1>

                    <p className="mt-3 text-black/55">
                        Die Sitzung enthält keine
                        darstellbaren Aufgaben.
                    </p>
                </div>
            </main>
        );
    }

    const isQuestionAnswered = (
        questionNumber: string,
        questionType: string
    ): boolean => {
        const answer =
            answers[questionNumber];

        if (questionType === "FREE_TEXT") {
            return Boolean(
                answer?.text.trim()
            );
        }

        return Boolean(
            answer?.selectedOptionKeys.length
        );
    };

    const answeredCount =
        exercise.questions.filter(
            (question) =>
                isQuestionAnswered(
                    question.number,
                    question.type
                )
        ).length;

    const last =
        index ===
        session.exercises.length - 1;

    const setSelection = (
        questionNumber: string,
        key: string
    ) => {
        setSubmitError(null);

        setAnswers((current) => ({
            ...current,

            [questionNumber]: {
                selectedOptionKeys: key
                    ? [key]
                    : [],

                text:
                    current[questionNumber]
                        ?.text ?? ""
            }
        }));
    };

    const setText = (
        questionNumber: string,
        text: string
    ) => {
        setSubmitError(null);

        setAnswers((current) => ({
            ...current,

            [questionNumber]: {
                selectedOptionKeys:
                    current[questionNumber]
                        ?.selectedOptionKeys ?? [],

                text
            }
        }));
    };

    const goBack = () => {
        setSubmitError(null);

        setIndex((currentIndex) =>
            Math.max(
                0,
                currentIndex - 1
            )
        );
    };

    const goNext = () => {
        setSubmitError(null);

        setIndex((currentIndex) =>
            Math.min(
                session.exercises.length - 1,
                currentIndex + 1
            )
        );
    };

    const requestSubmission = () => {
        if (submitting) {
            return;
        }

        const missingParts =
            session.exercises
                .map((part, partIndex) => {
                    const hasMissingAnswers =
                        part.questions.some(
                            (question) =>
                                !isQuestionAnswered(
                                    question.number,
                                    question.type
                                )
                        );

                    if (!hasMissingAnswers) {
                        return null;
                    }

                    return (
                        part.partTitle ||
                        part.sectionTitle ||
                        `Teil ${partIndex + 1}`
                    );
                })
                .filter(
                    (
                        part
                    ): part is string =>
                        Boolean(part)
                );

        if (missingParts.length > 0) {
            setConfirmOpen(false);
            setSubmitError(null);
            setIncompleteParts(
                missingParts
            );

            return;
        }

        setIncompleteParts([]);
        setSubmitError(null);
        setConfirmOpen(true);
    };

    const submit = async () => {
        setSubmitting(true);
        setSubmitError(null);

        try {
            await onSubmit(payload);

            clearExamProgress(
                session.sessionId
            );
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Die Prüfung konnte nicht abgegeben werden."
            );

            setSubmitting(false);
            setConfirmOpen(false);

            window.requestAnimationFrame(() => {
                scrollExamToTop();
            });
        }
    };

    const audio = exercise.audioUrl ? (
        <AudioPlayer
            src={exercise.audioUrl}
            playbackId={`${session.sessionId}:${index}`}
        />
    ) : undefined;

    return (
        <div className="min-h-screen pb-10">
            <ExamHeader
                title={session.title}
                level={session.level}
                expiresAt={session.expiresAt}
                currentIndex={index}
                total={
                    session.exercises.length
                }
            />

            <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
                <PartInformation
                    exercise={exercise}
                    index={index}
                    total={
                        session.exercises.length
                    }
                    extra={audio}
                />

                {submitError && (
                    <div
                        className="mt-5 flex items-start gap-3 rounded-2xl border border-black bg-white p-4 text-sm font-semibold"
                        role="alert"
                    >
                        <AlertCircle
                            size={19}
                            className="mt-0.5 shrink-0"
                        />

                        <p className="leading-6">
                            {submitError}
                        </p>
                    </div>
                )}

                <div className="mt-6">
                    <PartRenderer
                        exercise={exercise}
                        answers={answers}
                        onSelection={
                            setSelection
                        }
                        onText={setText}
                    />
                </div>

                <BottomNavigation
                    canGoBack={
                        index > 0 &&
                        !submitting
                    }
                    canContinue={!submitting}
                    isLast={last}
                    answered={answeredCount}
                    total={
                        exercise.questions.length
                    }
                    onBack={goBack}
                    onNext={goNext}
                    onSubmit={
                        requestSubmission
                    }
                />
            </main>

            {incompleteParts.length > 0 && (
                <div
                    className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setIncompleteParts([]);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="incomplete-title"
                        className="w-full max-w-md rounded-2xl border border-black bg-white p-6 shadow-xl"
                    >
                        <div className="text-center">
                            <AlertCircle
                                size={32}
                                className="mx-auto"
                            />

                            <h2
                                id="incomplete-title"
                                className="mt-4 text-xl font-black text-black"
                            >
                                Prüfung nicht vollständig
                            </h2>

                            <p className="mt-3 text-sm font-semibold leading-6 text-black/60">
                                Bitte beantworte alle Fragen,
                                bevor du die Prüfung abgibst.
                            </p>
                        </div>

                        <div className="mt-5 border-t border-black pt-4">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-black/45">
                                Offene Teile
                            </p>

                            <ul className="mt-3 space-y-2">
                                {incompleteParts.map(
                                    (part) => (
                                        <li
                                            key={part}
                                            className="flex items-center gap-3 text-sm font-bold text-black"
                                        >
                                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-black" />

                                            <span>
                                                {part}
                                            </span>
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setIncompleteParts([])
                            }
                            className="mt-6 w-full rounded-xl border-2 border-black bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-black hover:text-white"
                        >
                            Verstanden
                        </button>
                    </div>
                </div>
            )}

            <SubmitConfirmation
                open={confirmOpen}
                submitting={submitting}
                onClose={() => {
                    if (!submitting) {
                        setConfirmOpen(false);
                    }
                }}
                onConfirm={submit}
            />
        </div>
    );
}