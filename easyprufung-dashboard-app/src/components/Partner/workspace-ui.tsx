export const panel =
  "rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900";
export const muted = "text-sm leading-6 text-gray-500 dark:text-gray-400";
export const money = (n = 0) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(
    n / 100
  );
const labels: Record<string, string> = {
  APPROVED: "Approved",
  PENDING: "Under review",
  REJECTED: "Not approved",
  SUSPENDED: "Suspended",
  TERMINATED: "Closed",
  REQUESTED: "Requested",
  MARKED_PAID: "Paid",
  CANCELLED: "Cancelled",
  OPEN: "Accruing",
  RESERVED: "Reserved",
  SETTLED: "Settled",
  EARNED: "Commission earned",
  REVERSAL: "Refund / dispute adjustment",
  RESTORATION: "Commission restored",
  ADJUSTMENT: "Commission adjustment",
};
export const readable = (value = "") =>
  labels[value] ||
  value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (s) => s.toUpperCase());
export function PartnerBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        ["APPROVED", "MARKED_PAID", "SETTLED"].includes(status)
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
          : ["PENDING", "REQUESTED", "RESERVED"].includes(status)
          ? "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
      }`}
    >
      {readable(status)}
    </span>
  );
}
