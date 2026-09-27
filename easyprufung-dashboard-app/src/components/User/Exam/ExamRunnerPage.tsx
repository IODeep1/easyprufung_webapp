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
import type {
    AnswerMap,
    ExamSessionView,
    SubmitExamRequest
} from "./models/exam.ts";

export function ExamRunnerPage(props: {
    session: ExamSessionView;
    onSubmit: (request: SubmitExamRequest) => Promise<void>;
}) {
    const { session, onSubmit } = props;

    const [index, setIndex] = useState(0);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const exercise = session.exercises[index];

    /*
     * Hooks must always be called before any conditional return.
     */
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, [index]);

    const payload = useMemo<SubmitExamRequest>(
        () => ({
            compactAnswers: null,
            answers: session.exercises.flatMap((part) =>
                part.questions.map((question) => ({
                    questionNumber: question.number,
                    selectedOptionKeys:
                        answers[question.number]?.selectedOptionKeys ?? [],
                    text:
                        question.type === "FREE_TEXT"
                            ? answers[question.number]?.text ?? ""
                            : null
                }))
            )
        }),
        [answers, session.exercises]
    );

    /*
     * This return is now placed after all hooks.
     */
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
                        Die Sitzung enthält keine darstellbaren Aufgaben.
                    </p>
                </div>
            </main>
        );
    }

    const answeredCount = exercise.questions.filter((question) => {
        const answer = answers[question.number];

        return question.type === "FREE_TEXT"
            ? Boolean(answer?.text.trim())
            : Boolean(answer?.selectedOptionKeys.length);
    }).length;

    const complete =
        exercise.questions.length > 0 &&
        answeredCount === exercise.questions.length;

    const last = index === session.exercises.length - 1;

    const setSelection = (
        questionNumber: string,
        key: string
    ) => {
        setAnswers((current) => ({
            ...current,
            [questionNumber]: {
                selectedOptionKeys: key ? [key] : [],
                text: current[questionNumber]?.text ?? ""
            }
        }));
    };

    const setText = (
        questionNumber: string,
        text: string
    ) => {
        setAnswers((current) => ({
            ...current,
            [questionNumber]: {
                selectedOptionKeys:
                    current[questionNumber]?.selectedOptionKeys ?? [],
                text
            }
        }));
    };

    const submit = async () => {
        setSubmitting(true);
        setSubmitError(null);

        try {
            await onSubmit(payload);
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Die Prüfung konnte nicht abgegeben werden."
            );

            setSubmitting(false);
            setConfirmOpen(false);
        }
    };

    const audio = exercise.audioUrl ? (
        <AudioPlayer
            src={exercise.audioUrl}
            playLimit={exercise.audioPlayLimit}
        />
    ) : undefined;

    return (
        <div className="min-h-screen pb-10">
            <ExamHeader
                title={session.title}
                level={session.level}
                expiresAt={session.expiresAt}
                currentIndex={index}
                total={session.exercises.length}
            />

            <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
                <PartInformation
                    exercise={exercise}
                    index={index}
                    total={session.exercises.length}
                    extra={audio}
                />

                <div className="mt-6">
                    <PartRenderer
                        exercise={exercise}
                        answers={answers}
                        onSelection={setSelection}
                        onText={setText}
                    />
                </div>

                {submitError && (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-black bg-white p-4 text-sm font-semibold">
                        <AlertCircle
                            size={19}
                            className="mt-0.5 shrink-0"
                        />

                        {submitError}
                    </div>
                )}

                <BottomNavigation
                    canGoBack={index > 0 && !submitting}
                    canContinue={complete && !submitting}
                    isLast={last}
                    answered={answeredCount}
                    total={exercise.questions.length}
                    onBack={() =>
                        setIndex((value) =>
                            Math.max(0, value - 1)
                        )
                    }
                    onNext={() =>
                        setIndex((value) =>
                            Math.min(
                                session.exercises.length - 1,
                                value + 1
                            )
                        )
                    }
                    onSubmit={() => setConfirmOpen(true)}
                />
            </main>

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