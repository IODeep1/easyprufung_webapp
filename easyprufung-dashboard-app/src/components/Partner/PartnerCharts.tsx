import {
  tr,
  useFeatureLocale,
  featureLocale,
} from "../../localization/feature-i18n";
import { useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { panel, muted, money } from "./workspace-ui";
export type Month = {
  month: string;
  earnedCents: number;
  adjustmentCents: number;
  netCents: number;
  qualifiedPurchases: number;
};
export type Analytics = {
  months: Month[];
  timezone: string;
  asOf: string;
};
const label = (month: string, long = false) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString(featureLocale(), {
    month: long ? "long" : "short",
    year: long ? "numeric" : undefined,
    timeZone: "UTC",
  });
export default function PartnerCharts({
  data,
  error,
  onRetry,
}: {
  data?: Analytics;
  error: string;
  onRetry: () => void;
}) {
  const { locale } = useFeatureLocale();
  const [range, setRange] = useState(6);
  if (error)
    return (
      <div className={`${panel} p-6`} role="alert">
        <h2 className="font-semibold">{tr("Charts are unavailable")}</h2>
        <p className={`${muted} mt-2`}>
          {tr(
            "Your balances and history are still available. Try loading the charts again."
          )}
        </p>
        <button
          className="mt-3 text-sm font-semibold text-blue-600 dark:text-blue-400"
          onClick={onRetry}
        >
          {tr("Retry charts")}
        </button>
      </div>
    );
  if (!data)
    return (
      <div role="status" className={`${panel} p-8 ${muted}`}>
        {tr("Loading partner activity charts\u2026")}
      </div>
    );
  const months = data.months.slice(-range);
  return (
    <section aria-label={tr("Partner performance")} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{tr("Your performance")}</h2>
          <p className={muted}>
            {tr("Calendar months in UTC · updated {{date}}", {
              date: new Date(data.asOf).toLocaleDateString(locale, {
                timeZone: "UTC",
              }),
            })}
          </p>
        </div>
        <div
          className="flex rounded-xl border border-gray-200 p-1 dark:border-gray-700"
          aria-label={tr("Chart period")}
        >
          {[3, 6].map((n) => (
            <button
              key={n}
              aria-pressed={range === n}
              onClick={() => setRange(n)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                range === n
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              {tr("{{count}} months", { count: n })}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Chart months={months} kind="earnings" />
        <Chart months={months} kind="purchases" />
      </div>
      <details className={`${panel} p-4 text-sm`}>
        <summary className="cursor-pointer font-semibold">
          {tr("View chart data")}
        </summary>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-start">
            <caption className="sr-only">
              {tr("Monthly partner performance in UTC")}
            </caption>
            <thead>
              <tr>
                {[
                  tr("Month"),
                  tr("Earned"),
                  tr("Adjustments"),
                  tr("Net commission"),
                  tr("Purchases"),
                ].map((v) => (
                  <th
                    key={v}
                    className="whitespace-nowrap p-2 font-medium text-gray-500"
                  >
                    {v}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr
                  key={m.month}
                  className="border-t border-gray-100 dark:border-gray-800"
                >
                  <th scope="row" className="whitespace-nowrap p-2 font-medium">
                    {label(m.month, true)}
                  </th>
                  <td className="p-2">{money(m.earnedCents)}</td>
                  <td className="p-2">{money(m.adjustmentCents)}</td>
                  <td className="p-2">{money(m.netCents)}</td>
                  <td className="p-2">{m.qualifiedPurchases}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
function Chart({
  months,
  kind,
}: {
  months: Month[];
  kind: "earnings" | "purchases";
}) {
  const { locale } = useFeatureLocale();
  const earnings = kind === "earnings",
    [selected, setSelected] = useState<string>();
  const values = months.map((m) =>
    earnings ? m.netCents : m.qualifiedPurchases
  );
  const max = Math.max(earnings ? 100 : 1, ...values),
    min = Math.min(0, ...values);
  const top = 25,
    height = 140,
    bottom = top + height,
    left = 65,
    width = 460;
  const y = (v: number) => top + ((max - v) / (max - min)) * height,
    zero = y(0);
  const current =
    months.find((m) => m.month === selected) || months[months.length - 1];
  const total = values.reduce((a, b) => a + b, 0),
    empty = values.every((v) => v === 0);
  const title = earnings ? tr("Net commission") : tr("Qualified purchases"),
    Icon = earnings ? TrendingUp : BarChart3;
  return (
    <article className={`${panel} min-w-0 p-5 sm:p-6`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Icon size={17} className="text-blue-600 dark:text-blue-400" />
            {title}
          </h3>
          <p className="mt-3 text-3xl font-bold tracking-tight">
            {earnings ? money(total) : total.toLocaleString(locale)}
          </p>
          <p className={`${muted} mt-1`}>
            {tr("Across these {{count}} months", { count: months.length })}
          </p>
        </div>
        <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          {earnings ? "EUR" : tr("Purchases")}
        </span>
      </div>
      <svg
        style={{ direction: "ltr" }}
        viewBox="0 0 550 220"
        role="img"
        aria-label={tr(
          "{{title}}, {{months}} months. {{total}} total. Exact monthly figures are in View chart data.",
          {
            title,
            months: months.length,
            total: earnings ? money(total) : total,
          }
        )}
        className="mt-5 w-full overflow-visible"
      >
        {[max, (max + min) / 2, min].map((v, i) => (
          <g key={i}>
            <line
              x1={left}
              x2={left + width}
              y1={y(v)}
              y2={y(v)}
              stroke="currentColor"
              className="text-gray-100 dark:text-gray-800"
            />
            <text
              x={left - 9}
              y={y(v) + 4}
              textAnchor="end"
              fill="currentColor"
              fontSize="11"
              className="text-gray-500 dark:text-gray-400"
            >
              {earnings
                ? new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  }).format(v / 100)
                : Number.isInteger(v)
                ? v
                : ""}
            </text>
          </g>
        ))}
        <line
          x1={left}
          x2={left + width}
          y1={zero}
          y2={zero}
          stroke="currentColor"
          className="text-gray-300 dark:text-gray-600"
        />
        {months.map((m, i) => {
          const v = values[i],
            col = width / months.length,
            x = left + i * col + col * 0.23,
            barWidth = col * 0.54;
          return (
            <g
              key={m.month}
              onMouseEnter={() => setSelected(m.month)}
              onMouseLeave={() => setSelected(undefined)}
            >
              <rect
                x={x}
                y={v >= 0 ? y(v) : zero}
                width={barWidth}
                height={Math.max(2, Math.abs(y(v) - zero))}
                rx="5"
                fill={v < 0 ? "#f59e0b" : earnings ? "#2563eb" : "#14b8a6"}
                opacity={selected && selected !== m.month ? 0.55 : 1}
              >
                <title>
                  {label(m.month, true)}: {earnings ? money(v) : v}
                </title>
              </rect>
              <text
                x={x + barWidth / 2}
                y={bottom + 25}
                fill="currentColor"
                textAnchor="middle"
                fontSize="12"
                className="text-gray-500 dark:text-gray-400"
              >
                {label(m.month)}
              </text>
            </g>
          );
        })}
      </svg>
      {current && (
        <p
          aria-live="polite"
          className="-mt-3 flex justify-between gap-3 border-t border-gray-100 pt-3 text-xs dark:border-gray-800"
        >
          <span className="text-gray-500 dark:text-gray-400">
            {label(current.month, true)}
          </span>
          <strong>
            {earnings
              ? money(current.netCents)
              : tr("{{count}} purchases", {
                  count: current.qualifiedPurchases,
                })}
          </strong>
        </p>
      )}
      <p className={`${muted} mt-3`}>
        {empty
          ? earnings
            ? tr(
                "No commission recorded in this period. Your first qualifying purchase will appear here."
              )
            : tr(
                "No qualifying purchases in this period. Share your code to get started."
              )
          : earnings
          ? tr(
              "Earned commission plus refund and dispute adjustments, by record date. This is not your payout balance."
            )
          : tr(
              "Verified purchases using your code, by payment date. Refunded purchases may remain counted; adjustments appear in net commission."
            )}
      </p>
    </article>
  );
}
