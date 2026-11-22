import { tr, useFeatureLocale } from "../../localization/feature-i18n";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { teacherApi, button, card } from "./api";
export default function StudentPurchase() {
  const { locale, dir } = useFeatureLocale();

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
    <section
      lang={locale}
      dir={dir}
      data-no-translate
      className={`${card} mx-auto my-12 max-w-lg`}
    >
      <h1 className="text-2xl font-bold">{tr("Secure checkout")}</h1>
      {error ? (
        <>
          <p role="alert" className="my-4">
            {tr(error)}
          </p>
          <Link className={button} to="/pricing">
            {tr("Back to plans")}
          </Link>
        </>
      ) : (
        <p role="status" className="my-4">
          {tr("Opening Stripe checkout…")}
        </p>
      )}
    </section>
  );
}
