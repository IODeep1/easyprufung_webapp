import { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { ArrowRight, Check, CheckCircle2, FileCheck2, ShieldCheck, UserRound, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "../../../../images/logo.png";
import { guestAuthCopy, guestAuthPresentationCopy, guestCheckpointCopy } from "./guest-copy";

export default function GuestAuthChoice({ examTitle, continueExam=false }: { examTitle?: string;continueExam?:boolean }) {
 const [open, setOpen] = useState(true);
 const navigate = useNavigate();
 const { i18n } = useTranslation();
 const language = i18n.resolvedLanguage || i18n.language;
 const checkpoint=continueExam?guestCheckpointCopy(language):{};
 const copy = {...guestAuthCopy(language),...checkpoint}, detail = {...guestAuthPresentationCopy(language),...checkpoint};
 const primary = "inline-flex items-center justify-center gap-2 rounded-xl border border-black bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-white dark:bg-white dark:text-black dark:hover:bg-gray-100";
 const brand = <div className="inline-flex items-center gap-3"><img src={Logo} alt="SmartPrüfung logo" width={44} height={44} className="h-11 w-11 rounded-lg" /><span className="text-2xl font-semibold tracking-tight">SmartPrüfung</span></div>;
 return <>
  <main className="relative min-h-screen overflow-hidden bg-white text-black dark:bg-black dark:text-white">
   <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
    <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_1px)]" />
   </div>
   <div className="relative z-10 mx-auto max-w-6xl px-6 pb-12 pt-7 sm:px-8">
    <header>{brand}</header>
    <div className="grid items-center gap-10 py-12 md:min-h-[calc(100vh-7rem)] md:grid-cols-2 md:py-16">
     <section>
      <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"><CheckCircle2 size={15} aria-hidden="true" />{copy.completed}</span>
      <h1 className="mt-6 max-w-lg text-4xl font-extrabold leading-tight tracking-tight lg:text-5xl">{detail.heading}</h1>
      <p className="mt-5 max-w-lg text-base leading-7 text-gray-600 dark:text-gray-300">{detail.intro}</p>
      <div className="mt-8 space-y-4">
       {[{icon: ShieldCheck, title: copy.saved, body: detail.savedInfo}, {icon: UserRound, title: detail.accountStep, body: detail.accountInfo}, {icon: FileCheck2, title: detail.resultStep, body: detail.resultInfo}].map(item => <div key={item.title} className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-black/10 bg-white/70 text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-blue-400"><item.icon size={19} aria-hidden="true" /></span>
        <div><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">{item.body}</p></div>
       </div>)}
      </div>
     </section>
     <section className="w-full max-w-lg overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/60 md:ms-auto" aria-label={copy.completed}>
      <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />
      <div className="p-6 sm:p-8">
       <span className="mb-6 inline-grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"><FileCheck2 size={28} aria-hidden="true" /></span>
       <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">{copy.completed}</p>
       <h2 className="mt-3 text-2xl font-bold">{examTitle?.replace(/\btelc\b[\s-]*/gi, "").trim() || "Deutsch B1"}</h2>
       <div className="mt-5 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200"><Check size={17} className="shrink-0" aria-hidden="true" />{copy.saved}</div>
       <p className="mt-5 text-sm leading-6 text-gray-600 dark:text-gray-300">{copy.message}</p>
       <button className={`${primary} mt-6 w-full`} onClick={() => setOpen(true)}>{copy.continue}<ArrowRight size={17} aria-hidden="true" /></button>
       <p className="mt-4 text-xs leading-5 text-gray-500 dark:text-gray-400">{detail.accessInfo}</p>
      </div>
     </section>
    </div>
   </div>
  </main>
  <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" lang={language} dir={i18n.dir()}
   aria-labelledby="guest-auth-title" aria-describedby="guest-auth-description"
   BackdropProps={{ sx: { backgroundColor: "rgba(15,23,42,0.4)", backdropFilter: "blur(3px)" } }}
   PaperProps={{ sx: { borderRadius: 4, m: 2, width: "calc(100% - 32px)", maxWidth: 480, overflow: "hidden", background: "transparent" } }}>
   <div className="relative border border-black/10 bg-white text-black dark:border-white/10 dark:bg-black dark:text-white">
    <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />
    <IconButton aria-label={copy.close} onClick={() => setOpen(false)} sx={{ position: "absolute", top: 15, insetInlineEnd: 12, color: "inherit" }}><X size={20} /></IconButton>
    <div className="px-6 pb-2 pt-7 sm:px-8"><div className="inline-flex items-center gap-2.5"><img src={Logo} alt="" width={32} height={32} className="h-8 w-8 rounded-md" /><span className="text-base font-semibold tracking-tight">SmartPrüfung</span></div></div>
    <DialogTitle id="guest-auth-title" sx={{ px: {xs: 3, sm: 4}, pt: 2.5, pb: 1, fontWeight: 750, fontSize: {xs: 25, sm: 28}, lineHeight: 1.25, color: "inherit" }}>{copy.title}</DialogTitle>
    <DialogContent sx={{ px: {xs: 3, sm: 4}, pb: 2.5 }}>
     <p id="guest-auth-description" className="text-sm leading-6 text-gray-600 dark:text-gray-300">{copy.message}</p>
     <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"><ShieldCheck size={14} aria-hidden="true" />{copy.saved}</div>
    </DialogContent>
    <DialogActions sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 1.5, px: {xs: 3, sm: 4}, pb: {xs: 3, sm: 4}, pt: 0, "& > :not(style) ~ :not(style)": { ml: 0 } }}>
     <button className={`${primary} min-w-0 break-words`} onClick={() => navigate("/register")}>{copy.register}</button>
     <button className="min-w-0 rounded-xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold text-black transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10" onClick={() => navigate("/login")}>{copy.login}</button>
    </DialogActions>
   </div>
  </Dialog>
 </>;
}
