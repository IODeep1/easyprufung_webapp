import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const HOLD_DURATION = 2000;

export function SubmitConfirmation(props: {
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { open, submitting, onClose, onConfirm } = props;
  const timerRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const firedRef = useRef(false);
  const [progress, setProgress] = useState(0);

  const clear = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
    timerRef.current = null;
    animationRef.current = null;
    startRef.current = 0;
    firedRef.current = false;
    setProgress(0);
  };

  useEffect(() => clear, []);
  if (!open) return null;

  const tick = () => {
    const elapsed = performance.now() - startRef.current;
    setProgress(Math.min(100, (elapsed / HOLD_DURATION) * 100));
    if (elapsed < HOLD_DURATION) animationRef.current = window.requestAnimationFrame(tick);
  };

  const begin = () => {
    if (submitting) return;
    clear();
    startRef.current = performance.now();
    animationRef.current = window.requestAnimationFrame(tick);
    timerRef.current = window.setTimeout(() => {
      if (firedRef.current) return;
      firedRef.current = true;
      setProgress(100);
      onConfirm();
    }, HOLD_DURATION);
  };

  return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-white/95 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
        <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-6">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-black bg-white text-black">
              <AlertTriangle size={22} />
            </div>
            <button type="button" onClick={onClose} disabled={submitting} className="grid h-10 w-10 place-items-center rounded-full bg-black text-white disabled:bg-gray-300 disabled:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <p className="eyebrow mt-7">Endgültige Abgabe</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">Prüfung jetzt abgeben?</h2>
          <p className="mt-3 leading-7 text-black/55">
            Nach der Abgabe können Antworten nicht mehr geändert werden. Halten Sie die Taste zwei Sekunden gedrückt.
          </p>
          <button
              type="button"
              disabled={submitting}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                begin();
              }}
              onPointerUp={() => {
                if (!firedRef.current) {
                  clear();
                }
              }}
              onPointerLeave={() => {
                if (!firedRef.current) {
                  clear();
                }
              }}
              onPointerCancel={() => {
                if (!firedRef.current) {
                  clear();
                }
              }}
              onKeyDown={(event) => {
                if (
                    (event.key === " " || event.key === "Enter") &&
                    !event.repeat
                ) {
                  event.preventDefault();
                  begin();
                }
              }}
              onKeyUp={(event) => {
                if (
                    (event.key === " " || event.key === "Enter") &&
                    !firedRef.current
                ) {
                  clear();
                }
              }}
              className="relative mt-8 w-full touch-none overflow-hidden rounded-2xl bg-black px-6 py-5 text-sm font-black uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed"
          >
            <span
                aria-hidden="true"
                className="absolute inset-0 origin-left bg-gray-500 transition-transform duration-75 ease-linear"
                style={{
                  transform: `scaleX(${progress / 100})`
                }}
            />

                      <span className="relative z-10 text-white">
              {submitting
                  ? "Wird ausgewertet …"
                  : "2 Sekunden halten"}
            </span>
          </button>
        </div>
      </div>
  );
}