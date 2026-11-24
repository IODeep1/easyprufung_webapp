import { tr, useFeatureLocale } from "../../localization/feature-i18n";
import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  Gift,
  HelpCircle,
  LayoutDashboard,
  List,
  Send,
  ShieldCheck,
  Wallet,
  Settings,
  Users,
  RefreshCw,
} from "lucide-react";
import { button, secondary } from "../Teacher/api";
import type { Profile, Row, Page, Code } from "./PartnerPage";
import PartnerCharts, { Analytics } from "./PartnerCharts";
import { panel, muted, money, readable, PartnerBadge } from "./workspace-ui";
type Props = {
  profile: Profile;
  overview: Record<string, number>;
  codes: Code[];
  payouts: Page<Row>;
  entries: Page<Row>;
  page: number;
  payoutPage: number;
  setPage: (n: number) => void;
  setPayoutPage: (n: number) => void;
  busy: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onEdit: () => void;
  onMethod: () => void;
  onRequest: () => void;
  onCopy: (text: string, notice: string) => void;
  payoutForm: ReactNode;
  terms: ReactNode;
  analytics?: Analytics;
  analyticsError: string;
  onRetryCharts: () => void;
};
export default function PartnerDashboard(p: Props) {
  const { locale } = useFeatureLocale();
  const [tab, setTab] = useState("overview");
  const { profile, overview: o } = p;
  const available = o.availableCents || 0,
    minimum = o.minimumPayoutCents || 5000,
    remaining = Math.max(0, minimum - available);
  const approved = profile.status === "APPROVED";
  const ready = approved && profile.payoutVerified && available >= minimum;
  const openRequest = p.payouts.content.find((r) =>
    ["REQUESTED", "APPROVED"].includes(r.status)
  );
  const reason = !approved
    ? tr("Payouts unlock after your partner account is approved.")
    : !profile.payoutVerified
    ? tr(
        "Your payout destination needs administrator verification before you can request a payment."
      )
    : remaining
    ? tr("{{amount}} more available commission to reach the payout minimum.", {
        amount: money(remaining),
      })
    : tr("You can request a manual payout of your available commission.");
  const payoutPanel = (
    <div className={`${panel} p-5 sm:p-6`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Wallet size={19} className="text-blue-600" />
          {tr("Your next payout")}
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {tr("EUR \u00B7 manual transfer")}
        </span>
      </div>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className={muted}>{tr("Available to request")}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">
            {money(available)}
          </p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {tr("Minimum {{amount}}", { amount: money(minimum) })}
        </p>
      </div>
      <progress
        className="mt-4 h-2 w-full overflow-hidden rounded-full accent-blue-600"
        max={minimum}
        value={Math.min(minimum, Math.max(0, available))}
        aria-label={tr("Progress toward {{amount}} payout", {
          amount: money(minimum),
        })}
      />
      <p id="partner-payout-eligibility" className={`${muted} mt-3`}>
        {reason}
      </p>
      {openRequest && (
        <p className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-500/10 dark:text-blue-300">
          {tr(
            openRequest.status === "APPROVED"
              ? tr(
                  "{{amount}} payout approved and awaiting manual payment. These funds are reserved separately."
                )
              : tr(
                  "{{amount}} payout requested and awaiting review. These funds are reserved separately."
                ),
            { amount: money(openRequest.amountCents) }
          )}
        </p>
      )}
      <div className="mt-5 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck
            size={16}
            className={
              profile.payoutVerified ? "text-emerald-600" : "text-amber-600"
            }
          />
          {profile.payoutVerified
            ? tr("Verified destination")
            : tr("Verification pending")}
        </div>
        <p className={`${muted} mt-1 break-words`}>
          {profile.payoutMethod === "BANK" ? tr("Bank transfer") : "PayPal"} ·{" "}
          {profile.payoutMasked || tr("Destination not set")}
        </p>
        <button
          className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400"
          onClick={p.onMethod}
        >
          {tr("Update payout method")}
        </button>
      </div>
      <button
        className={`${button} mt-5 w-full justify-center`}
        disabled={p.busy || p.refreshing || !ready}
        aria-describedby="partner-payout-eligibility"
        onClick={p.onRequest}
      >
        <ArrowDownToLine size={16} />
        {tr("Request payout")}
      </button>
      <p className={`${muted} mt-3 text-xs`}>
        {tr(
          "Reviewed and paid by bank transfer or PayPal. This request does not trigger an automatic payment."
        )}
      </p>
      {p.payoutForm}
    </div>
  );
  return (
    <>
      <nav
        aria-label={tr("Partner pages")}
        className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800"
      >
        {[
          { id: "overview", name: tr("Overview"), icon: LayoutDashboard },
          { id: "commissions", name: tr("Commissions"), icon: List },
          { id: "payouts", name: tr("Payouts"), icon: Wallet },
        ].map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            aria-current={tab === id ? "page" : undefined}
            onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              tab === id
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Icon size={16} />
            {name}
          </button>
        ))}
        <button
          className="ms-auto flex shrink-0 items-center gap-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400"
          disabled={p.busy || p.refreshing}
          onClick={p.onRefresh}
        >
          <RefreshCw size={14} className={p.refreshing ? "animate-spin" : ""} />
          {p.refreshing ? "Refreshing…" : tr("Refresh")}
        </button>
      </nav>
      {!approved && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
          <Clock3 size={22} className="mt-1 shrink-0 text-amber-600" />
          <div>
            <h2 className="font-semibold">
              {profile.status === "PENDING"
                ? tr("Your application is being reviewed")
                : tr("Your partner account needs attention")}
            </h2>
            <p className={`${muted} mt-1`}>
              {profile.reviewReason ||
                tr(
                  "We\u2019ll review your profile and payout details. Your sharing code will appear here after approval and setup."
                )}
            </p>
            <div className="mt-3 flex flex-wrap gap-4">
              <button
                onClick={p.onEdit}
                className="text-sm font-semibold text-blue-600 dark:text-blue-400"
              >
                {tr("Review your profile")}
              </button>
              <Link
                to="/contact"
                className="text-sm font-semibold text-blue-600 dark:text-blue-400"
              >
                {tr("Contact support")}
              </Link>
            </div>
          </div>
        </div>
      )}
      {tab === "overview" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: tr("Available"),
                value: o.availableCents,
                caption: tr("Ready after the hold period"),
                icon: Wallet,
              },
              {
                label: tr("Pending"),
                value: o.pendingCents,
                caption: tr("Within the {{days}}-day hold", {
                  days: o.holdDays ?? 14,
                }),
                icon: Clock3,
              },
              {
                label: tr("Reserved for payout"),
                value: o.reservedCents,
                caption: tr("Requested or approved payments"),
                icon: ArrowDownToLine,
              },
              {
                label: tr("Paid lifetime"),
                value: o.paidCents,
                caption: tr("Payments recorded as completed"),
                icon: CheckCircle2,
              },
            ].map(({ label, value, caption, icon: Icon }) => (
              <article key={label} className={`${panel} p-5`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {label}
                  </p>
                  <span className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <Icon size={18} />
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  {money(value)}
                </p>
                <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  {caption}
                </p>
              </article>
            ))}
          </div>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-6">
              {approved && (
                <section className={`${panel} overflow-hidden`}>
                  <div className="relative overflow-hidden bg-blue-600 p-6 text-white">
                    <div
                      aria-hidden
                      className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-white/10"
                    />
                    <p className="relative flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-100">
                      <Gift size={16} />
                      {tr("Share & earn")}
                    </p>
                    <h2 className="relative mt-3 text-xl font-bold">
                      {tr("A little help for learners. A reward for you.")}
                    </h2>
                    <p className="relative mt-2 max-w-lg text-sm leading-6 text-blue-100">
                      {tr(
                        "Give learners {{discount}}% off. Earn {{commission}}% commission on qualifying purchases.",
                        {
                          discount: (
                            (profile.discountBps || 0) / 100
                          ).toLocaleString(locale),
                          commission: (
                            (profile.commissionBps || 0) / 100
                          ).toLocaleString(locale),
                        }
                      )}
                    </p>
                  </div>
                  <div className="space-y-4 p-5 sm:p-6">
                    <h3 className="font-semibold">
                      {tr("Your discount codes")}
                    </h3>
                    {p.codes.length ? (
                      p.codes.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4 dark:border-blue-500/30 dark:bg-blue-500/5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <code
                              dir="ltr"
                              className="font-mono break-all text-2xl font-bold tracking-wide text-blue-700 dark:text-blue-300"
                            >
                              {c.displayCode}
                            </code>
                            <button
                              className={secondary}
                              onClick={() =>
                                p.onCopy(c.displayCode, tr("Code copied."))
                              }
                            >
                              <Copy size={15} />
                              {tr("Copy code")}
                            </button>
                          </div>
                          <button
                            className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400"
                            onClick={() =>
                              p.onCopy(
                                tr(
                                  "Prepare for TELC Deutsch B1 with SmartPrüfung: {{url}} — enter {{code}} in Stripe Checkout for your discount. I may earn a commission on qualifying purchases.",
                                  {
                                    url: `https://smartpruefung.com/${locale}/for-learners`,
                                    code: c.displayCode,
                                  }
                                ),
                                tr("Sharing text copied.")
                              )
                            }
                          >
                            <Send size={15} />
                            {tr("Copy sharing text")}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                        <p className="font-medium">
                          {tr("Your code is being prepared")}
                        </p>
                        <p className={`${muted} mt-1`}>
                          {tr(
                            "An administrator will link your discount code. Check back here before sharing."
                          )}
                        </p>
                      </div>
                    )}
                    <p className={muted}>
                      {tr(
                        "Learners must enter the code in Stripe Checkout for 10 Exams or Unlimited. Sharing a link alone does not apply the discount."
                      )}
                    </p>
                  </div>
                </section>
              )}
              <div
                className={`${panel} grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 sm:p-6`}
              >
                {[
                  [tr("Qualified uses lifetime"), o.lifetimeQualifiedUses],
                  [tr("This month \u00B7 UTC"), o.monthQualifiedUses],
                  [tr("Unpaid cycle uses"), o.unpaidUses],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
                      {label}
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {Number(value || 0).toLocaleString(locale)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <aside className="space-y-5">
              {payoutPanel}
              <div className={`${panel} p-5`}>
                <h2 className="flex items-center gap-2 font-semibold">
                  <HelpCircle size={17} className="text-blue-600" />
                  {tr("Make your first referral")}
                </h2>
                <ol className="mt-4 space-y-4">
                  {[
                    tr("Share your code with your audience."),
                    tr("Learners apply it at checkout."),
                    tr("Verified commission clears after {{days}} days.", {
                      days: o.holdDays ?? 14,
                    }),
                  ].map((s, i) => (
                    <li
                      key={s}
                      className="flex gap-3 text-sm leading-6 text-gray-500 dark:text-gray-400"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
                <p className="mt-4 border-t border-gray-100 pt-4 text-xs leading-5 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  {tr(
                    "Let learners know you may earn a commission when you recommend SmartPr\u00FCfung."
                  )}
                </p>
              </div>
            </aside>
          </div>
          <PartnerCharts
            data={p.analytics}
            error={p.analyticsError}
            onRetry={p.onRetryCharts}
          />
          <div
            className={`${panel} flex flex-wrap items-center justify-between gap-4 p-5`}
          >
            <div>
              <h2 className="font-semibold">{tr("Your partner profile")}</h2>
              <p className={muted}>
                {profile.displayName} · {profile.contactEmail}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={p.onEdit} className={secondary}>
                <Settings size={15} />
                {tr("Edit profile")}
              </button>
              <Link to="/contact" className={secondary}>
                {tr("Get help")}
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </>
      )}
      {tab === "commissions" && (
        <>
          <div>
            <h2 className="text-xl font-bold">{tr("Commission history")}</h2>
            <p className={`${muted} mt-2`}>
              {tr(
                "Every earning and adjustment, including refunds and disputes."
              )}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [tr("Earned lifetime"), o.lifetimeEarnedCents],
              [tr("Reversed lifetime"), o.reversedCents],
              [
                tr("Net lifetime commission"),
                (o.lifetimeEarnedCents || 0) - (o.reversedCents || 0),
              ],
            ].map(([s, n]) => (
              <div key={String(s)} className={`${panel} p-5`}>
                <p className={muted}>{s}</p>
                <p className="mt-2 text-2xl font-bold">
                  {money(Number(n || 0))}
                </p>
              </div>
            ))}
          </div>
          <Records
            title={tr("Commission entries")}
            rows={p.entries}
            page={p.page}
            setPage={p.setPage}
            disabled={p.refreshing || p.busy}
          />
        </>
      )}
      {tab === "payouts" && (
        <>
          <div>
            <h2 className="text-xl font-bold">{tr("Payouts")}</h2>
            <p className={`${muted} mt-2`}>
              {tr(
                "Request a payment and follow its progress from review to completion."
              )}
            </p>
          </div>
          <div className="grid items-start gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            {payoutPanel}
            <Records
              title={tr("Payout history")}
              rows={p.payouts}
              page={p.payoutPage}
              setPage={p.setPayoutPage}
              disabled={p.refreshing || p.busy}
              payout
            />
          </div>
        </>
      )}
      {p.terms}
    </>
  );
}
function Records({
  title,
  rows,
  page,
  setPage,
  disabled,
  payout = false,
}: {
  title: string;
  rows: Page<Row>;
  page: number;
  setPage: (n: number) => void;
  disabled: boolean;
  payout?: boolean;
}) {
  const { locale } = useFeatureLocale();
  return (
    <section className={`${panel} min-w-0 overflow-hidden`}>
      <div className="flex flex-wrap items-center justify-between gap-2 p-5">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {tr("{{count}} records", {
            count: rows.totalElements.toLocaleString(locale),
          })}
        </span>
      </div>
      {rows.content.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <caption className="sr-only">{title}</caption>
            <thead className="border-y border-gray-100 bg-gray-50 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                {[
                  tr("Date"),
                  tr("Amount"),
                  tr("Status"),
                  payout ? tr("Destination / reference") : tr("Entry"),
                ].map((s) => (
                  <th
                    scope="col"
                    key={s}
                    className="whitespace-nowrap px-5 py-3 font-medium"
                  >
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.content.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString(locale)}
                    <br />
                    <span className="text-[11px]">
                      {new Date(r.createdAt).toLocaleTimeString(locale, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td
                    className={`whitespace-nowrap px-5 py-4 font-semibold ${
                      r.amountCents < 0
                        ? "text-amber-700 dark:text-amber-400"
                        : ""
                    }`}
                  >
                    {money(r.amountCents)}
                  </td>
                  <td className="px-5 py-4">
                    <PartnerBadge status={r.status} />
                  </td>
                  <td className="min-w-[150px] max-w-xs break-words px-5 py-4 text-xs leading-5 text-gray-500 dark:text-gray-400">
                    {payout ? r.maskedDestination : readable(r.kind)}
                    {r.externalReference && (
                      <div>
                        {tr("Reference: {{reference}}", {
                          reference: r.externalReference,
                        })}
                      </div>
                    )}
                    {payout && r.paidAt && (
                      <div>
                        {tr("Paid {{date}}", {
                          date: new Date(r.paidAt).toLocaleDateString(locale),
                        })}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center border-t border-gray-100 px-6 py-12 text-center dark:border-gray-800">
          <span className="rounded-2xl bg-blue-50 p-4 text-blue-600 dark:bg-blue-500/10">
            {payout ? <Wallet size={24} /> : <Users size={24} />}
          </span>
          <h4 className="mt-4 font-semibold">
            {payout
              ? tr("No payouts yet")
              : tr("Your first commission starts here")}
          </h4>
          <p className={`${muted} mt-2 max-w-sm`}>
            {payout
              ? tr(
                  "Payments will appear here when you request a payout. Reach the minimum and verify your destination to get started."
                )
              : tr(
                  "Qualifying purchases and any adjustments will appear here once learners use your code."
                )}
          </p>
        </div>
      )}
      {rows.totalElements > 20 && (
        <div className="flex items-center justify-between gap-3 p-4">
          <button
            className={secondary}
            disabled={disabled || page === 0}
            onClick={() => setPage(page - 1)}
          >
            {tr("Previous")}
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {tr("Page {{page}} of {{total}}", {
              page: page + 1,
              total: Math.ceil(rows.totalElements / 20),
            })}
          </span>
          <button
            className={secondary}
            disabled={disabled || (page + 1) * 20 >= rows.totalElements}
            onClick={() => setPage(page + 1)}
          >
            {tr("Next")}
          </button>
        </div>
      )}
    </section>
  );
}
