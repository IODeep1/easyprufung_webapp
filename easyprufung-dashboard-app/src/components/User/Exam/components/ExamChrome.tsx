import { ArrowLeft, ArrowRight, Clock3, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { ExerciseView } from "../models/exam.ts";

function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds].map((value) => value.toString().padStart(2, "0")).join(":");
}

export function CountdownTimer({ expiresAt }: { expiresAt: string | null }) {
  const calculate = () =>
      expiresAt ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)) : 0;
  const [seconds, setSeconds] = useState(calculate);

  useEffect(() => {
    setSeconds(calculate());
    if (!expiresAt) return;
    const timer = window.setInterval(() => setSeconds(calculate()), 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  return (
      <div
          className="flex min-w-36 items-center justify-end gap-2 rounded-full border border-black bg-white px-4 py-2 font-mono text-sm font-black tabular-nums text-black"
          aria-label={`${formatTime(seconds)} verbleibend`}
      >
        <Clock3 size={16} aria-hidden="true" />
        {expiresAt ? formatTime(seconds) : "--:--:--"}
      </div>
  );
}

interface ExamHeaderProps {
  title: string;
  level: string;
  expiresAt: string | null;
  currentIndex: number;
  total: number;
}

export function ExamHeader({ title, level, expiresAt, currentIndex, total }: ExamHeaderProps) {
  const percentage = total === 0 ? 0 : ((currentIndex + 1) / total) * 100;
  return (
      <header className="sticky top-0 z-30 border-b border-black bg-white text-black">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-7 lg:px-10">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-black bg-white font-black text-black">E</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black uppercase tracking-[0.16em]">EasyPrüfung</p>
                <p className="truncate text-xs text-black/55">{title} · {level}</p>
              </div>
            </div>
          </div>
          <CountdownTimer expiresAt={expiresAt} />
        </div>
        <div className="h-1 bg-black/10">
          <div className="h-full bg-black transition-all duration-500" style={{ width: `${percentage}%` }} />
        </div>
      </header>
  );
}

export function PartInformation({
                                    exercise,
                                    index,
                                    total,
                                    extra
                                }: {
    exercise: ExerciseView;
    index: number;
    total: number;
    extra?: ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-[1.75rem] border border-black bg-white shadow-frame">
            <div className="grid gap-2 p-6 sm:p-8 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)] lg:p-10">
                <div>
                    <p className="eyebrow">
                        Abschnitt {index + 1} von {total}
                    </p>

                    <p className="mt-3 text-sm font-bold text-black/50">
                        {exercise.sectionTitle}
                    </p>

                    <h1 className="mt-1 font-display text-3xl leading-none tracking-[-0.04em] text-black sm:text-4xl">
                        {exercise.partTitle}
                    </h1>
                </div>

                <div>
                    <p className="eyebrow">Anweisungen</p>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-black/80 sm:text-base">
                        {exercise.instructions}
                    </p>

                    {extra && <div className="mt-6">{extra}</div>}
                </div>
            </div>
        </section>
    );
}

interface BottomNavigationProps {
  canGoBack: boolean;
  canContinue: boolean;
  isLast: boolean;
  answered: number;
  total: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function BottomNavigation(props: BottomNavigationProps) {
  const { canGoBack, canContinue, isLast, answered, total, onBack, onNext, onSubmit } = props;
  return (
      <footer className="mt-6 flex flex-col-reverse items-stretch justify-between gap-4 border-t border-black/10 pt-6 sm:flex-row sm:items-center">
        <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
        >
          <ArrowLeft size={17} /> Return
        </button>

        <div className="text-center text-xs font-bold uppercase tracking-[0.12em] text-black/45">
          {answered} / {total} beantwortet
        </div>

        <button
            type="button"
            onClick={isLast ? onSubmit : onNext}
            disabled={!canContinue}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-7 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-gray-300 disabled:text-gray-600 disabled:shadow-none"
        >
          {isLast ? "Submit" : "Next"}
          <ArrowRight size={17} />
        </button>
      </footer>
  );
}

const EXAM_PREPARATION_DURATION_MS = 2 * 60 * 1000;

const preparationSteps = [
    "Leseverstehen Teil 1",
    "Leseverstehen Teil 2",
    "Leseverstehen Teil 3",
    "Sprachbausteine Teil 1",
    "Sprachbausteine Teil 2",
    "Hörverstehen Teil 1",
    "Hörverstehen Teil 2",
    "Hörverstehen Teil 3",
    "Schriftlicher Ausdruck"
];

function formatRemainingTime(milliseconds: number): string {
    const totalSeconds = Math.max(
        0,
        Math.ceil(milliseconds / 1000)
    );

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
}

export function LoadingScreen({
                                  message
                              }: {
    message: string;
}) {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        const startedAt = Date.now();

        const interval = window.setInterval(() => {
            setElapsedTime(Date.now() - startedAt);
        }, 250);

        return () => window.clearInterval(interval);
    }, []);

    const realProgress =
        (elapsedTime / EXAM_PREPARATION_DURATION_MS) * 100;

    /*
     * Keep the progress below 100% until the backend request
     * finishes and App replaces this screen with the exam.
     */
    const progress = Math.min(98, realProgress);

    const currentStepIndex = Math.min(
        preparationSteps.length - 1,
        Math.floor(
            (progress / 100) * preparationSteps.length
        )
    );

    const remainingTime = Math.max(
        0,
        EXAM_PREPARATION_DURATION_MS - elapsedTime
    );

    const almostFinished =
        elapsedTime >= EXAM_PREPARATION_DURATION_MS;

    return (
        <main className="min-h-screen bg-white px-5 py-10 text-black sm:px-8">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center">
                <section className="w-full rounded-[2rem] border border-black bg-white p-6 shadow-frame sm:p-10">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="eyebrow">
                                Ihre persönliche Prüfung
                            </p>

                            <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight tracking-[-0.04em] sm:text-5xl">
                                Wir bereiten Ihre Prüfung vor.
                            </h1>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-black/60 sm:text-base">
                                {message}
                            </p>
                        </div>

                        <div className="shrink-0 rounded-2xl border border-black bg-white px-5 py-4 text-center">
                            <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-black/50">
                                Verbleibend
                            </p>

                            <p className="mt-1 font-mono text-2xl font-black tabular-nums">
                                {almostFinished
                                    ? "Fast fertig"
                                    : formatRemainingTime(remainingTime)}
                            </p>
                        </div>
                    </div>

                    <div
                        className="mt-10"
                        role="progressbar"
                        aria-label="Prüfung wird vorbereitet"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(progress)}
                    >
                        <div className="mb-3 flex items-center justify-between gap-4">
                            <p className="text-sm font-black">
                                {almostFinished
                                    ? "Letzte Prüfungskontrolle"
                                    : preparationSteps[currentStepIndex]}
                            </p>

                            <p className="font-mono text-sm font-black tabular-nums">
                                {Math.round(progress)}%
                            </p>
                        </div>

                        <div className="h-4 overflow-hidden rounded-full border border-black bg-white">
                            <div
                                className="h-full bg-black transition-[width] duration-300 ease-linear"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {preparationSteps.map((step, index) => {
                            const completed = index < currentStepIndex;
                            const active =
                                index === currentStepIndex &&
                                !almostFinished;

                            return (
                                <div
                                    key={step}
                                    className={`flex min-h-20 items-center gap-3 rounded-xl border p-4 ${
                                        completed || active
                                            ? "border-black bg-white"
                                            : "border-gray-300 bg-white text-gray-400"
                                    }`}
                                >
                  <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-black ${
                          completed
                              ? "border-black bg-black text-white"
                              : active
                                  ? "border-black bg-white text-black"
                                  : "border-gray-300 bg-white text-gray-400"
                      }`}
                  >
                    {completed ? (
                        "✓"
                    ) : active ? (
                        <LoaderCircle
                            size={16}
                            className="animate-spin"
                        />
                    ) : (
                        index + 1
                    )}
                  </span>

                                    <div>
                                        <p className="text-xs font-black leading-5">
                                            {step}
                                        </p>

                                        <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-wider opacity-60">
                                            {completed
                                                ? "Vorbereitet"
                                                : active
                                                    ? "Wird erstellt"
                                                    : "Wartet"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 rounded-xl border border-black bg-white p-4">
                        <p className="text-xs font-bold leading-6 text-black/60">
                            Bitte lassen Sie dieses Fenster geöffnet. Wir
                            stellen die Aufgaben zusammen, prüfen die
                            Antwortmöglichkeiten und richten Ihre persönliche
                            Prüfungssitzung ein.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}

export function ContentFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`frame p-5 sm:p-7 lg:p-9 ${className}`}>{children}</section>;
}