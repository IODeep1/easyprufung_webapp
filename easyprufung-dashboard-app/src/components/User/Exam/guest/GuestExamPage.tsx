import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { IStateType } from "../../../../store/models/root.interface";
import { ExamProgress, getExamProgress, getExamResult, submitExamSession } from "../../../../api/exam/api-helper";
import { requestGetUser } from "../../../../api/user/api-helper";
import { updateUser } from "../../../../store/actions/user/userAccount.actions";
import { loadExamProgress } from "../exam-storage";
import type { ExamSessionView, ExamResultView, SubmitExamRequest } from "../models/exam";
import { ExamRunnerPage } from "../ExamRunnerPage";
import ExamLanguageLock from "../ExamLanguageLock";
import { ResultPage } from "../ResultPage";
import { LoadingScreen } from "../components/ExamChrome";
import GuestAuthChoice from "./GuestAuthChoice";
import GuestSubmissionPage from "./GuestSubmissionPage";
import { completeGuest, claimGuest, ensureGuest, guestRequest, readGuest, saveGuest, saveGuestProgress, GuestView } from "./guest-api";
import { guestCopy } from "./guest-copy";

function submitSavedExam(session: ExamSessionView, progress: ExamProgress) {
 return submitExamSession(session.sessionId, {compactAnswers: null,
  answers: session.exercises.flatMap(part => part.questions.map(q => ({questionNumber: q.number,
   selectedOptionKeys: progress.answers[q.number]?.selectedOptionKeys || [],
   text: q.type === "FREE_TEXT" ? progress.answers[q.number]?.text || "" : null}))) });
}

export default function GuestExamPage() {
 const user = useSelector((s: IStateType) => s.userAccount.user);
 const navigate = useNavigate(), dispatch = useDispatch<any>();
 const { t, i18n } = useTranslation(); const copy = guestCopy(i18n.resolvedLanguage || i18n.language);
 const [session, setSession] = useState<ExamSessionView | null>(null);
 const [progress, setProgress] = useState<ExamProgress | null>(null);
 const [result, setResult] = useState<ExamResultView | null>(null);
 const [screen, setScreen] = useState("loading"), [error, setError] = useState("");
 const [refresh, setRefresh] = useState(0), [busy, setBusy] = useState(false);
 const [preparation, setPreparation] = useState<{ startedAt: number; durationMs: number } | null>(null);
 const userId = user?.uuid;
 function showFailure(_cause:unknown) {
  navigate("/", {replace:true});
 }
 useEffect(() => {
  let alive = true;
  let preparationTimer: number | undefined;
  let completeDelay: (() => void) | undefined;
  setError(""); setScreen("loading"); setPreparation(null); setBusy(false);
  const fail = (cause:unknown) => {if (alive) showFailure(cause);};
  const restore = async () => {
   const saved = readGuest();
   if (userId && !saved) { navigate("/", {replace: true}); return; }
   const guest = await ensureGuest();
   if (userId && (guest.pending || guest.completed)) {
    const claimed = await claimGuest(guest.token);
    const draft = await getExamProgress(claimed.sessionId);
    const evaluated = claimed.status === "EVALUATED" ? await getExamResult(claimed.sessionId) : null;
    if (!alive) return;
    setSession(claimed); setProgress(draft); setResult(evaluated);
    if (evaluated) { completeGuest(guest.token); setScreen("result"); return; }
    setScreen("ready"); setBusy(true);
    try {
     const completed = await submitSavedExam(claimed, draft);
     if (!alive) return;
     completeGuest(guest.token);
     setResult(completed); setScreen("result");
     const current = await requestGetUser(dispatch).catch(() => undefined);
     if (alive && current?.uuid === userId) dispatch(updateUser(current));
    } catch (cause) {
     fail(cause);
    } finally { if (alive) setBusy(false); }
    return;
   }
   const restored = await guestRequest<GuestView>(guest.token, "");
   if (!alive) return;
   let active = restored.session;
   if (!active) {
    const startedAt = performance.now();
    setPreparation({ startedAt, durationMs: 90000 });
    active = await guestRequest<ExamSessionView>(guest.token, "/start", {method: "POST"});
    if (!alive) return;
    const durationMs = performance.now() - startedAt <= 10000 ? 10000 : 90000;
    setPreparation({ startedAt, durationMs });
    const remaining = Math.max(0, durationMs - (performance.now() - startedAt));
    if (remaining > 0) await new Promise<void>(resolve => {
     completeDelay = resolve;
     preparationTimer = window.setTimeout(resolve, remaining);
    });
    if (!alive) return;
   }
   const state = restored.session ? restored : await guestRequest<GuestView>(guest.token, "");
   if (!alive) return;
   saveGuest({...guest, sessionId: active.sessionId, pending: state.finished});
   // A finish response can be lost before the local marker is updated. If the user
   // has since signed in, recover the finished server draft without another auth popup.
   if (state.finished && userId) { setRefresh(value => value + 1); return; }
   const draft = state.progress || { revision: 0, index: 0, answers: {} };
   const local = loadExamProgress(active.sessionId);
   // Keep the most recent local answers if the browser closed before autosave reached the server.
   const merged = local && !state.finished ? {...draft, index: local.index, answers: {...draft.answers, ...local.answers}} : draft;
   const synced = JSON.stringify(merged) !== JSON.stringify(draft) ? await saveGuestProgress(guest.token, merged) : draft;
   if (!alive) return;
   setProgress(synced);
   setSession(active); setScreen(state.finished ? "register" : "exam");
  };
  void restore().catch(fail);
  return () => {
   alive = false;
   if (preparationTimer !== undefined) window.clearTimeout(preparationTimer);
   completeDelay?.();
  };
 }, [userId, refresh, navigate, dispatch]);

 const requireRegistration = async (draft:ExamProgress) => {
  try {
   const guest=readGuest();if(!guest || !session)throw new Error("Guest exam unavailable");
   saveGuest({...guest,sessionId:session.sessionId,pending:false});
   setProgress(draft);setScreen("register");
  }catch(cause){showFailure(cause);}
 };
 const checkpoint=session?.exercises.findIndex(part=>part.sectionKey?.toUpperCase()==="SPRACHBAUSTEINE") ?? -1;
 const finish = async (_: SubmitExamRequest) => {
  try {
   const guest = readGuest(); if (!guest) throw new Error("The saved guest exam is unavailable.");
   await guestRequest(guest.token, "/finish", {method: "POST"});
   saveGuest({...guest, pending: true});
   setRefresh(v => v + 1);
  } catch (cause) { showFailure(cause); }
 };
 // Failed attempts can be retried through the same claim/restore path. Already evaluated
 // sessions load their stored result, so reloads never intentionally resubmit them.
 const submit = () => { if (!busy) setRefresh(v => v + 1); };
 if (screen === "loading" && preparation) return <LoadingScreen message={t("examPreparation.loadingMessage")} durationMs={preparation.durationMs} startedAt={preparation.startedAt} />;
 if (screen === "loading") return <main className="grid min-h-screen place-items-center p-8" role="status">{copy.loading}</main>;
 if (screen === "exam" && session && progress) return <>
  <ExamLanguageLock><ExamRunnerPage key={session.sessionId} session={session} initialProgress={progress} onSubmit={finish}
   registrationRequiredFrom={!userId && checkpoint>=0 ? checkpoint : undefined} onRegistrationRequired={requireRegistration}
   saveProgress={(id, draft) => { const guest = readGuest(); if (!guest) { const error=new Error("Guest token unavailable");showFailure(error);return Promise.reject(error); } return saveGuestProgress(guest.token, draft).catch(error => { showFailure(error); throw error; }); }} preserveProgressOnSubmit /></ExamLanguageLock>
 </>;
 if (screen === "register") return <GuestAuthChoice continueExam={!readGuest()?.pending} examTitle={session?.title} />;
 if (screen === "result" && session && result) return <ResultPage showBrand session={session} result={result} onRestart={() => navigate("/new")} />;
 return <GuestSubmissionPage examTitle={session?.title} ready={screen === "ready"} busy={busy} error={error}
  onSubmit={() => void submit()} onRetry={() => setRefresh(v => v + 1)}
  onPlans={userId ? () => navigate("/pricing") : undefined} />;
}
