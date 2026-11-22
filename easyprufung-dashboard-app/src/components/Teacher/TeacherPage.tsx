import { tr, useFeatureLocale } from "../../localization/feature-i18n";
import TeacherCheckoutReturn from "./TeacherCheckoutReturn";
import React, { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import {
  Plus,
  ArrowRight,
  Users,
  BookOpen,
  Ticket,
  GraduationCap,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  teacherApi,
  TeacherClass,
  Wallet,
  Order,
  Quote,
  RosterStudent,
  money,
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
  ClassCards,
  Step,
  Dialog,
  DialogActions,
  panel,
  muted,
} from "./ui";
import ClassDetail from "./TeacherClassDetail";
import { teacherLinks } from "./TeacherNavigation";
import { teacherRoleChanged } from "./TeacherRole";

type PricingTier = {
  code: string;
  label: string;
  minimum: number;
  maximum: number;
  unitPriceCents: number;
};
type Profile = { status: string; checkoutEnabled: boolean };
export default function TeacherPage() {
  const { locale, dir } = useFeatureLocale();

  const location = useLocation(),
    { id } = useParams();
  const section = location.pathname.endsWith("/seats")
    ? "seats"
    : location.pathname.endsWith("/billing")
    ? "billing"
    : id
    ? "detail"
    : location.pathname.endsWith("/classes")
    ? "classes"
    : "home";
  const returnParams = new URLSearchParams(location.search);
  const returnedOrderId = returnParams.get("order");
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null),
    [classes, setClasses] = useState<TeacherClass[]>([]),
    [wallet, setWallet] = useState<Wallet | null>(null),
    [orders, setOrders] = useState<Order[]>([]),
    [summary, setSummary] = useState({ students: 0, assignments: 0 });
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [createOpen, setCreateOpen] = useState(false),
    [name, setName] = useState(""),
    [showArchived, setShowArchived] = useState(false),
    [quantity, setQuantity] = useState(1),
    [quote, setQuote] = useState<Quote | null>(null),
    [quoteError, setQuoteError] = useState(""),
    [offerNames, setOfferNames] = useState<Record<string, string>>({});
  const load = useCallback(async () => {
    let p = await teacherApi<Profile>("teacher/me");
    let signup = false;
    try {
      signup = sessionStorage.getItem("smartpruefung:teacher-signup") === "1";
    } catch {}
    if (signup) {
      if (p.status === "NOT_REGISTERED") {
        p = await teacherApi<Profile>("teacher/apply", "POST");
        window.dispatchEvent(new Event(teacherRoleChanged));
      }
      try {
        sessionStorage.removeItem("smartpruefung:teacher-signup");
      } catch {}
    }
    setProfile(p);
    if (p.status !== "ACTIVE") return;
    const [c, w, o, s, pricing] = await Promise.all([
      teacherApi<TeacherClass[]>("teacher/classes"),
      teacherApi<Wallet>("teacher/seats/wallet"),
      teacherApi<Order[]>("teacher/seats/orders"),
      teacherApi<{ students: number; assignments: number }>("teacher/summary"),
      teacherApi<{ tiers: PricingTier[] }>("teacher/seats/pricing"),
    ]);
    setTiers(pricing.tiers);
    setClasses(c);
    setWallet(w);
    setOrders(o);
    setSummary(s);
    if (section === "seats" && w.offers.length) {
      const ids = Array.from(new Set(w.offers.map((offer) => offer.classId)));
      const rosters = await Promise.all(
        ids.map((classId) =>
          teacherApi<RosterStudent[]>(`teacher/classes/${classId}/students`)
        )
      );
      const names: Record<string, string> = {};
      rosters.flat().forEach((student) => {
        names[student.studentId] = student.name;
      });
      setOfferNames(names);
    }
  }, [section]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
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
  }, [load, location.pathname]);
  useEffect(() => {
    let active = true;
    setQuote(null);
    setQuoteError("");
    if (section !== "seats" || profile?.status !== "ACTIVE") return;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
      setQuoteError("Choose a whole number between 1 and 1,000.");
      return;
    }
    teacherApi<Quote>(`teacher/seats/quote?quantity=${quantity}`)
      .then((q) => {
        if (active) setQuote(q);
      })
      .catch((e) => {
        if (active) setQuoteError(e.message);
      });
    return () => {
      active = false;
    };
  }, [quantity, profile?.status, section]);
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
  const activeClasses = classes.filter((c) => !c.archived),
    visibleClasses = classes.filter((c) => c.archived === showArchived);
  const titles: Record<string, { title: string; description: string }> = {
    home: {
      title: tr("Your teaching workspace"),
      description: tr(
        "Keep your classes, exam practice and student progress in one place."
      ),
    },
    classes: {
      title: tr("Classes"),
      description: tr(
        "Create a class and invite your students to practise together."
      ),
    },
    detail: {
      title: tr("Class workspace"),
      description: tr("Students, assignments and progress — together."),
    },
    seats: {
      title: tr("Exam seats"),
      description: tr("Help students access more practice, when they need it."),
    },
    billing: {
      title: tr("Billing"),
      description: tr("Your seat purchases, payment status and receipts."),
    },
  };
  if (!loading && profile?.status === "NOT_REGISTERED")
    return <Navigate to="/my-classes" replace />;
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
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <GraduationCap size={16} />
              {tr("Teacher workspace")}
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {tr(titles[section].title)}
            </h1>
            <p className={`${muted} mt-2 max-w-xl`}>
              {tr(titles[section].description)}
            </p>
          </div>
          {profile?.status === "ACTIVE" &&
          (section === "home" || section === "classes") ? (
            <button className={button} onClick={() => setCreateOpen(true)}>
              <Plus size={17} />
              {tr("Create class")}
            </button>
          ) : (
            <Badge tone="blue">
              <ShieldCheck size={13} />
              {tr("Free class management")}
            </Badge>
          )}
        </div>
      </header>
      {profile?.status === "ACTIVE" && (
        <nav
          aria-label={tr("Teacher pages")}
          className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800"
        >
          {teacherLinks.map(({ to, label, icon: Icon }) => {
            const active =
              to === "/teacher"
                ? section === "home"
                : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon size={16} />
                {tr(label)}
              </Link>
            );
          })}
        </nav>
      )}
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
            {tr("Try again")}
          </button>
        </div>
      )}
      {message && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300"
        >
          <CheckCircle2 size={18} />
          {tr(message)}
        </div>
      )}
      {loading ? (
        <Loading />
      ) : profile?.status !== "ACTIVE" ? (
        <div className={`${panel} p-8`}>
          <h2 className="text-xl font-semibold">
            {profile?.status === "PENDING"
              ? tr("Your registration is being reviewed")
              : tr("Your teacher account needs attention")}
          </h2>
          <p className={`${muted} mt-3`}>
            {tr(
              "Contact support if you need help with your teacher registration."
            )}
          </p>
          <Link to="/contact" className={`${secondary} mt-5`}>
            {tr("Contact support")}
          </Link>
        </div>
      ) : (
        <>
          {section === "home" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Stat
                  label={tr("Active classes")}
                  value={activeClasses.length}
                  icon={Users}
                />
                <Stat
                  label={tr("Students")}
                  value={summary.students}
                  icon={GraduationCap}
                />
                <Stat
                  label={tr("Assignments")}
                  value={summary.assignments}
                  icon={BookOpen}
                />
                <Stat
                  label={tr("Available seats")}
                  value={wallet?.available || 0}
                  icon={Ticket}
                />
              </div>
              <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
                <div>
                  <SectionHeading
                    title={tr("Your classes")}
                    description={tr(
                      "Pick a class to invite students or check their practice."
                    )}
                    action={
                      activeClasses.length > 0 ? (
                        <Link
                          to="/teacher/classes"
                          className="flex items-center gap-1 text-sm font-semibold text-blue-600"
                        >
                          {tr("View all")}
                          <ArrowRight size={15} className="rtl:rotate-180" />
                        </Link>
                      ) : undefined
                    }
                  />
                  <ClassCards
                    classes={activeClasses.slice(0, 4)}
                    onCreate={() => setCreateOpen(true)}
                  />
                </div>
                <aside className={`${panel} p-6`}>
                  <SectionHeading
                    title={
                      summary.assignments
                        ? tr("Your classroom flow")
                        : tr("Get your class started")
                    }
                    description={tr(
                      "Three steps. No payment needed to create a class."
                    )}
                  />
                  <div className="space-y-7">
                    <Step
                      number={1}
                      title={tr("Create a class")}
                      body={tr("Give your group a name.")}
                      complete={!!activeClasses.length}
                      action={
                        <button
                          className="text-sm font-semibold text-blue-600"
                          onClick={() => setCreateOpen(true)}
                        >
                          {activeClasses.length
                            ? tr("Create another class")
                            : tr("Create your first class")}
                        </button>
                      }
                    />
                    <Step
                      number={2}
                      title={tr("Invite students")}
                      body={tr("Students join through your private link.")}
                      complete={summary.students > 0}
                      action={
                        activeClasses[0] ? (
                          <Link
                            className="text-sm font-semibold text-blue-600"
                            to={`/teacher/classes/${activeClasses[0].id}`}
                          >
                            {tr("Open class")}
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {tr("Create a class first")}
                          </span>
                        )
                      }
                    />
                    <Step
                      number={3}
                      title={tr("Assign an exam")}
                      body={tr("See results after students finish.")}
                      complete={summary.assignments > 0}
                      action={
                        summary.students > 0 && activeClasses[0] ? (
                          <Link
                            className="text-sm font-semibold text-blue-600"
                            to={`/teacher/classes/${activeClasses[0].id}`}
                          >
                            {tr("Choose an assignment")}
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {tr("Invite students first")}
                          </span>
                        )
                      }
                    />
                  </div>
                </aside>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-900 dark:bg-blue-500/5">
                <div className="flex items-start gap-3">
                  <Ticket className="mt-1 shrink-0 text-blue-600" size={22} />
                  <div>
                    <h2 className="font-semibold">
                      {tr("Need to fund a student’s practice?")}
                    </h2>
                    <p className={`${muted} mt-1`}>
                      {tr(
                        "Offer a prepaid seat, or let students use their own paid access."
                      )}
                    </p>
                  </div>
                </div>
                <Link to="/teacher/seats" className={secondary}>
                  {tr("Explore exam seats")}
                  <ArrowRight size={16} className="rtl:rotate-180" />
                </Link>
              </div>
            </>
          )}
          {section === "classes" && (
            <>
              <SectionHeading
                title={tr("Your classes")}
                description={tr("Active classes: {{count}}", {
                  count: activeClasses.length,
                })}
                action={
                  <div className="flex rounded-xl bg-gray-100 p-1 text-sm dark:bg-gray-800">
                    {[false, true].map((archived) => (
                      <button
                        key={String(archived)}
                        onClick={() => setShowArchived(archived)}
                        className={`rounded-lg px-3 py-1.5 ${
                          showArchived === archived
                            ? "bg-white font-semibold shadow-sm dark:bg-gray-700"
                            : "text-gray-500"
                        }`}
                      >
                        {archived ? tr("Archived") : tr("Active")}
                      </button>
                    ))}
                  </div>
                }
              />
              {showArchived && !visibleClasses.length ? (
                <Empty
                  title={tr("No archived classes")}
                  body={tr("Classes you archive will appear here.")}
                />
              ) : (
                <ClassCards
                  classes={visibleClasses}
                  onCreate={() => setCreateOpen(true)}
                />
              )}
            </>
          )}
          {section === "detail" && id && (
            <ClassDetail
              key={id}
              id={id}
              busy={busy}
              run={run}
              notify={setMessage}
              availableSeats={wallet?.available || 0}
            />
          )}
          {section === "seats" && (
            <>
              {returnParams.get("checkout") === "canceled" && (
                <div
                  role="status"
                  className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-500/10 dark:text-blue-300"
                >
                  {tr("Checkout was closed.")}{" "}
                  <Link
                    className="font-semibold underline"
                    to={
                      returnedOrderId
                        ? `/teacher/billing?order=${encodeURIComponent(
                            returnedOrderId
                          )}`
                        : "/teacher/billing"
                    }
                  >
                    {tr("Check payment status in Billing")}
                  </Link>{" "}
                  {tr("before trying again.")}
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat
                  label={tr("Ready to offer")}
                  value={wallet?.available || 0}
                  icon={Ticket}
                />
                <Stat
                  label={tr("Awaiting acceptance")}
                  value={wallet?.reserved || 0}
                  icon={Clock}
                />
                <Stat
                  label={tr("Activated")}
                  value={wallet?.activated || 0}
                  icon={CheckCircle2}
                />
              </div>
              <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
                <div className={`${panel} p-6`}>
                  <SectionHeading
                    title={tr("Buy exam seats")}
                    description={tr(
                      "One seat gives one student 10 mock exams and 60 days of access."
                    )}
                  />
                  <div className="mb-6 grid gap-3 rounded-xl bg-gray-50 p-4 text-sm dark:bg-gray-800 sm:grid-cols-3">
                    {[
                      tr("Buy the seats you need"),
                      tr("Offer from a class roster"),
                      tr("Student accepts to start"),
                    ].map((step, i) => (
                      <div className="flex items-center gap-2" key={step}>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-600 dark:bg-gray-700">
                          {i + 1}
                        </span>
                        {step}
                      </div>
                    ))}
                  </div>
                  <label
                    htmlFor="seat-quantity"
                    className="block text-sm font-semibold"
                  >
                    {tr("How many students do you want to fund?")}
                  </label>
                  <input
                    id="seat-quantity"
                    className={`${input} mt-3 w-32`}
                    type="number"
                    min={1}
                    max={1000}
                    value={quantity || ""}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[1, 5, 10, 25, 50].map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuantity(q)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                          quantity === q
                            ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-500/10"
                            : "border-gray-200 text-gray-500 dark:border-gray-700"
                        }`}
                      >
                        {tr("Seats: {{range}}", { range: q })}
                      </button>
                    ))}
                  </div>
                  {quoteError ? (
                    <p role="alert" className="mt-3 text-sm text-red-600">
                      {tr(quoteError)}
                    </p>
                  ) : quote ? (
                    <div className="my-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900 dark:bg-blue-500/5">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>
                          {quote.quantity} {tr("seats ×")}{" "}
                          {money(quote.unitPriceCents)}
                        </span>
                        <span>{tr("One-time payment")}</span>
                      </div>
                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="font-semibold">{tr("Total")}</span>
                        <span className="text-3xl font-bold tracking-tight">
                          {money(quote.grossTotalCents)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p role="status" className="my-6 text-sm text-gray-500">
                      {tr("Calculating your total…")}
                    </p>
                  )}
                  <button
                    className={`${button} w-full`}
                    disabled={busy || !quote || !profile.checkoutEnabled}
                    onClick={() =>
                      run(async () => {
                        const r = await teacherApi<{ url: string }>(
                          "teacher/seats/checkout",
                          "POST",
                          { quantity }
                        );
                        window.location.assign(r.url);
                      })
                    }
                  >
                    <ShieldCheck size={17} />
                    {tr("Continue to checkout")}
                  </button>
                  <p className="mt-3 text-center text-xs text-gray-500">
                    {tr("No subscription. No automatic renewal.")}
                  </p>
                  {!profile.checkoutEnabled && (
                    <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                      {tr(
                        "Seat purchases are not open yet. You can still create classes, invite students and assign practice for free."
                      )}
                    </div>
                  )}
                </div>
                <aside className={`${panel} p-6`}>
                  <SectionHeading title={tr("How seat access works")} />
                  <ul className="space-y-4 text-sm">
                    {[
                      tr(
                        "Access begins when the student accepts, not when you buy."
                      ),
                      tr("Students with paid access keep their own plan."),
                      tr("Pending offers return to your wallet after 14 days."),
                      tr(
                        "Activated seats stay with students if they leave a class."
                      ),
                    ].map((text) => (
                      <li key={text} className="flex gap-2">
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0 text-blue-600"
                        />
                        <span className="leading-6 text-gray-600 dark:text-gray-300">
                          {tr(text)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <h3 className="mb-3 mt-7 text-sm font-semibold">
                    {tr("Price per seat")}
                  </h3>
                  <table className="w-full text-sm">
                    <tbody>
                      {tiers.map((tier) => (
                        <tr
                          key={tier.code}
                          className="border-b border-gray-100 dark:border-gray-800"
                        >
                          <td className="py-2 text-gray-500">
                            {tr("Seats: {{range}}", { range: tier.label })}
                          </td>
                          <td className="py-2 text-right font-semibold">
                            {money(tier.unitPriceCents)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-3 text-xs leading-5 text-gray-400">
                    {tr("Discounts apply to the quantity in each order.")}
                  </p>
                </aside>
              </div>
              <div className={`${panel} p-6`}>
                <SectionHeading
                  title={tr("Seat offers")}
                  description={tr(
                    "Offer seats to students from their class roster."
                  )}
                  action={
                    <Link to="/teacher/classes" className={secondary}>
                      {tr("Open a class")}
                      <ArrowRight size={15} className="rtl:rotate-180" />
                    </Link>
                  }
                />
                {!wallet?.offers.length ? (
                  <Empty
                    title={tr("No offers yet")}
                    body={tr(
                      "Once a student joins a class, you can offer them an available seat."
                    )}
                  />
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {wallet.offers.map((o) => (
                      <div
                        key={o.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600 dark:bg-blue-500/10">
                            {(offerNames[o.studentId] || "S").slice(0, 1)}
                          </span>
                          <div>
                            <p className="font-semibold">
                              {offerNames[o.studentId] ||
                                tr("Former class member")}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {classes.find((c) => c.id === o.classId)?.name ||
                                tr("Class")}
                              {o.state === "PENDING" &&
                                " · " +
                                  tr("Respond by {{date}}", {
                                    date: date(o.expiresAt),
                                  })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Status value={o.state} />
                          {o.state === "PENDING" && (
                            <button
                              className={secondary}
                              disabled={busy}
                              onClick={() =>
                                run(() =>
                                  teacherApi(
                                    `teacher/seats/offers/${o.id}/revoke`,
                                    "POST"
                                  )
                                )
                              }
                            >
                              {tr("Cancel offer")}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          {section === "billing" && (
            <>
              {returnedOrderId && (
                <TeacherCheckoutReturn
                  orderId={returnedOrderId}
                  onConfirmed={load}
                />
              )}
              <div className={`${panel} p-6`}>
                <SectionHeading
                  title={tr("Seat purchases")}
                  description={tr(
                    "Payment status updates after Stripe confirms your purchase."
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
                {!orders.length ? (
                  <Empty
                    title={tr("No purchases yet")}
                    body={tr(
                      "Your exam seat purchases and receipts will appear here."
                    )}
                    action={
                      <Link to="/teacher/seats" className={button}>
                        {tr("Explore exam seats")}
                        <ArrowRight size={16} className="rtl:rotate-180" />
                      </Link>
                    }
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-start text-sm">
                      <thead className="border-y border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800">
                        <tr>
                          {[
                            tr("Purchase"),
                            tr("Date"),
                            tr("Total"),
                            tr("Status"),
                            tr("Receipt"),
                          ].map((h) => (
                            <th key={h} className="px-4 py-3 font-semibold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {orders.map((o) => (
                          <tr key={o.id}>
                            <td className="px-4 py-5">
                              <p className="font-semibold">
                                {tr("Seats: {{range}}", { range: o.quantity })}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                {tr("Order")} {o.id.slice(0, 8)}
                              </p>
                            </td>
                            <td className="px-4 py-5 text-gray-500">
                              {date(o.createdAt)}
                            </td>
                            <td className="px-4 py-5 font-semibold">
                              {money(o.totalCents)}
                            </td>
                            <td className="px-4 py-5">
                              {o.status === "PENDING" ? (
                                <Badge tone="amber">
                                  {tr("Payment pending")}
                                </Badge>
                              ) : (
                                <Status value={o.status} />
                              )}
                              {o.supportReview && (
                                <p className="mt-2 text-xs text-amber-600">
                                  {tr("Support review required")}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-5">
                              {o.receiptUrl ? (
                                <a
                                  className="inline-flex items-center gap-1 font-semibold text-blue-600"
                                  href={o.receiptUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {tr("View receipt")}
                                  <ExternalLink size={14} />
                                </a>
                              ) : (
                                <span className="text-gray-400">
                                  {tr("Not available")}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
      {createOpen && (
        <Dialog
          title={tr("Create a class")}
          description={tr(
            "Choose a name your students will recognise. You can invite them next."
          )}
          onClose={() => {
            if (!busy) setCreateOpen(false);
          }}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!name.trim()) return;
              const ok = await run(async () => {
                await teacherApi("teacher/classes", "POST", {
                  name: name.trim(),
                });
                setMessage("Class created. Open it to invite your students.");
              });
              if (ok) {
                setName("");
                setCreateOpen(false);
              }
            }}
          >
            <label
              htmlFor="new-class-name"
              className="block text-sm font-semibold"
            >
              {tr("Class name")}
            </label>
            <input
              className={`${input} mt-2 w-full`}
              id="new-class-name"
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={tr("e.g. B1 Evening Class")}
            />
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <BookOpen size={16} />
              {tr("TELC Deutsch B1")}
            </div>
            {error && (
              <p role="alert" className="mt-4 text-sm text-red-600">
                {tr(error)}
              </p>
            )}
            <DialogActions
              busy={busy}
              onClose={() => setCreateOpen(false)}
              label={tr("Create class")}
            />
          </form>
        </Dialog>
      )}
    </section>
  );
}
