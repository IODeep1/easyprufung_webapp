import appI18n from "i18next";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export function SubmitConfirmation(props: {
  open: boolean;
  expiresAt: string | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { open, submitting, onClose, onConfirm, expiresAt } = props;
  // Use the user's interface language rather than the exam's German-only provider.
  const { t, i18n } = useTranslation(undefined, { i18n: appI18n });
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!open) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [open]);
  const deadline = expiresAt ? Date.parse(expiresAt) : NaN;
  const expired = Number.isFinite(deadline) && deadline <= Math.max(now, Date.now());

  if (!open) return null;

  return (
      <div
          className="fixed inset-0 z-50 grid place-items-center bg-white/95 p-4 backdrop-blur-sm"
          lang={i18n.resolvedLanguage}
          dir={i18n.dir()}
          aria-labelledby="exam-submit-title"
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
                aria-label={t("examSubmission.close")}
            >
              <X size={20} />
            </button>
          </div>

          <p className="eyebrow mt-7">
            {t("examSubmission.label")}
          </p>

          <h2 id="exam-submit-title" className="mt-2 text-3xl font-black tracking-[-0.04em]">
            {t("examSubmission.title")}
          </h2>

          <p className="mt-3 leading-7 text-black/55">
            {t("examSubmission.message")}
          </p>

          {expired && (
            <div role="alert" className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900">
              <h3 className="font-black">{t("examSubmission.expiredTitle")}</h3>
              <p className="mt-2 text-sm leading-6">{t("examSubmission.expiredMessage")}</p>
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="w-full rounded-2xl border border-black bg-white px-6 py-5 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("examSubmission.back")}
            </button>

            <button
                type="button"
                onClick={onConfirm}
                disabled={submitting}
                className="w-full rounded-2xl bg-black px-6 py-5 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
            >
              {submitting
                  ? t("examSubmission.submitting")
                  : t("examSubmission.submit")}
            </button>
          </div>
        </div>
      </div>
  );
}