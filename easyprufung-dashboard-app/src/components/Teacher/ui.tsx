import { tr, useFeatureLocale } from "../../localization/feature-i18n";
import React, { useEffect, useRef } from "react";
import {
  X,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Users,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { button, secondary } from "./api";
export const panel =
  "rounded-2xl border border-black/10 bg-white/90 shadow-sm dark:border-white/10 dark:bg-gray-900";
export const muted = "text-sm leading-6 text-gray-500 dark:text-gray-400";
export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "blue" | "green" | "amber" | "neutral";
}) {
  useFeatureLocale();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        tone === "green"
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
          : tone === "blue"
          ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
          : tone === "amber"
          ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
      }`}
    >
      {children}
    </span>
  );
}
const labels: Record<string, string> = {
  PENDING: "Awaiting acceptance",
  ACCEPTED: "Activated",
  ACTIVATED: "Activated",
  DECLINED: "Declined",
  REVOKED: "Revoked",
  EXPIRED: "Expired",
  PAID: "Paid",
  FAILED: "Payment failed",
  REFUNDED: "Refunded",
  DISPUTED: "Under review",
  SUPPORT_REVIEW: "Support review",
  ASSIGNED: "Not started",
  IN_PROGRESS: "In progress",
  EVALUATED: "Completed",
};
export function Status({ value }: { value: string }) {
  useFeatureLocale();

  return (
    <Badge
      tone={
        ["PAID", "ACCEPTED", "ACTIVATED", "EVALUATED"].includes(value)
          ? "green"
          : ["PENDING", "IN_PROGRESS"].includes(value)
          ? "amber"
          : "neutral"
      }
    >
      {tr(labels[value] || value)}
    </Badge>
  );
}
export function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  useFeatureLocale();

  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-200 px-5 py-12 text-center dark:border-gray-700">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
        <Users size={25} aria-hidden="true" />
      </span>
      <h3 className="text-lg font-semibold">{tr(title)}</h3>
      <p className={`${muted} mt-2 max-w-sm`}>{tr(body)}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
export function Loading({
  text = tr("Loading your workspace…"),
}: {
  text?: string;
}) {
  useFeatureLocale();

  return (
    <div
      role="status"
      className={`${panel} flex min-h-[180px] items-center justify-center gap-3 p-8 text-gray-500`}
    >
      <Loader2
        className="animate-spin text-blue-600"
        size={22}
        aria-hidden="true"
      />
      {tr(text)}
    </div>
  );
}
export function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  useFeatureLocale();

  return (
    <div className={`${panel} flex items-center justify-between gap-3 p-5`}>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{tr(label)}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
      </div>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        <Icon size={21} aria-hidden="true" />
      </span>
    </div>
  );
}
export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  useFeatureLocale();

  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{tr(title)}</h2>
        {description && <p className={`${muted} mt-1`}>{tr(description)}</p>}
      </div>
      {action}
    </div>
  );
}
export function ClassCards({
  classes,
  onCreate,
}: {
  classes: { id: string; name: string; archived: boolean }[];
  onCreate: () => void;
}) {
  useFeatureLocale();

  return classes.length ? (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {classes.map((c) => (
        <Link
          key={c.id}
          to={`/teacher/classes/${c.id}`}
          className={`${panel} group flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:hover:border-blue-700`}
        >
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
              <Users size={22} />
            </span>
            <Badge tone={c.archived ? "neutral" : "green"}>
              {c.archived ? tr("Archived") : tr("Active")}
            </Badge>
          </div>
          <h3 className="mt-5 truncate text-lg font-semibold">{c.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{tr("TELC Deutsch B1")}</p>
          <span className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-sm font-semibold text-blue-600 dark:border-gray-800 dark:text-blue-400">
            {tr("Open class")}
            <ArrowRight
              size={17}
              aria-hidden="true"
              className="rtl:rotate-180"
            />
          </span>
        </Link>
      ))}
    </div>
  ) : (
    <Empty
      title={tr("Your first class starts here")}
      body={tr(
        "Create a class, invite your students and keep their practice in one place."
      )}
      action={
        <button className={button} onClick={onCreate}>
          <Plus size={16} aria-hidden="true" />
          {tr("Create a class")}
        </button>
      }
    />
  );
}
export function Step({
  number,
  title,
  body,
  complete,
  action,
}: {
  number: number;
  title: string;
  body: string;
  complete: boolean;
  action: React.ReactNode;
}) {
  useFeatureLocale();

  return (
    <div className="flex items-start gap-3">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          complete
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
            : "bg-blue-50 text-blue-600 dark:bg-blue-500/10"
        }`}
      >
        {complete ? <CheckCircle2 size={18} aria-hidden="true" /> : number}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold">{tr(title)}</h3>
        <p className={`${muted} mt-1`}>{tr(body)}</p>
        <div className="mt-3">{action}</div>
      </div>
    </div>
  );
}
export function Dialog({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useFeatureLocale();

  const ref = useRef<HTMLDivElement>(null),
    close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const first = el?.querySelector<HTMLElement>(
      "input,select,textarea,button"
    );
    first?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = Array.from(
        el?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]'
        ) || []
      );
      if (!items.length) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey && document.activeElement === items[0]) {
        items[items.length - 1].focus();
        e.preventDefault();
      } else if (
        !e.shiftKey &&
        document.activeElement === items[items.length - 1]
      ) {
        items[0].focus();
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="teacher-dialog-title"
        aria-describedby={
          description ? "teacher-dialog-description" : undefined
        }
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-black/10 bg-white p-6 text-gray-900 shadow-2xl dark:border-white/10 dark:bg-gray-900 dark:text-white"
      >
        <header className="mb-6 pe-8">
          <h2
            id="teacher-dialog-title"
            className="text-xl font-bold tracking-tight"
          >
            {tr(title)}
          </h2>
          {description && (
            <p id="teacher-dialog-description" className={`${muted} mt-2`}>
              {tr(description)}
            </p>
          )}
        </header>
        <button
          className="absolute end-4 top-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label={tr("Close dialog")}
          onClick={onClose}
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}
export function DialogActions({
  busy,
  onClose,
  label,
}: {
  busy: boolean;
  onClose: () => void;
  label: string;
}) {
  useFeatureLocale();

  return (
    <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
      <button
        className={secondary}
        type="button"
        disabled={busy}
        onClick={onClose}
      >
        {tr("Cancel")}
      </button>
      <button className={button} type="submit" disabled={busy}>
        {busy ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {tr("Saving…")}
          </>
        ) : (
          label
        )}
      </button>
    </div>
  );
}
