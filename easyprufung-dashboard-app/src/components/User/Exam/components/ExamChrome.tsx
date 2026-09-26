import { ArrowLeft, ArrowRight, Clock3, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { ExerciseView } from "../../../../store/models/user/exam/exam.ts";

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

export function LoadingScreen({ message }: { message: string }) {
  return (
      <main className="grid min-h-screen place-items-center bg-white px-6 text-black">
        <div className="w-full max-w-xl text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-black bg-white text-black">
            <LoaderCircle className="animate-spin" size={34} />
          </div>
          <p className="mt-8 text-xs font-black uppercase tracking-[0.25em] text-black/50">Prüfung wird vorbereitet</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-5xl">Einen Moment bitte.</h1>
          <p className="mx-auto mt-4 max-w-md leading-7 text-black/55">{message}</p>
          <div className="mt-10 h-1 overflow-hidden rounded-full bg-black/10">
            <div className="h-full w-1/3 animate-[loading_1.4s_ease-in-out_infinite] rounded-full bg-black" />
          </div>
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-120%); } 100% { transform: translateX(420%); } }`}</style>
      </main>
  );
}

export function ContentFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`frame p-5 sm:p-7 lg:p-9 ${className}`}>{children}</section>;
}