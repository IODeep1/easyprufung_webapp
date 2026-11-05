import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

/** Informational notice: the saved exam is already restored behind the dialog. */
export function ResumeNotice({ onDismiss }: { onDismiss: () => void }) {
    const { t, i18n } = useTranslation();
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const element = dialog.current;
        element?.showModal();
        return () => { if (element?.open) element.close(); };
    }, []);
    return (
        <dialog ref={dialog} onClose={onDismiss} aria-labelledby="exam-resume-title"
            aria-describedby="exam-resume-message" lang={i18n.resolvedLanguage}
            dir={i18n.dir()} className="w-full max-w-md rounded-2xl border border-black bg-white p-6 text-black shadow-xl backdrop:bg-black/40">
            <h2 id="exam-resume-title" className="text-xl font-black">{t("examResumeNotice.title")}</h2>
            <p id="exam-resume-message" className="mt-3 text-sm leading-6">{t("examResumeNotice.message")}</p>
            <button autoFocus type="button" onClick={() => dialog.current?.close()}
                className="mt-6 w-full rounded-xl bg-black px-5 py-3 text-sm font-black text-white">
                {t("examResumeNotice.dismiss")}
            </button>
        </dialog>
    );
}
