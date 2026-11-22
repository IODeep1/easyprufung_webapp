import { tr, featureLocale } from "../../localization/feature-i18n";
export type TeacherClass = {
  id: string;
  name: string;
  archived: boolean;
  inviteHash?: string | null;
  inviteExpiresAt?: string | null;
};
export type RosterStudent = {
  studentId: string;
  name: string;
  access: string;
  consentedAt: string;
};
export type Assignment = {
  id: string;
  examCode: string;
  dueAt: string | null;
  className?: string;
  attemptId?: string | null;
  status?: string;
};
export type Offer = {
  id: string;
  studentId: string;
  classId: string;
  className?: string;
  state: string;
  expiresAt: string;
  canAccept?: boolean;
};
export type Wallet = {
  purchased?: number;
  available: number;
  reserved: number;
  activated: number;
  offers: Offer[];
};
export type Quote = {
  quantity: number;
  unitPriceCents: number;
  grossTotalCents: number;
  currency: string;
};
export type Order = {
  id: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  currency: string;
  status: string;
  createdAt: string;
  receiptUrl: string | null;
  supportReview: boolean;
};
export type Performance = {
  assignmentId: string;
  studentId: string;
  examCode: string;
  status: string;
  score?: number;
  maximumScore?: number;
  passed?: boolean;
  sections?: {
    sectionKey: string;
    title: string;
    score: number;
    maximumScore: number;
  }[];
};
export async function teacherApi<T>(
  path: string,
  method = "GET",
  body?: unknown
): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("access-token") || ""}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const error = await response.json();
      message = error.message || error.error || message;
    } catch {}
    throw new Error(message);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
export const money = (cents: number) =>
  new Intl.NumberFormat(featureLocale(), {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
export const date = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString(featureLocale()) : tr("No due date");
export const button =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
export const secondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 disabled:opacity-50";
export const input =
  "rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white";
export const card =
  "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900";
