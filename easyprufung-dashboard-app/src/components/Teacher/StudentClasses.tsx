import { tr, useFeatureLocale } from "../../localization/feature-i18n";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  BookOpen,
  CheckCircle2,
  Ticket,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
  RefreshCw,
  LogOut,
  Link2,
  Loader2,
  Search,
  GraduationCap,
} from "lucide-react";
import {
  teacherApi,
  TeacherClass,
  Assignment,
  Offer,
  date,
  button,
  secondary,
  input,
} from "./api";
import {
  Badge,
  Status,
  Empty,
  Loading,
  Stat,
  SectionHeading,
  Dialog,
  panel,
  muted,
} from "./ui";
import { requestGetUser } from "../../api/user/api-helper";
import { updateUser } from "../../store/actions/user/userAccount.actions";
import { IStateType } from "../../store/models/root.interface";

type Preview = {
  id: string;
  name: string;
  teacher: string;
  sharing: string;
  consentVersion: string;
};
export default function StudentClasses() {
  const { locale, dir } = useFeatureLocale();

  const { token } = useParams(),
    navigate = useNavigate(),
    dispatch = useDispatch();
  const subscription = useSelector(
    (state: IStateType) => state.userAccount.user?.subscription
  );
  const [classes, setClasses] = useState<TeacherClass[]>([]),
    [assignments, setAssignments] = useState<Assignment[]>([]),
    [offers, setOffers] = useState<Offer[]>([]),
    [preview, setPreview] = useState<Preview | null>(null);
  const [consent, setConsent] = useState(false),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [tab, setTab] = useState("classes"),
    [filter, setFilter] = useState("todo"),
    [search, setSearch] = useState(""),
    [joining, setJoining] = useState(false),
    [inviteLink, setInviteLink] = useState(""),
    [inviteError, setInviteError] = useState(""),
    [leaving, setLeaving] = useState<TeacherClass | null>(null),
    [accepting, setAccepting] = useState<Offer | null>(null),
    [starting, setStarting] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (token) {
      setPreview(
        await teacherApi<Preview>(
          `classes/invites/${encodeURIComponent(token)}/preview`
        )
      );
      return;
    }
    const [c, a, o] = await Promise.all([
      teacherApi<TeacherClass[]>("student/classes"),
      teacherApi<Assignment[]>("student/assignments"),
      teacherApi<Offer[]>("student/seat-offers"),
    ]);
    setClasses(c);
    setAssignments(a);
    setOffers(o);
  }, [token]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setConsent(false);
    load()
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load]);
  async function run(action: () => Promise<unknown>): Promise<boolean> {
    if (busy) return false;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      await load();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  const pending = offers.filter((o) => o.state === "PENDING"),
    history = offers.filter((o) => o.state !== "PENDING");
  const todo = assignments.filter(
      (a) => !a.status || ["ASSIGNED", "IN_PROGRESS"].includes(a.status)
    ),
    completed = assignments.filter((a) => a.status === "EVALUATED");
  const visible = assignments
    .filter((a) =>
      filter === "all" || filter === "done"
        ? filter === "all" || a.status === "EVALUATED"
        : !a.status || ["ASSIGNED", "IN_PROGRESS"].includes(a.status)
    )
    .filter((a) =>
      `${a.className} ${a.examCode}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a.status === "IN_PROGRESS" && b.status !== "IN_PROGRESS") return -1;
      if (b.status === "IN_PROGRESS" && a.status !== "IN_PROGRESS") return 1;
      return (
        (a.dueAt ? new Date(a.dueAt).getTime() : Infinity) -
        (b.dueAt ? new Date(b.dueAt).getTime() : Infinity)
      );
    });
  const paid =
    !!subscription &&
    ["b1", "b1_unlimited", "tester"].includes(subscription.plan) &&
    subscription.isActive !== false &&
    subscription.status !== "expired" &&
    (!subscription.endDate ||
      new Date(subscription.endDate).getTime() > Date.now());
  const tabs = [
    {
      key: "classes",
      label: tr("Classes"),
      count: classes.length,
      icon: Users,
    },
    {
      key: "assignments",
      label: tr("Assignments"),
      count: todo.length,
      icon: BookOpen,
    },
    {
      key: "access",
      label: tr("Exam access"),
      count: pending.length,
      icon: Ticket,
    },
  ];
  function joinFromLink(e: React.FormEvent) {
    e.preventDefault();
    setInviteError("");
    try {
      const url = new URL(inviteLink.trim(), window.location.origin);
      if (
        url.origin !== window.location.origin ||
        !/^\/class\/join\/[A-Za-z0-9_-]{43}$/.test(url.pathname)
      )
        throw Error();
      setJoining(false);
      setInviteLink("");
      navigate(url.pathname);
    } catch {
      setInviteError(
        "Paste the full SmartPrüfung invitation link your teacher sent you."
      );
    }
  }
  return (
    <section
      lang={locale}
      dir={dir}
      data-no-translate
      className="mx-auto max-w-7xl space-y-6 px-4 py-6 text-gray-900 dark:text-white sm:px-8 sm:py-8"
    >
      <header className="relative overflow-hidden rounded-2xl border border-black/10 bg-white px-6 py-7 dark:border-white/10 dark:bg-gray-900 sm:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-10 -top-28 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <GraduationCap size={16} />
              {tr("Learning together")}
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {token ? tr("Join a class") : tr("My classes")}
            </h1>
            <p className={`${muted} mt-2 max-w-xl`}>
              {token
                ? tr(
                    "Join your teacher’s class and keep your practice in one place."
                  )
                : tr("Your classes, assignments and next steps — together.")}
            </p>
          </div>
          {!token && (
            <button
              className={button}
              onClick={() => {
                setJoining(true);
                setInviteError("");
              }}
            >
              <UserPlus size={17} />
              {tr("Join a class")}
            </button>
          )}
        </div>
      </header>
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-300"
        >
          <span>{tr(error)}</span>
          <button
            className="font-semibold underline"
            disabled={busy}
            onClick={() => run(load)}
          >
            {tr("Retry")}
          </button>
        </div>
      )}
      {message && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-500/10 dark:text-blue-300"
        >
          {starting ? (
            <Loader2 className="shrink-0 animate-spin" size={18} />
          ) : (
            <CheckCircle2 className="shrink-0" size={18} />
          )}
          <span>{tr(message)}</span>
        </div>
      )}
      {loading ? (
        <Loading
          text={
            token ? tr("Opening your invitation…") : tr("Loading your classes…")
          }
        />
      ) : token ? (
        preview && (
          <div className="mx-auto max-w-2xl">
            <div className={`${panel} p-6 sm:p-8`}>
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                  <Users size={26} />
                </span>
                <div>
                  <Badge tone="green">{tr("Free to join")}</Badge>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight">
                    {preview.name}
                  </h2>
                  <p className={`${muted} mt-1`}>
                    {tr("Teacher:")} {preview.teacher}
                  </p>
                </div>
              </div>
              <p className={`${muted} my-6`}>
                {tr(
                  "Joining is free. No exam access is purchased or activated automatically."
                )}
              </p>
              <div className="rounded-xl bg-gray-50 p-5 dark:bg-gray-800">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck size={18} className="text-blue-600" />
                  {tr("You control what you share")}
                </h3>
                <p className={`${muted} mt-3`}>{tr(preview.sharing)}</p>
              </div>
              <label className="my-6 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 text-sm leading-6 dark:border-gray-700">
                <input
                  className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  {tr(
                    "I agree to share my class-linked exam performance with this teacher. I can withdraw permission by leaving the class."
                  )}
                </span>
              </label>
              <button
                className={`${button} w-full`}
                disabled={busy || !consent}
                onClick={() =>
                  run(async () => {
                    await teacherApi(
                      `classes/invites/${encodeURIComponent(token)}/join`,
                      "POST",
                      { consent }
                    );
                    navigate("/my-classes");
                  })
                }
              >
                {busy ? tr("Joining…") : tr("Agree and join class — free")}
                <ArrowRight size={16} className="rtl:rotate-180" />
              </button>
              <Link
                to="/my-classes"
                className="mt-4 block text-center text-sm font-semibold text-gray-500"
              >
                {tr("Back to my classes")}
              </Link>
            </div>
          </div>
        )
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat
              label={tr("Active classes")}
              value={classes.filter((c) => !c.archived).length}
              icon={Users}
            />
            <Stat
              label={tr("Assignments to do")}
              value={todo.length}
              icon={BookOpen}
            />
            <Stat
              label={tr("Completed")}
              value={completed.length}
              icon={CheckCircle2}
            />
          </div>
          {pending.length > 0 && tab !== "access" && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-5 dark:border-blue-900 dark:bg-blue-500/5">
              <div className="flex items-start gap-3">
                <Ticket className="mt-1 shrink-0 text-blue-600" size={22} />
                <div>
                  <h2 className="font-semibold">
                    {pending.length === 1
                      ? tr("Your teacher has offered you exam access")
                      : tr("{{count}} exam access offers need your reply", {
                          count: pending.length,
                        })}
                  </h2>
                  <p className={`${muted} mt-1`}>
                    {tr(
                      "10 mock exams and 60 days of practice. Access starts when you accept."
                    )}
                  </p>
                </div>
              </div>
              <button className={secondary} onClick={() => setTab("access")}>
                {tr(pending.length === 1 ? "Review offer" : "Review offers")}
                <ArrowRight size={16} className="rtl:rotate-180" />
              </button>
            </div>
          )}
          <nav
            aria-label={tr("My classes sections")}
            className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800"
          >
            {tabs.map(({ key, label, count, icon: Icon }) => (
              <button
                key={key}
                aria-pressed={tab === key}
                onClick={() => setTab(key)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  tab === key
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon size={16} />
                {tr(label)}
                <span
                  className={`rounded-md px-1.5 py-0.5 text-xs ${
                    tab === key
                      ? "bg-blue-50 dark:bg-blue-500/10"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </nav>
          {tab === "classes" && (
            <>
              <SectionHeading
                title={tr("Your classes")}
                description={tr(
                  "Keep your class practice and sharing preferences together."
                )}
                action={
                  todo.length > 0 ? (
                    <button
                      className="flex items-center gap-1 text-sm font-semibold text-blue-600"
                      onClick={() => setTab("assignments")}
                    >
                      {tr("See your assignments")}
                      <ArrowRight size={15} className="rtl:rotate-180" />
                    </button>
                  ) : undefined
                }
              />
              {!classes.length ? (
                <Empty
                  title={tr("Learn together with your class")}
                  body={tr(
                    "Ask your teacher for an invitation link, then join for free. Your assignments will appear here."
                  )}
                  action={
                    <button className={button} onClick={() => setJoining(true)}>
                      <Link2 size={16} />
                      {tr("I have an invitation link")}
                    </button>
                  }
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {classes.map((c) => (
                    <article key={c.id} className={`${panel} p-5`}>
                      <div className="flex items-center justify-between">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                          <Users size={22} />
                        </span>
                        <Badge tone={c.archived ? "neutral" : "green"}>
                          {c.archived ? tr("Archived") : tr("Active")}
                        </Badge>
                      </div>
                      <h3 className="mt-5 text-lg font-semibold">{c.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {tr("TELC Deutsch B1")}
                      </p>
                      <div className="mt-5 flex items-center justify-between gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <ShieldCheck size={14} />
                          {c.archived
                            ? tr("Sharing stopped")
                            : tr("Sharing enabled")}
                        </span>
                        <button
                          className="text-xs font-semibold text-gray-500 hover:text-blue-600"
                          disabled={busy}
                          onClick={() => setLeaving(c)}
                        >
                          {tr("Sharing settings")}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
                <ShieldCheck
                  className="mt-0.5 shrink-0 text-blue-600"
                  size={20}
                />
                <div>
                  <h2 className="text-sm font-semibold">
                    {tr("Your personal practice stays private")}
                  </h2>
                  <p className={`${muted} mt-1`}>
                    {tr(
                      "Only class-linked results are shared with your teacher. Leaving a class stops sharing and keeps your exam history and activated paid access."
                    )}
                  </p>
                </div>
              </div>
            </>
          )}
          {tab === "assignments" && (
            <div className={`${panel} p-5 sm:p-6`}>
              <SectionHeading
                title={tr("Assigned practice")}
                description={tr(
                  "Continue an exam or start your next assignment."
                )}
                action={
                  <button
                    className={secondary}
                    disabled={busy}
                    onClick={() => run(load)}
                  >
                    <RefreshCw
                      size={15}
                      className={busy ? "animate-spin" : ""}
                    />
                    {tr("Refresh")}
                  </button>
                }
              />
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex rounded-xl bg-gray-100 p-1 text-sm dark:bg-gray-800">
                  {[
                    ["todo", tr("To do")],
                    ["done", tr("Completed")],
                    ["all", tr("All")],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      aria-pressed={filter === key}
                      className={`rounded-lg px-3 py-1.5 ${
                        filter === key
                          ? "bg-white font-semibold shadow-sm dark:bg-gray-700"
                          : "text-gray-500"
                      }`}
                      onClick={() => setFilter(key)}
                    >
                      {tr(label)}
                    </button>
                  ))}
                </div>
                <div className="relative w-full sm:w-auto">
                  <Search
                    size={16}
                    className="pointer-events-none absolute start-3 top-3 text-gray-400"
                  />
                  <label
                    className="sr-only"
                    htmlFor="student-assignment-search"
                  >
                    {tr("Search assignments")}
                  </label>
                  <input
                    id="student-assignment-search"
                    className={`${input} w-full ps-9 sm:w-56`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={tr("Find a class or exam…")}
                  />
                </div>
              </div>
              {!visible.length ? (
                <Empty
                  title={
                    search
                      ? tr("No matching assignments")
                      : filter === "done"
                      ? tr("Your completed exams will appear here")
                      : assignments.length
                      ? tr("You’re all caught up")
                      : tr("No assignments yet")
                  }
                  body={
                    search
                      ? tr("Try another class name or clear your search.")
                      : filter === "done"
                      ? tr("Finish an assigned exam to see it here.")
                      : tr(
                          "Your teacher’s next assignment will appear here when it’s ready."
                        )
                  }
                />
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {visible.map((a) => {
                    const done = a.status === "EVALUATED",
                      running = a.status === "IN_PROGRESS",
                      overdue =
                        !!a.dueAt &&
                        new Date(a.dueAt).getTime() < Date.now() &&
                        !done;
                    return (
                      <article
                        key={a.id}
                        className="rounded-xl border border-gray-200 p-5 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                            <BookOpen size={20} />
                          </span>
                          <Status value={a.status || "ASSIGNED"} />
                        </div>
                        <p className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400">
                          {a.className || tr("Your class")}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold">
                          {tr("TELC Deutsch B1 mock exam")}
                        </h3>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <Calendar size={14} />
                          {a.dueAt
                            ? tr("Due {{date}}", { date: date(a.dueAt) })
                            : tr("No due date")}
                          {overdue && (
                            <Badge tone="amber">{tr("Past due")}</Badge>
                          )}
                        </div>
                        <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
                          {a.attemptId ? (
                            <Link
                              className={done ? secondary : button}
                              to={
                                done
                                  ? `/exams/${a.attemptId}/review`
                                  : running
                                  ? "/"
                                  : "/exams"
                              }
                            >
                              {done
                                ? tr("Review result")
                                : running
                                ? tr("Continue exam")
                                : tr("View exam history")}
                              <ArrowRight
                                size={16}
                                className="rtl:rotate-180"
                              />
                            </Link>
                          ) : (
                            <button
                              className={button}
                              disabled={busy}
                              onClick={async () => {
                                setStarting(a.id);
                                await run(async () => {
                                  setMessage("Preparing your assigned exam…");
                                  await teacherApi(
                                    `student/assignments/${a.id}/start`,
                                    "POST"
                                  );
                                  navigate("/");
                                });
                                setStarting(null);
                              }}
                            >
                              {starting === a.id ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  {tr("Preparing exam…")}
                                </>
                              ) : (
                                <>
                                  {tr("Start assigned exam")}
                                  <ArrowRight
                                    size={16}
                                    className="rtl:rotate-180"
                                  />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
              <p className="mt-5 text-xs leading-5 text-gray-400">
                {tr(
                  "Assignments use your normal exam access and attempt allowance. No extra attempts are charged."
                )}
              </p>
            </div>
          )}
          {tab === "access" && (
            <>
              <div className={`${panel} p-6`}>
                <SectionHeading
                  title={tr("Your exam access")}
                  description={tr(
                    "Use your own plan or accept an offer from your teacher."
                  )}
                />
                {paid ? (
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-emerald-50 p-5 dark:bg-emerald-500/10">
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        size={24}
                        className="shrink-0 text-emerald-600"
                      />
                      <div>
                        <h3 className="font-semibold">
                          {subscription?.plan === "b1_unlimited"
                            ? tr("Unlimited exam access")
                            : tr("{{count}} exams remaining", {
                                count: subscription?.quota || 0,
                              })}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {subscription?.type === "teacher_seat"
                            ? tr("Funded by your teacher")
                            : tr("Your personal access")}
                          {subscription?.endDate
                            ? " · " +
                              tr("Until {{date}}", {
                                date: date(subscription.endDate),
                              })
                            : ""}
                        </p>
                      </div>
                    </div>
                    <Link className={secondary} to="/new">
                      {tr("Practise now")}
                      <ArrowRight size={16} className="rtl:rotate-180" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gray-50 p-5 dark:bg-gray-800">
                    <div>
                      <h3 className="font-semibold">
                        {tr("Choose how to access more practice")}
                      </h3>
                      <p className={`${muted} mt-1`}>
                        {tr(
                          "Buy your own access, or accept a teacher’s offer below."
                        )}
                      </p>
                    </div>
                    <Link className={secondary} to="/pricing">
                      {tr("View exam plans")}
                      <ArrowRight size={16} className="rtl:rotate-180" />
                    </Link>
                  </div>
                )}
              </div>
              <div className={`${panel} p-5 sm:p-6`}>
                <SectionHeading
                  title={tr("Offers from your teacher")}
                  description={tr(
                    "No payment is needed to accept a teacher-funded offer."
                  )}
                />
                {!pending.length ? (
                  <Empty
                    title={tr("No offers waiting for a reply")}
                    body={tr(
                      "When your teacher offers exam access, you can review and accept it here."
                    )}
                  />
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {pending.map((o) => (
                      <article
                        key={o.id}
                        className="rounded-xl border border-blue-200 bg-blue-50/40 p-5 dark:border-blue-900 dark:bg-blue-500/5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10">
                            <Ticket size={21} />
                          </span>
                          <Badge tone="amber">
                            {tr("Awaiting your reply")}
                          </Badge>
                        </div>
                        <p className="mt-4 text-xs font-semibold text-blue-600">
                          {o.className}
                        </p>
                        <h3 className="mt-1 text-xl font-bold">
                          {tr("10 mock exams · 60 days")}
                        </h3>
                        <p className={`${muted} mt-3`}>
                          {tr(
                            "Access starts when you accept. You keep it if you leave the class."
                          )}
                        </p>
                        <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock size={14} />
                          {tr("Reply by")} {date(o.expiresAt)}
                        </p>
                        {!o.canAccept && (
                          <p className="mt-4 rounded-lg bg-white p-3 text-xs leading-5 text-gray-500 dark:bg-gray-900">
                            {tr(
                              "You already have paid access. You can decline this offer or wait until your access expires."
                            )}
                          </p>
                        )}
                        <div className="mt-5 flex flex-wrap gap-2">
                          <button
                            className={button}
                            disabled={busy || !o.canAccept}
                            onClick={() => setAccepting(o)}
                          >
                            {tr("Accept offer")}
                            <ArrowRight size={16} className="rtl:rotate-180" />
                          </button>
                          <button
                            className={secondary}
                            disabled={busy}
                            onClick={() =>
                              run(async () => {
                                await teacherApi(
                                  `student/seat-offers/${o.id}/decline`,
                                  "POST"
                                );
                                setMessage(
                                  "Offer declined. No changes were made to your exam access."
                                );
                              })
                            }
                          >
                            {tr("Decline")}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
                {history.length > 0 && (
                  <details className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-800">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-500">
                      {tr("Previous offers ({{count}})", {
                        count: history.length,
                      })}
                    </summary>
                    <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-800">
                      {history.map((o) => (
                        <div
                          key={o.id}
                          className="flex flex-wrap items-center justify-between gap-3 py-3"
                        >
                          <div>
                            <p className="text-sm font-semibold">
                              {o.className}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {tr("10 mock exams · 60-day pass")}
                            </p>
                          </div>
                          <Status value={o.state} />
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </>
          )}
        </>
      )}
      {joining && (
        <Dialog
          title={tr("Join a class")}
          description={tr(
            "Your teacher will send you a private invitation link. Paste it below to review the class before joining."
          )}
          onClose={() => setJoining(false)}
        >
          <form onSubmit={joinFromLink}>
            <label
              htmlFor="student-invite-link"
              className="block text-sm font-semibold"
            >
              {tr("Invitation link")}
            </label>
            <input
              id="student-invite-link"
              className={`${input} mt-2 w-full`}
              required
              type="text"
              value={inviteLink}
              onChange={(e) => setInviteLink(e.target.value)}
              placeholder={tr("Paste your teacher’s invitation link")}
            />
            {inviteError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {tr(inviteError)}
              </p>
            )}
            <p className={`${muted} mt-4`}>
              {tr(
                "You’ll see which results are shared before you agree to join."
              )}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className={secondary}
                type="button"
                onClick={() => setJoining(false)}
              >
                {tr("Cancel")}
              </button>
              <button className={button} type="submit">
                {tr("Review invitation")}
                <ArrowRight size={16} className="rtl:rotate-180" />
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {leaving && (
        <Dialog
          title={tr("Class sharing settings")}
          description={leaving.name}
          onClose={() => {
            if (!busy) setLeaving(null);
          }}
        >
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck size={17} className="text-blue-600" />
              {leaving.archived
                ? tr("This class is archived")
                : tr("Sharing is enabled for this class")}
            </h3>
            <p className={`${muted} mt-3`}>
              {leaving.archived
                ? tr(
                    "This class no longer shares exam performance. You can leave to remove it from your class list."
                  )
                : tr(
                    "Your teacher can see class-linked completion, scores and section results. Your personal practice, raw answers and writing stay private."
                  )}
            </p>
          </div>
          <h3 className="mt-5 text-sm font-semibold">
            {tr("Leave and stop sharing")}
          </h3>
          <p className={`${muted} mt-2`}>
            {tr(
              "Leaving removes you from this class and stops sharing your results. Your personal exam history and activated paid access stay with you."
            )}
          </p>
          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {tr(error)}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              className={secondary}
              disabled={busy}
              onClick={() => setLeaving(null)}
            >
              {tr("Keep class")}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              disabled={busy}
              onClick={async () => {
                const clazz = leaving;
                const ok = await run(async () => {
                  await teacherApi(`student/classes/${clazz.id}/leave`, "POST");
                  setMessage(
                    tr(
                      "You left {{name}}. Your exam history and activated access are kept.",
                      { name: clazz.name }
                    )
                  );
                });
                if (ok) setLeaving(null);
              }}
            >
              <LogOut size={16} />
              {busy ? tr("Leaving…") : tr("Leave class")}
            </button>
          </div>
        </Dialog>
      )}
      {accepting && (
        <Dialog
          title={tr("Accept your exam access")}
          description={accepting.className}
          onClose={() => {
            if (!busy) setAccepting(null);
          }}
        >
          <div className="rounded-xl bg-blue-50 p-5 dark:bg-blue-500/10">
            <h3 className="flex items-center gap-2 font-semibold">
              <Ticket size={21} className="text-blue-600" />
              {tr("10 mock exams")}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {tr("Your 60 days of access begin when you confirm.")}
            </p>
          </div>
          <p className={`${muted} mt-4`}>
            {tr(
              "Your teacher has already funded this access. You won’t be charged, and you keep the access if you leave the class."
            )}
          </p>
          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {tr(error)}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              className={secondary}
              disabled={busy}
              onClick={() => setAccepting(null)}
            >
              {tr("Not now")}
            </button>
            <button
              className={button}
              disabled={busy}
              onClick={async () => {
                const ok = await run(async () => {
                  const r = await teacherApi<{
                    state: string;
                    message?: string;
                  }>(`student/seat-offers/${accepting.id}/accept`, "POST");
                  const user = await requestGetUser(dispatch);
                  if (user) dispatch(updateUser(user));
                  setMessage(
                    r.message ||
                      (r.state === "ACCEPTED"
                        ? "Your exam access is active: 10 exams for 60 days."
                        : "The offer status has changed. Please review your access.")
                  );
                });
                if (ok) setAccepting(null);
              }}
            >
              {busy ? tr("Activating…") : tr("Confirm and start access")}
              <CheckCircle2 size={16} />
            </button>
          </div>
        </Dialog>
      )}
    </section>
  );
}
