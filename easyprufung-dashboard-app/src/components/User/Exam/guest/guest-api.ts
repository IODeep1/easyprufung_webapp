import { ExamApiError, ExamProgress } from "../../../../api/exam/api-helper";
import type { ExamSessionView } from "../models/exam";
const key = "smartpruefung:guest-exam:v1";
export type GuestState = { token: string; pending?: boolean; sessionId?: string; completed?: boolean };
export function readGuest(): GuestState | null {
    try { const value = JSON.parse(localStorage.getItem(key) || "null"); return value && typeof value.token === "string" ? value : null; } catch { return null; }
}
export function saveGuest(value: GuestState) { localStorage.setItem(key, JSON.stringify(value)); }
export const guestStateEvent = "smartpruefung:guest-state";
export function completeGuest(token:string) {
    // Do not clear a newer guest draft created in another tab while a request was running.
    if(readGuest()?.token!==token)return;
    try { saveGuest({...readGuest()!,pending:false,completed:true}); } catch { return; }
    try { window.dispatchEvent(new Event(guestStateEvent)); } catch {}
}
export function authDestination() { let classroom:string|null=null;try{classroom=sessionStorage.getItem("smartpruefung:class-auth-return");}catch{} if(classroom && (/^\/teacher(?:\/|$)/.test(classroom)||/^\/class\/join\/[A-Za-z0-9_-]{43}$/.test(classroom)||classroom==="/my-classes"||/^\/purchase\?plan=b1(?:_unlimited)?$/.test(classroom)))return classroom; const guest = readGuest(); return guest && (guest.pending || guest.sessionId) ? "/guest-exam" : "/"; }
export async function guestRequest<T>(token: string | null, suffix: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`/public/exams/guest${suffix}`, { ...init, headers: { ...(token ? { "X-Guest-Token": token } : {}), ...(init.body ? { "Content-Type": "application/json" } : {}) } });
    if (!response.ok) { let message = `Request failed (${response.status})`; try { message = (await response.json()).message || message; } catch {} throw new ExamApiError(response.status, message); }
    return response.status === 204 ? undefined as T : response.json();
}
let creating: Promise<GuestState> | null = null;
export async function ensureGuest(): Promise<GuestState> {
    const existing = readGuest(); if (existing) return existing;
    // Check storage before allocating a server exam; a token must survive registration/reloads.
    localStorage.setItem(key + ":check", "1"); localStorage.removeItem(key + ":check");
    if (!creating) creating = guestRequest<{token: string}>(null, "", {method: "POST"}).then(value => { saveGuest(value); return value; }).finally(() => { creating = null; });
    return creating;
}
export type GuestView = { session?: ExamSessionView; progress?: ExamProgress; finished: boolean };
export function saveGuestProgress(token: string, progress: ExamProgress) { return guestRequest<ExamProgress>(token, "/progress", { method: "PUT", body: JSON.stringify(progress), keepalive: true }); }
export async function claimGuest(token: string): Promise<ExamSessionView> {
    const response = await fetch("/api/exams/sessions/guest/claim", { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("access-token") || ""}`, "X-Guest-Token": token } });
    if (!response.ok) { let message = `Unable to restore exam (${response.status})`; try { message = (await response.json()).message || message; } catch {} throw new ExamApiError(response.status, message); }
    return response.json();
}

