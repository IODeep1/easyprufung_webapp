import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { teacherApi, Order, secondary } from "./api";
import { panel, muted, Status } from "./ui";
export type CheckoutOrderState = {
  order: Order;
  seats: {
    purchased: number;
    assigned: number;
    available: number;
    reserved: number;
    activated: number;
  };
};
/** The redirect is only a prompt to read server status; it never creates seats. */
export default function TeacherCheckoutReturn({
  orderId,
  onConfirmed,
}: {
  orderId: string;
  onConfirmed: () => Promise<void>;
}) {
  const [state, setState] = useState<CheckoutOrderState | null>(null),
    [error, setError] = useState(""),
    [waiting, setWaiting] = useState(false),
    [retry, setRetry] = useState(0);
  const refresh = useCallback(() => {
    setRetry((v) => v + 1);
  }, []);
  useEffect(() => {
    let active = true,
      timer: number | undefined,
      attempt = 0;
    setState(null);
    setError("");
    setWaiting(false);
    const check = async () => {
      try {
        const response = await teacherApi<CheckoutOrderState>(
          `teacher/seats/orders/${encodeURIComponent(orderId)}`
        );
        if (!active) return;
        setState(response);
        if (response.order.status === "PAID") {
          try {
            await onConfirmed();
          } catch {
            if (active)
              setError(
                "Payment is confirmed, but the wallet could not refresh. Select Check again to refresh it."
              );
          }
          return;
        }
        if (response.order.status === "PENDING") {
          attempt++;
          if (attempt < 20) timer = window.setTimeout(check, 3000);
          else setWaiting(true);
        }
      } catch (e) {
        if (active)
          setError(
            e instanceof Error
              ? e.message
              : "Could not check this payment. Please refresh."
          );
      }
    };
    void check();
    return () => {
      active = false;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [orderId, onConfirmed, retry]);
  const paid = state?.order.status === "PAID",
    pending = !state || state.order.status === "PENDING";
  return (
    <section
      aria-label="Checkout payment status"
      className={`${panel} overflow-hidden`}
    >
      <div
        role="status"
        className={`flex flex-wrap items-start justify-between gap-4 p-5 ${
          paid
            ? "bg-emerald-50 dark:bg-emerald-500/10"
            : pending
            ? "bg-blue-50 dark:bg-blue-500/10"
            : "bg-amber-50 dark:bg-amber-500/10"
        }`}
      >
        <div className="flex items-start gap-3">
          {paid ? (
            <CheckCircle2 size={23} className="shrink-0 text-emerald-600" />
          ) : pending ? (
            <Clock size={23} className="shrink-0 text-blue-600" />
          ) : (
            <AlertCircle size={23} className="shrink-0 text-amber-600" />
          )}
          <div>
            <h2 className="font-semibold">
              {paid
                ? "Payment confirmed"
                : error
                ? "Payment status unavailable"
                : pending
                ? "Confirming your payment"
                : "This payment needs attention"}
            </h2>
            <p className={`${muted} mt-1`}>
              {error ||
                (paid
                  ? `${state.seats.purchased} exam seats have been added to your wallet.`
                  : pending
                  ? waiting
                    ? "Confirmation is taking longer than usual. Refresh to check again; your payment has not been marked successful."
                    : "We’re waiting for Stripe to confirm payment. Seats become available after confirmation."
                  : "No additional seats are granted by this return page. Review the status below or try a new checkout.")}
            </p>
            {state && !pending && !paid && (
              <div className="mt-3">
                <Status value={state.order.status} />
              </div>
            )}
          </div>
        </div>
        <button className={secondary} onClick={refresh}>
          <RefreshCw size={15} />
          Check again
        </button>
      </div>
      {paid && state && (
        <div className="p-5">
          <dl className="grid grid-cols-3 gap-4">
            {[
              ["Purchased", state.seats.purchased],
              ["Assigned", state.seats.assigned],
              ["Available", state.seats.available],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-gray-500">{label}</dt>
                <dd className="mt-1 text-2xl font-bold">{value}</dd>
              </div>
            ))}
          </dl>
          <Link
            to="/teacher/classes"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
          >
            Offer seats to your students
            <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </section>
  );
}
