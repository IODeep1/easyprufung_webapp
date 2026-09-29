import React, { Dispatch, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestGetUser } from "../../../api/user/api-helper.ts";
import { updateUser } from "../../../store/actions/user/userAccount.actions.ts";
import { useDispatch, useSelector } from "react-redux";
import { IStateType } from "../../../store/models/root.interface";
import { IUserAccount } from "../../../store/models/user/userAccount.interface";

const PaymentCheckOut = () => {
    const navigate = useNavigate();
    const dispatch: Dispatch<any> = useDispatch();

    const account: IUserAccount = useSelector((state: IStateType) => state.userAccount);

    // Cast keeps this component compatible while the frontend subscription
    // interface is being migrated from the old `iteration` field to `quota`.
    const subscription = account?.user.subscription as any;
    const availableQuota = subscription?.quota ?? 0;
    const accessEndDate = subscription?.endDate;

    const [isRefreshing, setIsRefreshing] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const refreshUser = async () => {
            try {
                const user = await requestGetUser(dispatch);
                if (isMounted && user) {
                    dispatch(updateUser(user));
                }
            } finally {
                if (isMounted) {
                    setIsRefreshing(false);
                }
            }
        };

        // Refresh immediately, then once again to allow the Stripe webhook
        // a short moment to activate the paid B1 access record.
        refreshUser();
        const refreshTimer = setTimeout(refreshUser, 1500);

        return () => {
            isMounted = false;
            clearTimeout(refreshTimer);
        };
    }, [dispatch]);

    const formattedEndDate = accessEndDate
        ? new Intl.DateTimeFormat(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
          }).format(new Date(accessEndDate))
        : null;

    return (
        <section id="payment_successful" className="py-12 sm:py-16">
            <div className="mx-auto flex max-w-3xl items-center justify-center px-4 text-center">
                <div className="w-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-10 dark:border-neutral-800 dark:bg-neutral-950">
                    <svg viewBox="0 0 24 24" className="mx-auto my-6 h-16 w-16 text-green-600">
                        <path
                            fill="currentColor"
                            d="M12,0A12,12,0,1,0,24,12,12.014,12.014,0,0,0,12,0Zm6.927,8.2-6.845,9.289a1.011,1.011,0,0,1-1.43.188L5.764,13.769a1,1,0,1,1,1.25-1.562l4.076,3.261,6.227-8.451A1,1,0,1,1,18.927,8.2Z"
                        />
                    </svg>

                    <h3 className="text-3xl font-extrabold text-gray-800 lg:text-4xl lg:leading-[55px] dark:text-white">
                        Payment Successful!
                    </h3>

                    <p className="mx-auto mt-6 max-w-xl text-base text-gray-500 sm:text-lg dark:text-gray-400">
                        Your TELC Deutsch B1 Exam Pass is being activated. You now have up to 10 exam quotas and 60 days to prepare with EasyPrüfung.
                    </p>

                    <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800">
                            TELC B1 · €19 one-time
                        </span>
                        <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-200 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-800">
                            {isRefreshing ? "Updating account..." : `${availableQuota} exam quotas available`}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 ring-1 ring-inset ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-800">
                            {formattedEndDate ? `Access until ${formattedEndDate}` : "60 days of access"}
                        </span>
                    </div>

                    <div className="flex items-center justify-center gap-3 py-10 text-center">
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="rounded-lg border border-black bg-black px-6 py-3 text-white transition hover:bg-gray-800 active:bg-gray-900 dark:border-white dark:bg-white dark:text-black dark:hover:bg-gray-300 dark:active:bg-gray-400"
                        >
                            Start practicing
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        If the quota does not update immediately, payment confirmation may still be processing. Refresh this page after a moment.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default PaymentCheckOut;
