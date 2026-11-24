import { useSelector } from "react-redux";
import type { IStateType } from "../../store/models/root.interface";
import { useTeacherRole } from "../Teacher/TeacherRole";
import {
  UserRound,
  Landmark,
  Mail,
  WalletCards,
  Megaphone,
  RefreshCw,
  Settings,
} from "lucide-react";
import PartnerApplication, { IconField } from "./PartnerApplication";
import { FormEvent, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { teacherApi, button, secondary, input, card } from "../Teacher/api";
import PartnerDashboard from "./PartnerDashboard";
import { Analytics } from "./PartnerCharts";
import { panel, muted, PartnerBadge } from "./workspace-ui";

type Social = { platform: string; profile: string; audienceSize?: number };
export type Profile = {
  id?: string;
  status: string;
  displayName?: string;
  contactEmail?: string;
  country?: string;
  website?: string;
  approach?: string;
  socials?: Social[];
  commissionBps?: number;
  discountBps?: number;
  payoutMethod?: string;
  payoutMasked?: string;
  payoutVerified?: boolean;
  reviewReason?: string;
};
type Method = {
  method: string;
  holder: string;
  iban: string;
  bic: string;
  paypalEmail: string;
};
export type Row = {
  id: string;
  createdAt: string;
  amountCents: number;
  status: string;
  kind?: string;
  externalReference?: string;
  maskedDestination?: string;
  paidAt?: string;
};
export type Page<T> = { content: T[]; totalElements: number };
export type Code = { id: string; displayCode: string };
type Overview = Record<string, number>;

const emptyMethod: Method = {
  method: "PAYPAL",
  holder: "",
  iban: "",
  bic: "",
  paypalEmail: "",
};
const api = <T,>(path = "", method = "GET", body?: unknown) =>
  teacherApi<T>(`partners/${path}`, method, body);
export function PartnerTerms() {
  return (
    <details className="rounded-xl border border-gray-200 p-4 text-sm leading-6 dark:border-gray-700">
      <summary className="cursor-pointer font-semibold">
        Partner terms and privacy notice · 24 November 2026
      </summary>
      <div className="mt-3 space-y-3">
        <p>
          Apply with an accurate profile and a bank or PayPal account you are
          authorised to use. Approval is required. The initial learner discount
          is 10%; your commission normally starts at 20%. Your dashboard shows
          your assigned rates. Rates can change for future purchases.
        </p>
        <p>
          Commission applies to verified, paid purchases of 10 Exams (€19.99)
          and Unlimited (€39.99), after discounts and excluding tax. Teacher
          seats, free access, self-referrals, fraudulent purchases, refunds and
          chargebacks are excluded. Disclose that you may earn a commission
          whenever you recommend SmartPrüfung. Do not spam, mislead learners,
          impersonate SmartPrüfung or publish unauthorised offers.
        </p>
        <p>
          Commissions normally remain pending for 14 days. You may request a
          manual EUR payout once at least €50 is available and your destination
          is verified. Payments are reviewed and made by bank transfer or
          PayPal; there is no automatic transfer or guaranteed payout date.
          Refunds or disputes can reduce future balances even after a payout.
          SmartPrüfung bears ordinary transfer fees in this initial program; any
          exceptional fee adjustment must be agreed separately. You are
          responsible for your own taxes and any invoices or proof requested
          before payment.
        </p>
        <p>
          Accounts and codes may be suspended or terminated for abuse or
          inaccurate information. Legitimate earlier earnings remain subject to
          refund and review rules. You can leave the program by contacting
          support.
        </p>
        <p>
          We use your account, contact information, country, public social
          profiles and marketing description to review and operate your
          application. Payout information is encrypted and only authorised
          payout administrators can reveal it for verification or payment, with
          an access record. Partners see masked destinations. We retain
          application and financial records as needed to operate the program,
          resolve disputes and meet recordkeeping obligations. You can update
          your information here or contact support about access, correction,
          deletion or closing your account. Financial records may need to be
          retained after closure. See our{" "}
          <Link className="text-blue-600 underline" to="/privacy">
            Privacy Policy
          </Link>{" "}
          for operator and contact details.
        </p>
      </div>
    </details>
  );
}
function Destination({
  value,
  onChange,
}: {
  value: Method;
  onChange: (v: Method) => void;
}) {
  const field = (
    key: keyof Method,
    label: string,
    required = true,
    type = "text"
  ) => (
    <IconField
      label={label}
      icon={
        key === "holder" ? UserRound : key === "paypalEmail" ? Mail : Landmark
      }
    >
      <input
        className={`${input} mt-1 w-full`}
        name={key}
        value={value[key]}
        type={type}
        required={required}
        minLength={key === "holder" ? 2 : undefined}
        maxLength={
          key === "holder"
            ? 160
            : key === "iban"
            ? 42
            : key === "bic"
            ? 11
            : 254
        }
        autoComplete="off"
        onChange={(e) => onChange({ ...value, [key]: e.target.value })}
      />
    </IconField>
  );
  return (
    <fieldset data-activity-ignore className="space-y-4">
      <legend className="mb-2 font-semibold">
        Confidential payout details
      </legend>
      <p className="text-sm text-gray-500">
        Used only for verification and manual payment. Updates require another
        review.
      </p>
      <IconField label="Payment method" icon={WalletCards}>
        <select
          className={`${input} mt-1 w-full`}
          name="method"
          value={value.method}
          onChange={(e) => onChange({ ...emptyMethod, method: e.target.value })}
        >
          <option value="PAYPAL">PayPal</option>
          <option value="BANK">Bank transfer</option>
        </select>
      </IconField>
      {field("holder", "Account holder")}
      {value.method === "BANK" ? (
        <>
          {field("iban", "IBAN")}
          {field("bic", "BIC (optional)", false)}
        </>
      ) : (
        field("paypalEmail", "PayPal email", true, "email")
      )}
    </fieldset>
  );
}
export default function PartnerPage({
  settingsMode = false,
}: {
  settingsMode?: boolean;
}) {
  const registrationEmail = useSelector(
    (state: IStateType) => state.userAccount.user?.email
  );
  const teacherRole = useTeacherRole();
  const [profile, setProfile] = useState<Profile>();
  const [overview, setOverview] = useState<Overview>({});
  const [codes, setCodes] = useState<Code[]>([]);
  const [payouts, setPayouts] = useState<Page<Row>>({
    content: [],
    totalElements: 0,
  });
  const [entries, setEntries] = useState<Page<Row>>({
    content: [],
    totalElements: 0,
  });
  const [page, setPage] = useState(0);
  const [payoutPage, setPayoutPage] = useState(0);
  const [editing, setEditing] = useState(false);
  const [methodOpen, setMethodOpen] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    contactEmail: "",
    country: "",
    website: "",
    approach: "",
    socials: [{ platform: "Instagram", profile: "" }] as Social[],
  });
  useEffect(() => {
    if (registrationEmail)
      setForm((current) =>
        current.contactEmail
          ? current
          : { ...current, contactEmail: registrationEmail }
      );
  }, [registrationEmail]);
  const [method, setMethod] = useState<Method>(emptyMethod);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [requestKey, setRequestKey] = useState(() => crypto.randomUUID());
  const [refreshing, setRefreshing] = useState(true);
  const [ready, setReady] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics>();
  const [analyticsError, setAnalyticsError] = useState("");
  const generation = useRef(0),
    chartGeneration = useRef(0);
  async function loadCharts() {
    const request = ++chartGeneration.current;
    setAnalyticsError("");
    try {
      const result = await api<Analytics>("me/analytics");
      if (
        !Array.isArray(result.months) ||
        result.months.length !== 6 ||
        !result.asOf
      )
        throw new Error("Charts unavailable");
      if (request === chartGeneration.current) setAnalytics(result);
    } catch {
      if (request === chartGeneration.current)
        setAnalyticsError("Unable to load charts.");
    }
  }
  async function load() {
    const request = ++generation.current;
    setRefreshing(true);
    try {
      const p = await api<Profile>("me");
      if (request !== generation.current) return;
      setProfile(p);
      if (p.id && !settingsMode) {
        const [o, c, pay, ent] = await Promise.all([
          api<Overview>("me/overview"),
          api<Code[]>("me/codes"),
          api<Page<Row>>(`me/payouts?page=${payoutPage}`),
          api<Page<Row>>(`me/commissions?page=${page}`),
        ]);
        if (request !== generation.current) return;
        setOverview(o);
        setCodes(c);
        setPayouts(pay);
        setEntries(ent);
      }
      setReady(true);
    } catch (e) {
      if (request === generation.current) setReady(false);
      throw e;
    } finally {
      if (request === generation.current) setRefreshing(false);
    }
  }
  useEffect(() => {
    const requests = generation;
    load().catch((e) => setError(e.message));
    return () => {
      requests.current++;
    };
  }, [page, payoutPage, settingsMode]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const requests = chartGeneration;
    if (profile?.id && !settingsMode) loadCharts();
    return () => {
      requests.current++;
    };
  }, [profile?.id, settingsMode]); // eslint-disable-line react-hooks/exhaustive-deps
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
      await load();
      if (profile?.id && !settingsMode) await loadCharts();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to save. Please retry."
      );
    } finally {
      setBusy(false);
    }
  }
  function edit() {
    if (!profile) return;
    setForm({
      displayName: profile.displayName || "",
      contactEmail: profile.contactEmail || "",
      country: profile.country || "",
      website: profile.website || "",
      approach: profile.approach || "",
      socials: profile.socials || [],
    });
    setEditing(true);
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await run(async () => {
      await api(profile?.id ? "me" : "apply", profile?.id ? "PUT" : "POST", {
        ...form,
        payout: method,
        termsAccepted: consent,
        privacyAccepted: consent,
        termsVersion: "2026-11-24",
      });
      if (!profile?.id) await teacherRole.refresh();
      setEditing(false);
      setMethod(emptyMethod);
      setNotice(
        profile?.id
          ? "Profile updated."
          : "Application received. We will review your details."
      );
    });
  }
  const applicationForm = (
    <PartnerApplication
      value={form}
      onChange={setForm}
      editing={Boolean(profile?.id)}
      busy={busy}
      onSubmit={submit}
      onCancel={() => setEditing(false)}
      payout={<Destination value={method} onChange={setMethod} />}
      terms={<PartnerTerms />}
      consent={consent}
      onConsent={setConsent}
      payoutValid={() => {
        if (method.holder.trim().length < 2)
          return "Enter the account holder’s name.";
        if (
          method.method === "BANK" &&
          !/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(
            method.iban.replace(/\s/g, "").toUpperCase()
          )
        )
          return "Enter a valid IBAN.";
        if (
          method.method === "PAYPAL" &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(method.paypalEmail.trim())
        )
          return "Enter a valid PayPal email address.";
        return null;
      }}
    />
  );
  const payoutForm = methodOpen && (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          await api("me/payout-method", "PUT", method);
          setMethod(emptyMethod);
          setMethodOpen(false);
          setNotice(
            "Payout destination updated. Open requests were cancelled and verification is required again."
          );
        });
      }}
    >
      <Destination value={method} onChange={setMethod} />
      <div className="flex flex-wrap gap-3">
        <button className={button} disabled={busy}>
          Save confidential details
        </button>
        <button
          type="button"
          className={secondary}
          disabled={busy}
          onClick={() => {
            setMethod(emptyMethod);
            setMethodOpen(false);
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
  if (settingsMode) {
    if (!profile)
      return (
        <p data-no-translate lang="en" role={error ? "alert" : "status"}>
          {error || "Loading partner profile…"}
        </p>
      );
    if (!profile.id) return null;
    return (
      <section
        id="partner-profile"
        data-no-translate
        lang="en"
        dir="ltr"
        className="mb-8 space-y-4"
      >
        <div>
          <h2 className="text-2xl font-bold">Partner profile</h2>
          <p className="mt-2 text-sm text-gray-500">
            Update your partner contact details, social profiles and payout
            preferences.
          </p>
        </div>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="rounded-xl bg-blue-50 p-4 text-blue-800">
            {notice}
          </p>
        )}
        {editing ? (
          applicationForm
        ) : (
          <>
            <div
              className={`${card} flex flex-wrap items-center justify-between gap-4`}
            >
              <div>
                <h3 className="font-semibold">{profile.displayName}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {profile.contactEmail} · {profile.country}
                </p>
              </div>
              <button className={secondary} onClick={edit}>
                Edit partner profile
              </button>
            </div>
            <div className={card}>
              <h3 className="font-semibold">Payout details</h3>
              <p className="mt-2 text-sm text-gray-500">
                {profile.payoutMethod}: {profile.payoutMasked} ·{" "}
                {profile.payoutVerified ? "Verified" : "Awaiting verification"}
              </p>
              <button
                className={`${secondary} mt-4`}
                onClick={() => {
                  setMethod(emptyMethod);
                  setMethodOpen((v) => !v);
                }}
              >
                Update payout method
              </button>
              {payoutForm}
            </div>
          </>
        )}
      </section>
    );
  }
  async function requestPayout() {
    await run(async () => {
      const response = await fetch("/api/partners/me/payout-requests", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access-token") || ""}`,
          "Idempotency-Key": requestKey,
        },
      });
      if (!response.ok) {
        let message = "Unable to request a payout.";
        try {
          message = (await response.json()).message || message;
        } catch {}
        throw new Error(message);
      }
      setRequestKey(crypto.randomUUID());
      setNotice(
        "Payout requested. Your available funds are reserved for review."
      );
    });
  }
  function copy(text: string, success: string) {
    setError("");
    setNotice("");
    if (!navigator.clipboard) {
      setError("Copy is unavailable. Select and copy the code manually.");
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => setNotice(success))
      .catch(() => setError("Copy failed. Select and copy the code manually."));
  }
  return (
    <section
      data-no-translate
      lang="en"
      dir="ltr"
      className="mx-auto max-w-7xl space-y-6 px-4 py-6 text-gray-900 dark:text-white sm:px-8 sm:py-8"
    >
      <header className={`${panel} relative overflow-hidden px-6 py-7 sm:px-8`}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-28 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <Megaphone size={16} />
              Partner workspace
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {profile?.id
                ? "Your partner workspace"
                : "Help learners prepare. Earn a commission."}
            </h1>
            <p className={`${muted} mt-2 max-w-xl`}>
              {profile?.id
                ? "Your referrals, earnings and payouts. All in one place."
                : "Share SmartPrüfung with your audience and earn on qualifying purchases."}
            </p>
          </div>
          {profile?.id && (
            <div className="flex flex-wrap items-center gap-3">
              <PartnerBadge status={profile.status} />
              <button className={secondary} disabled={busy} onClick={edit}>
                <Settings size={16} />
                Edit profile
              </button>
            </div>
          )}
        </div>
      </header>
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-300"
        >
          <span>{error}</span>
          <button
            disabled={busy || refreshing}
            onClick={() => {
              setError("");
              load().catch((e) => setError(e.message));
            }}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}
      {notice && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300"
        >
          {notice}
        </p>
      )}
      {!ready ? (
        refreshing ? (
          <div
            role="status"
            className={`${panel} flex min-h-[220px] items-center justify-center gap-3 p-8 text-gray-500`}
          >
            <RefreshCw size={20} className="animate-spin text-blue-600" />
            Loading partner workspace…
          </div>
        ) : (
          <div className={`${panel} p-8`}>
            <h2 className="font-semibold">Your workspace couldn’t be loaded</h2>
            <p className={`${muted} mt-2`}>
              Use Try again above to reload your account information.
            </p>
          </div>
        )
      ) : !profile?.id || editing ? (
        applicationForm
      ) : (
        <PartnerDashboard
          profile={profile}
          overview={overview}
          codes={codes}
          payouts={payouts}
          entries={entries}
          page={page}
          payoutPage={payoutPage}
          setPage={setPage}
          setPayoutPage={setPayoutPage}
          busy={busy}
          refreshing={refreshing}
          onRefresh={() => run(async () => {})}
          onEdit={edit}
          onMethod={() => {
            setMethod(emptyMethod);
            setMethodOpen((v) => !v);
          }}
          onRequest={requestPayout}
          onCopy={copy}
          payoutForm={payoutForm}
          terms={<PartnerTerms />}
          analytics={analytics}
          analyticsError={analyticsError}
          onRetryCharts={loadCharts}
        />
      )}
    </section>
  );
}
