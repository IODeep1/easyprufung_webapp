import React, { Dispatch, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { requestGetUser } from "../../../api/user/api-helper.ts";
import { updateUser } from "../../../store/actions/user/userAccount.actions.ts";
import { useDispatch, useSelector } from "react-redux";
import { IStateType } from "../../../store/models/root.interface";
import { IUserAccount } from "../../../store/models/user/userAccount.interface";

const PaymentCheckOut = () => {
    const navigate = useNavigate();
    const dispatch: Dispatch<any> = useDispatch();
    const { search } = useLocation();

    const account: IUserAccount = useSelector((state: IStateType) => state.userAccount);
    const availableCredits = account.subscription?.iteration;

    const qp = useMemo(() => new URLSearchParams(search), [search]);
    // Expecting your Stripe success URLs for credit packs to include something like:
    // /payment_successful?product=credits&credits=100
    // You can set that per Payment Link in Stripe.
    const product = (qp.get("product") || qp.get("type") || "").toLowerCase();
    const creditsPurchased = Number(qp.get("credits") || qp.get("pack") || 0);
    const isCreditsPurchase = product === "credits" || (!!creditsPurchased && !product);

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
                if (isMounted) setIsRefreshing(false);
            }
        };

// Refresh immediately
        refreshUser();

// If it's a credits purchase, optionally refresh again shortly after redirect
// to catch webhook processing delays.
        if (isCreditsPurchase) {
            const t = setTimeout(refreshUser, 1500);
            return () => {
                isMounted = false;
                clearTimeout(t);
            };
        }

        return () => {
            isMounted = false;
        };
    }, [dispatch, isCreditsPurchase]);

    return (
        <section id="payment_successful">
            <div className="items-center justify-center text-center">
                <div className="p-6 items-center justify-center lg:w-1/2 md:mx-auto">
                    <svg viewBox="0 0 24 24" className="text-green-600 w-16 h-16 mx-auto my-6">
                        <path
                            fill="currentColor"
                            d="M12,0A12,12,0,1,0,24,12,12.014,12.014,0,0,0,12,0Zm6.927,8.2-6.845,9.289a1.011,1.011,0,0,1-1.43.188L5.764,13.769a1,1,0,1,1,1.25-1.562l4.076,3.261,6.227-8.451A1,1,0,1,1,18.927,8.2Z"
                        />
                    </svg>

                    <div className="text-center">
                        <h3 className="lg:text-4xl text-3xl font-extrabold lg:leading-[55px] text-gray-800 dark:text-white">
                            {isCreditsPurchase ? "Credits Added!" : "Payment Successful!"}
                        </h3>

                        {isCreditsPurchase ? (
                            <p className="text-l mt-6 text-gray-500 dark:text-gray-400">
                                {creditsPurchased > 0
                                    ? `Your purchase of ${creditsPurchased} credits was successful. Your balance will update shortly.`
                                    : "Your credits purchase was successful. Your balance will update shortly."}
                            </p>
                        ) : (
                            <p className="text-l mt-6 text-gray-500 dark:text-gray-400">
                                Enjoy access to EasyPrüfung's powerful tools for idea validation, branding, and landing page creation. Get started on your next big idea today!
                            </p>
                        )}

                        {/* Small status chips */}
                        <div className="mt-6 flex items-center justify-center gap-3">
                            {isCreditsPurchase && creditsPurchased > 0 && (
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800">
              Purchased: {creditsPurchased} credits
            </span>
                            )}
                            <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-200 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-800">
            {isRefreshing ? "Updating account..." : `Balance: ${availableCredits} credits`}
          </span>
                        </div>

                        <div className="py-10 text-center flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={async () => {
                                    navigate("/");
                                }}
                                className="py-3 px-6 bg-black text-white border border-black rounded-lg hover:bg-gray-800 active:bg-gray-900
                       dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-300 dark:active:bg-gray-400"
                            >
                                Go to Dashboard
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            If your credits don’t appear immediately, please wait a few seconds and refresh — it can take a moment to confirm your payment.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PaymentCheckOut;