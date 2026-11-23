import { ArrowRight, AlertCircle, Check, FileCheck2, Loader2, ShieldCheck, UserCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import Logo from "../../../../images/logo.png";
import { guestAuthCopy, guestAuthPresentationCopy, guestCopy, guestSubmissionCopy } from "./guest-copy";

export default function GuestSubmissionPage({ examTitle, ready, busy, error, onSubmit, onRetry, onPlans }: {
 examTitle?: string; ready: boolean; busy: boolean; error: string;
 onSubmit: () => void; onRetry: () => void; onPlans?: () => void;
}) {
 const { t, i18n } = useTranslation();
 const language = i18n.resolvedLanguage || i18n.language;
 const copy = guestCopy(language), auth = guestAuthCopy(language), info = guestAuthPresentationCopy(language), detail = guestSubmissionCopy(language);
 const primary = "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black bg-black px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 dark:border-white dark:bg-white dark:text-black dark:hover:bg-gray-100";
 return <main className="relative min-h-screen overflow-hidden bg-white text-black dark:bg-black dark:text-white">
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
   <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
   <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
   <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_1px)]" />
  </div>
  <div className="relative z-10 mx-auto max-w-6xl px-6 pb-12 pt-7 sm:px-8">
   <header className="inline-flex items-center gap-3"><img src={Logo} alt="SmartPrüfung logo" width={44} height={44} className="h-11 w-11 rounded-lg" /><span className="text-2xl font-semibold tracking-tight">SmartPrüfung</span></header>
   <div className="grid items-center gap-10 py-12 md:min-h-[calc(100vh-7rem)] md:grid-cols-2 md:py-16">
    <section aria-live="polite" className="order-2 md:order-1">
     <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"><ShieldCheck size={15} aria-hidden="true" />{ready ? copy.saved : copy.unavailable}</span>
     <h1 className="mt-6 max-w-lg text-4xl font-extrabold leading-tight tracking-tight lg:text-5xl">{ready ? (busy ? detail.submittingHeading : detail.heading) : copy.unavailable}</h1>
     {ready && <>
      <p className="mt-5 max-w-lg text-base leading-7 text-gray-600 dark:text-gray-300">{busy ? detail.submittingIntro : detail.intro}</p>
      <div className="mt-8 space-y-4">
       {[{icon: UserCheck, title: detail.accountReady, body: detail.accountInfo}, {icon: ShieldCheck, title: auth.saved, body: info.savedInfo}, {icon: FileCheck2, title: info.resultStep, body: info.resultInfo}].map(item => <div key={item.title} className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-black/10 bg-white/70 text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-blue-400"><item.icon size={19} aria-hidden="true" /></span>
        <div><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">{item.body}</p></div>
       </div>)}
      </div>
     </>}
    </section>
    <section className="order-1 w-full max-w-lg md:order-2 overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/60" aria-label={ready ? copy.saved : copy.unavailable}>
     <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />
     <div className="p-6 sm:p-8">
      <span className="mb-6 inline-grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">{ready ? <FileCheck2 size={28} aria-hidden="true" /> : <AlertCircle size={28} aria-hidden="true" />}</span>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">{ready ? auth.completed : copy.unavailable}</p>
      <h2 className="mt-3 text-2xl font-bold">{examTitle?.replace(/\btelc\b[\s-]*/gi, "").trim() || "Deutsch B1"}</h2>
      {ready && <div className="mt-5 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200"><Check size={17} className="shrink-0" aria-hidden="true" />{auth.saved}</div>}
      {error && <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"><AlertCircle size={18} className="mt-1 shrink-0" aria-hidden="true" /><p className="min-w-0 break-words">{error}</p></div>}
      <div className="mt-6 space-y-3">
       {ready ? <button className={primary} disabled={busy} aria-busy={busy} onClick={onSubmit}>{busy ? <><Loader2 size={17} className="animate-spin" aria-hidden="true" />{t("examSubmission.submitting")}</> : <>{copy.submit}<ArrowRight size={17} aria-hidden="true" /></>}</button>
        : <button className={primary} onClick={onRetry}>{copy.retry}<ArrowRight size={17} aria-hidden="true" /></button>}
       {onPlans && <button className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10" disabled={busy} onClick={onPlans}>{copy.purchase}</button>}
      </div>
      <p className="mt-4 text-xs leading-5 text-gray-500 dark:text-gray-400">{info.accessInfo}</p>
     </div>
    </section>
   </div>
  </div>
 </main>;
}
