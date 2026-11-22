import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { teacherApi, button, card } from "./api";
export default function StudentPurchase() {
  const [params] = useSearchParams(),
    [error, setError] = useState("");
  const plan = params.get("plan");
  useEffect(() => {
    let active = true;
    if (plan !== "b1" && plan !== "b1_unlimited") {
      setError("Choose an exam plan.");
      return;
    }
    teacherApi<{ url: string }>("student/access/checkout", "POST", { plan })
      .then((r) => {
        if (active) window.location.assign(r.url);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [plan]);
  return (
    <section className={`${card} mx-auto my-12 max-w-lg`}>
      <h1 className="text-2xl font-bold">Secure checkout</h1>
      {error ? (
        <>
          <p role="alert" className="my-4">
            {error}
          </p>
          <Link className={button} to="/pricing">
            Back to plans
          </Link>
        </>
      ) : (
        <p role="status" className="my-4">
          Opening Stripe checkout…
        </p>
      )}
    </section>
  );
}
