import { tr, useFeatureLocale } from "../../localization/feature-i18n";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { button, card } from "./api";
import { useSelector } from "react-redux";
import type { IStateType } from "../../store/models/root.interface";
import { buildPaymentUrl } from "../User/Pricing/payment-links";
export default function StudentPurchase() {
  const { locale, dir } = useFeatureLocale();

  const [params] = useSearchParams(),
    [error, setError] = useState("");
  const plan = params.get("plan");
  const user = useSelector((state: IStateType) => state.userAccount.user);
  useEffect(() => {
    if (plan !== "b1" && plan !== "b1_unlimited") {
      setError("Choose an exam plan.");
      return;
    }
    if (!user?.uuid || !user?.email) {
      setError("Sign in to continue.");
      return;
    }
    setError("");
    // Compatibility for saved /purchase URLs: individual plans use the original Payment Links.
    window.location.replace(buildPaymentUrl(plan, user.email, user.uuid));
  }, [plan, user?.email, user?.uuid]);
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
