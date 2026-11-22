import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  BookOpen,
  BarChart3,
  Plus,
  UserPlus,
  Settings,
  Copy,
  RefreshCw,
  Ticket,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Calendar,
  Link2,
} from "lucide-react";
import {
  teacherApi,
  TeacherClass,
  RosterStudent,
  Assignment,
  Performance,
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
  SectionHeading,
  Dialog,
  DialogActions,
  panel,
  muted,
} from "./ui";

type Props = {
  id: string;
  busy: boolean;
  availableSeats: number;
  run: (fn: () => Promise<unknown>) => Promise<boolean>;
  notify: (text: string) => void;
};
export default function TeacherClassDetail({
  id,
  busy,
  run,
  notify,
  availableSeats,
}: Props) {
  const [clazz, setClazz] = useState<TeacherClass | null>(null),
    [students, setStudents] = useState<RosterStudent[]>([]),
    [assignments, setAssignments] = useState<Assignment[]>([]),
    [performance, setPerformance] = useState<Performance[]>([]),
    [exams, setExams] = useState<{ code: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [tab, setTab] = useState("students"),
    [dialog, setDialog] = useState<
      "invite" | "assign" | "settings" | "offer" | null
    >(null),
    [formError, setFormError] = useState(""),
    [invite, setInvite] = useState(""),
    [copied, setCopied] = useState(false),
    [inviteLoading, setInviteLoading] = useState(false),
    [examCode, setExamCode] = useState(""),
    [due, setDue] = useState(""),
    [audience, setAudience] = useState("all"),
    [selected, setSelected] = useState<string[]>([]),
    [rename, setRename] = useState(""),
    [offering, setOffering] = useState<RosterStudent | null>(null),
    [search, setSearch] = useState("");
  const load = useCallback(async () => {
    const [c, s, a, p, e] = await Promise.all([
      teacherApi<TeacherClass>(`teacher/classes/${id}`),
      teacherApi<RosterStudent[]>(`teacher/classes/${id}/students`),
      teacherApi<Assignment[]>(`teacher/classes/${id}/assignments`),
      teacherApi<Performance[]>(`teacher/classes/${id}/performance`),
      teacherApi<{ code: string; title: string }[]>("teacher/exams"),
    ]);
    setClazz(c);
    setRename(c.name);
    setStudents(s);
    setAssignments(a);
    setPerformance(p);
    setExams(e);
    setExamCode((v) => v || e[0]?.code || "");
  }, [id]);
  useEffect(() => {
    let active = true;
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
  const open = (value: typeof dialog) => {
    setFormError("");
    setDialog(value);
    if (value === "invite") {
      setInvite("");
      setCopied(false);
      setInviteLoading(true);
      teacherApi<{ active: boolean; token?: string }>(`teacher/classes/${id}/invites`)
        .then((r) => setInvite(r.active && r.token ? `${window.location.origin}/class/join/${r.token}` : ""))
        .catch((e) => setFormError(e instanceof Error ? e.message : "Could not load invitation. Please reopen this dialog to try again."))
        .finally(() => setInviteLoading(false));
    }
  };
  const close = () => {
    if (!busy) setDialog(null);
  };
  async function action(fn: () => Promise<unknown>) {
    setFormError("");
    return run(async () => {
      try {
        await fn();
        await load();
      } catch (e) {
        setFormError(e instanceof Error ? e.message : "Please try again.");
        throw e;
      }
    });
  }
  if (loading) return <Loading text="Loading your class…" />;
  if (error)
    return (
      <div role="alert" className={`${panel} p-6`}>
        <p>{error}</p>
        <button
          className={`${secondary} mt-4`}
          onClick={() => {
            setError("");
            load().catch((e) => setError(e.message));
          }}
        >
          Try again
        </button>
      </div>
    );
  if (!clazz) return null;
  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  const completed = performance.filter((p) => p.status === "EVALUATED").length;
  const hasInvite = Boolean(
    clazz.inviteHash &&
      clazz.inviteExpiresAt &&
      new Date(clazz.inviteExpiresAt).getTime() > Date.now()
  );
  const tabs = [
    { key: "students", label: "Students", count: students.length, icon: Users },
    {
      key: "assignments",
      label: "Assignments",
      count: assignments.length,
      icon: BookOpen,
    },
    { key: "progress", label: "Progress", count: completed, icon: BarChart3 },
  ];
  return (
    <>
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600"
        to="/teacher/classes"
      >
        <ArrowLeft size={16} />
        All classes
      </Link>
      <div className={`${panel} p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 p-4 text-blue-600 dark:bg-blue-500/10">
              <Users size={24} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight">
                  {clazz.name}
                </h2>
                <Badge tone={clazz.archived ? "neutral" : "green"}>
                  {clazz.archived ? "Archived" : "Active"}
                </Badge>
              </div>
              <p className={`${muted} mt-2`}>
                TELC Deutsch B1 · {students.length}{" "}
                {students.length === 1 ? "student" : "students"} ·{" "}
                {assignments.length} assignments
              </p>
            </div>
          </div>
          {!clazz.archived && (
            <button className={secondary} onClick={() => open("settings")}>
              <Settings size={16} />
              Class settings
            </button>
          )}
        </div>
        {!clazz.archived && (
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <button
              className={button}
              disabled={busy}
              onClick={() => open("invite")}
            >
              <UserPlus size={17} />
              Invite students
            </button>
            <button
              className={secondary}
              disabled={busy || !students.length}
              onClick={() => open("assign")}
            >
              <Plus size={17} />
              Assign exam
            </button>
            {!students.length && (
              <p className="text-xs text-gray-500">
                Invite a student to unlock assignments.
              </p>
            )}
          </div>
        )}
      </div>
      <div className={panel}>
        <div
          role="tablist"
          aria-label="Class sections"
          className="flex gap-2 overflow-x-auto border-b border-gray-100 px-5 dark:border-gray-800"
        >
          {tabs.map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              role="tab"
              id={`tab-${key}`}
              aria-controls={`panel-${key}`}
              aria-selected={tab === key}
              tabIndex={tab === key ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const next =
                    tabs[
                      (tabs.findIndex((t) => t.key === key) +
                        (e.key === "ArrowRight" ? 1 : tabs.length - 1)) %
                        tabs.length
                    ].key;
                  setTab(next);
                  document.getElementById(`tab-${next}`)?.focus();
                }
              }}
              onClick={() => setTab(key)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-4 text-sm font-semibold ${
                tab === key
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500"
              }`}
            >
              <Icon size={16} />
              {label}
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
        </div>
        <div
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          className="p-5 sm:p-6"
        >
          {tab === "students" && (
            <>
              <SectionHeading
                title="Class roster"
                description="See who has joined and whether they have exam access."
                action={
                  students.length > 0 ? (
                    <>
                      <label className="sr-only" htmlFor="find-student">
                        Find a student
                      </label>
                      <input
                        id="find-student"
                        className={`${input} w-full sm:w-auto`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Find a student…"
                      />
                    </>
                  ) : undefined
                }
              />
              {!students.length ? (
                <Empty
                  title="Your students will appear here"
                  body="Send them a private invitation link. Joining your class is free."
                  action={
                    !clazz.archived ? (
                      <button className={button} onClick={() => open("invite")}>
                        <UserPlus size={16} />
                        Invite your first student
                      </button>
                    ) : undefined
                  }
                />
              ) : !filtered.length ? (
                <p className={`${muted} py-8 text-center`}>
                  No students match your search.
                </p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map((s) => {
                    const eligible =
                      s.access === "Free" || s.access === "Expired";
                    return (
                      <div
                        key={s.studentId}
                        className="flex flex-wrap items-center justify-between gap-4 py-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600 dark:bg-blue-500/10">
                            {s.name
                              .trim()
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((p) => p[0])
                              .join("")}
                          </span>
                          <div>
                            <p className="font-semibold">{s.name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <Badge
                                tone={
                                  s.access.includes("active") ||
                                  s.access === "Paid individually"
                                    ? "green"
                                    : s.access.includes("pending")
                                    ? "amber"
                                    : "neutral"
                                }
                              >
                                {s.access}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                Sharing enabled
                              </span>
                            </div>
                          </div>
                        </div>
                        {!clazz.archived && (
                          <div className="flex items-center gap-2">
                            {eligible ? (
                              availableSeats > 0 ? (
                                <button
                                  className={secondary}
                                  disabled={busy}
                                  onClick={() => {
                                    setOffering(s);
                                    open("offer");
                                  }}
                                >
                                  <Ticket size={15} />
                                  Offer exam access
                                </button>
                              ) : (
                                <Link className={secondary} to="/teacher/seats">
                                  <Ticket size={15} />
                                  Get exam seats
                                </Link>
                              )
                            ) : (
                              <span className="px-2 text-xs text-gray-400">
                                {s.access.includes("pending")
                                  ? "Waiting for student"
                                  : "Access ready"}
                              </span>
                            )}
                            <button
                              className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                              aria-label={`Remove ${s.name}`}
                              title={`Remove ${s.name}`}
                              disabled={busy}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Remove ${s.name} from this class and stop sharing their results? Their paid access is kept.`
                                  )
                                )
                                  action(() =>
                                    teacherApi(
                                      `teacher/classes/${id}/students/${s.studentId}`,
                                      "DELETE"
                                    )
                                  );
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
          {tab === "assignments" && (
            <>
              <SectionHeading
                title="Assigned practice"
                description="Students use their existing exam access for each assignment."
                action={
                  !clazz.archived && students.length > 0 ? (
                    <button className={button} onClick={() => open("assign")}>
                      <Plus size={16} />
                      Assign exam
                    </button>
                  ) : undefined
                }
              />
              {!assignments.length ? (
                <Empty
                  title="Give your class its first assignment"
                  body={
                    students.length
                      ? "Choose a TELC B1 exam, select the students and add a due date if needed."
                      : "Invite students first. Then you can assign a mock exam to your class."
                  }
                  action={
                    !clazz.archived ? (
                      <button
                        className={button}
                        onClick={() =>
                          open(students.length ? "assign" : "invite")
                        }
                      >
                        {students.length ? "Choose an exam" : "Invite students"}
                        <ArrowRight size={16} />
                      </button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {assignments.map((a) => {
                    const rows = performance.filter(
                        (p) => p.assignmentId === a.id
                      ),
                      done = rows.filter(
                        (p) => p.status === "EVALUATED"
                      ).length;
                    return (
                      <article
                        key={a.id}
                        className="rounded-xl border border-gray-200 p-5 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                            <BookOpen size={20} />
                          </span>
                          <Badge
                            tone={
                              rows.length > 0 && done === rows.length
                                ? "green"
                                : "blue"
                            }
                          >
                            {done} / {rows.length} completed
                          </Badge>
                        </div>
                        <h3 className="mt-4 font-semibold">
                          {exams.find((e) => e.code === a.examCode)?.title ||
                            "TELC Deutsch B1 mock exam"}
                        </h3>
                        <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <Calendar size={14} />
                          {a.dueAt ? `Due ${date(a.dueAt)}` : "No due date"}
                        </p>
                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                              width: `${
                                rows.length ? (done / rows.length) * 100 : 0
                              }%`,
                            }}
                          />
                        </div>
                        <button
                          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600"
                          onClick={() => setTab("progress")}
                        >
                          View student progress
                          <ArrowRight size={15} />
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
          {tab === "progress" && (
            <>
              <SectionHeading
                title="Shared class progress"
                description="Only results from class assignments appear here. Personal exams and answers stay private."
                action={
                  <button
                    className={secondary}
                    disabled={busy}
                    onClick={() => action(async () => {})}
                  >
                    <RefreshCw
                      size={15}
                      className={busy ? "animate-spin" : ""}
                    />
                    Refresh
                  </button>
                }
              />
              {!performance.length ? (
                <Empty
                  title="Results will appear as students practise"
                  body="Assign an exam to start tracking completion and section scores."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[580px] text-left text-sm">
                    <thead className="border-y border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800">
                      <tr>
                        {["Student", "Assignment", "Progress", "Result"].map(
                          (h) => (
                            <th className="px-3 py-3 font-semibold" key={h}>
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {performance.map((p) => (
                        <tr key={`${p.assignmentId}:${p.studentId}`}>
                          <td className="px-3 py-4 align-top font-semibold">
                            {students.find((s) => s.studentId === p.studentId)
                              ?.name || "Student"}
                          </td>
                          <td className="max-w-[200px] px-3 py-4 align-top text-gray-500">
                            {exams.find((e) => e.code === p.examCode)?.title ||
                              "TELC Deutsch B1"}
                          </td>
                          <td className="px-3 py-4 align-top">
                            <Status value={p.status} />
                          </td>
                          <td className="px-3 py-4">
                            {p.score !== undefined ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">
                                    {p.score} / {p.maximumScore}
                                  </span>
                                  <Badge tone={p.passed ? "green" : "amber"}>
                                    {p.passed ? "Passed" : "Not passed"}
                                  </Badge>
                                </div>
                                {!!p.sections?.length && (
                                  <details className="mt-3">
                                    <summary className="cursor-pointer text-xs font-semibold text-blue-600">
                                      Section scores
                                    </summary>
                                    <ul className="mt-2 space-y-2">
                                      {p.sections.map((s) => (
                                        <li
                                          key={s.sectionKey}
                                          className="flex justify-between gap-4 text-xs"
                                        >
                                          <span className="text-gray-500">
                                            {s.title}
                                          </span>
                                          <span>
                                            {s.score} / {s.maximumScore}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </details>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400">
                                Not submitted yet
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-gray-400">
                <ShieldCheck size={15} className="mt-0.5 shrink-0" />
                Students control sharing. Leaving the class removes their
                results from this view.
              </p>
            </>
          )}
        </div>
      </div>
      {dialog === "invite" && (
        <Dialog
          title="Invite your students"
          description="Students join for free and agree to share their class results with you."
          onClose={close}
        >
          <div className="mb-5 flex items-center gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-500/10">
            <Link2 size={22} className="shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-semibold">Private class invitation</p>
              <p className="mt-1 text-xs text-gray-500">
                Valid for 30 days · Account required
              </p>
            </div>
          </div>
          {inviteLoading ? (
            <Loading text="Loading invitation link…" />
          ) : invite ? (
            <>
              <label
                className="block text-sm font-semibold"
                htmlFor="class-invitation"
              >
                Invitation link
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="class-invitation"
                  className={`${input} min-w-0 flex-1`}
                  readOnly
                  value={invite}
                  onFocus={(e) => e.target.select()}
                />
                <button
                  className={button}
                  disabled={busy || inviteLoading}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(invite);
                      setCopied(true);
                    } catch {
                      setFormError("Copy the link from the field above.");
                    }
                  }}
                >
                  {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}{" "}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className={`${muted} mt-3`}>
                Send this link to your students. They will appear in the class
                after joining.
              </p>
            </>
          ) : (
            <p className={`${muted} mb-5`}>
              {hasInvite
                ? "This invitation was created before links could be saved. Replace it once to get a link you can view and copy anytime. The previous link will stop working."
                : "Create a link, then share it with your students by email or in your class chat."}
            </p>
          )}
          {formError && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {formError}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            {(hasInvite || invite) && (
              <button
                className="text-sm font-semibold text-red-600"
                disabled={busy || inviteLoading}
                onClick={async () => {
                  if (
                    !window.confirm(
                      "Disable the invitation link? Students who have already joined will stay in your class."
                    )
                  )
                    return;
                  const ok = await action(async () => {
                    await teacherApi(`teacher/classes/${id}/invites`, "DELETE");
                    setInvite("");
                    notify("Invitation disabled.");
                  });
                  if (ok) setDialog(null);
                }}
              >
                Disable link
              </button>
            )}
            <button
              className={invite ? secondary : button}
              disabled={busy || inviteLoading}
              onClick={() => {
                if (
                  (hasInvite || invite) &&
                  !window.confirm(
                    "Replace the invitation link? The previous link will stop working."
                  )
                )
                  return;
                action(async () => {
                  const r = await teacherApi<{ token: string }>(
                    `teacher/classes/${id}/invites/rotate`,
                    "POST"
                  );
                  setInvite(`${window.location.origin}/class/join/${r.token}`);
                  setCopied(false);
                });
              }}
            >
              <RefreshCw size={15} />
              {invite || hasInvite ? "Replace link" : "Create invitation link"}
            </button>
          </div>
        </Dialog>
      )}
      {dialog === "assign" && (
        <Dialog
          title="Assign a mock exam"
          description="Choose the practice you want your students to complete."
          onClose={close}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (audience === "selected" && !selected.length) {
                setFormError("Select at least one student.");
                return;
              }
              const ok = await action(async () => {
                await teacherApi(`teacher/classes/${id}/assignments`, "POST", {
                  examCode,
                  dueAt: due ? new Date(due).toISOString() : null,
                  studentIds: audience === "all" ? [] : selected,
                });
                notify(
                  "Exam assigned. Your students can find it in My classes."
                );
              });
              if (ok) {
                setDialog(null);
                setTab("assignments");
                setSelected([]);
                setDue("");
              }
            }}
          >
            <label
              className="block text-sm font-semibold"
              htmlFor="assigned-exam"
            >
              Mock exam
            </label>
            <select
              id="assigned-exam"
              className={`${input} mt-2 w-full`}
              required
              value={examCode}
              onChange={(e) => setExamCode(e.target.value)}
            >
              {exams.map((e) => (
                <option key={e.code} value={e.code}>
                  {e.title}
                </option>
              ))}
            </select>
            <fieldset className="mt-5">
              <legend className="mb-3 text-sm font-semibold">
                Who is this for?
              </legend>
              <div className="flex flex-wrap gap-4">
                {[
                  ["all", "Whole class"],
                  ["selected", "Selected students"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="assignment-audience"
                      value={value}
                      checked={audience === value}
                      onChange={() => setAudience(value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
              {audience === "selected" && (
                <div className="mt-3 max-h-40 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                  {students.map((s) => (
                    <label
                      key={s.studentId}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(s.studentId)}
                        onChange={(e) =>
                          setSelected((v) =>
                            e.target.checked
                              ? [...v, s.studentId]
                              : v.filter((id) => id !== s.studentId)
                          )
                        }
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              )}
            </fieldset>
            <label
              className="mt-5 block text-sm font-semibold"
              htmlFor="assignment-due"
            >
              Due date{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="assignment-due"
              type="datetime-local"
              className={`${input} mt-2 w-full`}
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
            <p className="mt-4 rounded-xl bg-gray-50 p-3 text-xs leading-5 text-gray-500 dark:bg-gray-800">
              Assignments use each student’s normal exam access. They do not add
              extra attempts.
            </p>
            {formError && (
              <p role="alert" className="mt-4 text-sm text-red-600">
                {formError}
              </p>
            )}
            <DialogActions busy={busy} onClose={close} label="Assign exam" />
          </form>
        </Dialog>
      )}
      {dialog === "settings" && (
        <Dialog title="Class settings" onClose={close}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await action(() =>
                teacherApi(`teacher/classes/${id}`, "PATCH", { name: rename })
              );
              if (ok) {
                setDialog(null);
                notify("Class name updated.");
              }
            }}
          >
            <label
              className="block text-sm font-semibold"
              htmlFor="rename-class"
            >
              Class name
            </label>
            <input
              id="rename-class"
              className={`${input} mt-2 w-full`}
              required
              maxLength={120}
              value={rename}
              onChange={(e) => setRename(e.target.value)}
            />
            {formError && (
              <p role="alert" className="mt-4 text-sm text-red-600">
                {formError}
              </p>
            )}
            <DialogActions busy={busy} onClose={close} label="Save changes" />
          </form>
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50/40 p-4 dark:border-red-900 dark:bg-red-500/5">
            <h3 className="text-sm font-semibold">Archive this class</h3>
            <p className={`${muted} mt-1`}>
              Stop new invitations, assignments and progress sharing. Students
              keep their paid access.
            </p>
            <button
              className="mt-3 text-sm font-semibold text-red-600"
              disabled={busy}
              onClick={async () => {
                if (
                  !window.confirm(
                    "Archive this class? This stops invitations and sharing."
                  )
                )
                  return;
                const ok = await action(() =>
                  teacherApi(`teacher/classes/${id}/archive`, "POST")
                );
                if (ok) {
                  setDialog(null);
                  notify("Class archived.");
                }
              }}
            >
              Archive class
            </button>
          </div>
        </Dialog>
      )}
      {dialog === "offer" && offering && (
        <Dialog
          title={`Offer exam access to ${offering.name}`}
          description="This uses one prepaid seat from your wallet. There is no additional charge."
          onClose={close}
        >
          <div className="rounded-xl bg-blue-50 p-5 dark:bg-blue-500/10">
            <div className="flex items-center gap-3">
              <Ticket size={24} className="text-blue-600" />
              <div>
                <p className="font-semibold">10 mock exams</p>
                <p className="mt-1 text-sm text-gray-500">
                  60 days from student acceptance
                </p>
              </div>
            </div>
          </div>
          <p className={`${muted} mt-4`}>
            Your student has 14 days to accept. If they decline or the offer
            expires, the seat returns to your wallet.
          </p>
          <p className="mt-3 text-sm font-semibold">
            {availableSeats} {availableSeats === 1 ? "seat" : "seats"} available
          </p>
          {formError && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {formError}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button className={secondary} disabled={busy} onClick={close}>
              Cancel
            </button>
            <button
              className={button}
              disabled={busy}
              onClick={async () => {
                const ok = await action(() =>
                  teacherApi("teacher/seats/offer", "POST", {
                    classId: id,
                    studentId: offering.studentId,
                  })
                );
                if (ok) {
                  setDialog(null);
                  notify(
                    `Seat offered to ${offering.name}. They can accept it from My classes.`
                  );
                }
              }}
            >
              Send seat offer
              <ArrowRight size={16} />
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
