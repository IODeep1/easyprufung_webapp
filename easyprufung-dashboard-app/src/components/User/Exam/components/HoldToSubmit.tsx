import { AlertTriangle, X } from "lucide-react";

export function SubmitConfirmation(props: {
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { open, submitting, onClose, onConfirm } = props;

  if (!open) return null;

  return (
      <div
          className="fixed inset-0 z-50 grid place-items-center bg-white/95 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
      >
        <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-6">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-black bg-white text-black">
              <AlertTriangle size={22} />
            </div>

            <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="grid h-10 w-10 place-items-center rounded-full bg-black text-white disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
                aria-label="Schließen"
            >
              <X size={20} />
            </button>
          </div>

          <p className="eyebrow mt-7">
            Endgültige Abgabe
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
            Prüfung jetzt abgeben?
          </h2>

          <p className="mt-3 leading-7 text-black/55">
            Nach der Abgabe können Antworten nicht mehr geändert werden.
            Bitte überprüfen Sie Ihre Antworten, bevor Sie die Prüfung endgültig
            abgeben.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="w-full rounded-2xl border border-black bg-white px-6 py-5 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Zurück
            </button>

            <button
                type="button"
                onClick={onConfirm}
                disabled={submitting}
                className="w-full rounded-2xl bg-black px-6 py-5 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
            >
              {submitting
                  ? "Wird ausgewertet …"
                  : "Prüfung abgeben"}
            </button>
          </div>
        </div>
      </div>
  );
}