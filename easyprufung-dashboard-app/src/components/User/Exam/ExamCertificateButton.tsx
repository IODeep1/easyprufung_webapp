import appI18n from "i18next";
import { useTranslation } from "react-i18next";
import { Facebook, Linkedin } from "lucide-react";
import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { publishExamCertificate, revokeExamCertificate } from "../../../api/exam/api-helper";
import type { IStateType } from "../../../store/models/root.interface";
import { ExamCertificate } from "./ExamCertificatePage";
import type { ExamResultView, ExamSessionView } from "./models/exam";

const platforms = [
    { name: "Facebook", Icon: Facebook, endpoint: "https://www.facebook.com/sharer/sharer.php", parameter: "u" },
    { name: "X", Icon: null, endpoint: "https://x.com/intent/tweet", parameter: "url" },
    { name: "LinkedIn", Icon: Linkedin, endpoint: "https://www.linkedin.com/sharing/share-offsite/", parameter: "url" }
];

export function ExamCertificateButton({ session, result }: { session: ExamSessionView; result: ExamResultView }) {
    const { t, i18n } = useTranslation(undefined, { i18n: appI18n });
    const dialog = useRef<HTMLDialogElement>(null);
    const user = useSelector((state: IStateType) => state.userAccount.user);
    const name = [user?.firstname, user?.lastname].filter(Boolean).join(" ").trim();
    const [pending, setPending] = useState(false);
    const [publicLink, setPublicLink] = useState("");
    const [shareFallback, setShareFallback] = useState("");
    const [message, setMessage] = useState("");

    const share = async (platform: typeof platforms[number]) => {
        const tab = window.open("about:blank", "_blank");
        if (tab) tab.opener = null;
        setPending(true);
        setMessage("");
        setShareFallback("");
        try {
            const { token } = await publishExamCertificate(session.sessionId);
            const link = new URL(`/zertifikat/${encodeURIComponent(token)}`, window.location.origin).href;
            const shareUrl = new URL(platform.endpoint);
            shareUrl.searchParams.set(platform.parameter, link);
            setPublicLink(link);
            if (tab && !tab.closed) tab.location.replace(shareUrl.href);
            else setShareFallback(shareUrl.href);
        } catch {
            tab?.close();
            setMessage("certificateShare.publishError");
        } finally {
            setPending(false);
        }
    };

    const revoke = async () => {
        setPending(true);
        setMessage("");
        try {
            await revokeExamCertificate(session.sessionId);
            setPublicLink("");
            setShareFallback("");
            setMessage("certificateShare.revoked");
        } catch {
            setMessage("certificateShare.revokeError");
        } finally {
            setPending(false);
        }
    };

    return (
        <>
            <button type="button" lang={i18n.resolvedLanguage} dir={i18n.dir()} data-no-translate
                onClick={() => dialog.current?.showModal()}
                className="mt-5 inline-flex rounded-full bg-black px-5 py-3 text-sm font-bold text-white">
                {t("certificateShare.open")}
            </button>
            <dialog ref={dialog} lang={i18n.resolvedLanguage} dir={i18n.dir()} data-no-translate
                aria-label={t("certificateShare.title")}
                className="max-h-[90dvh] w-11/12 max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 text-stone-900 backdrop:bg-black/50 sm:p-8">
                <button type="button" onClick={() => dialog.current?.close()} className="text-sm font-semibold underline">
                    {t("certificateShare.close")}
                </button>
                <ExamCertificate name={name} level={session.level} result={result} />
                <p className="mt-5 text-sm text-stone-700">
                    {t("certificateShare.notice")}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                    {platforms.map(platform => (
                        <button key={platform.name} type="button" disabled={pending}
                            title={t("certificateShare.shareOn", { platform: platform.name })}
                            aria-label={t("certificateShare.shareOn", { platform: platform.name })}
                            onClick={() => void share(platform)}
                            className="grid h-12 w-12 place-items-center rounded-full border border-stone-300 bg-white font-bold hover:bg-stone-100 disabled:opacity-50">
                            {platform.Icon ? <platform.Icon size={21} aria-hidden="true" /> : <span aria-hidden="true">𝕏</span>}
                        </button>
                    ))}
                </div>
                {publicLink && (
                    <a dir="ltr" href={publicLink} target="_blank" rel="noreferrer" className="mt-4 block break-all text-sm underline">
                        {publicLink}
                    </a>
                )}
                {shareFallback && (
                    <a href={shareFallback} target="_blank" rel="noreferrer" className="mt-3 block text-sm font-bold underline">
                        {t("certificateShare.openTab")}
                    </a>
                )}
                <button type="button" disabled={pending} onClick={() => void revoke()} className="mt-4 text-sm underline">
                    {t("certificateShare.revoke")}
                </button>
                {message && <p role="status" className="mt-3 text-sm">{t(message)}</p>}
            </dialog>
        </>
    );
}
