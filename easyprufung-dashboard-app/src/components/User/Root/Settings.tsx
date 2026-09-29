import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { OnChangeModel } from "../../../common/types/Form.types";
import { requestUpdateUser } from "../../../api/user/api-helper";
import TextInput from "../../../common/components/TextInput";
import { IUser } from "../../../store/models/user/user.interface";
import { IStateType } from "../../../store/models/root.interface";
import { updateUser } from "../../../store/actions/user/userAccount.actions";
import { IUserAccount } from "../../../store/models/user/userAccount.interface";

const ArrowRight = ({ className = "h-4 w-4" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M18 8L22 12L18 16" />
        <path d="M2 12H22" />
    </svg>
);

const Settings = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const currentUser: IUser | undefined = useSelector(
        (state: IStateType) => state.userAccount.user
    );
    const account: IUserAccount = useSelector(
        (state: IStateType) => state.userAccount
    );

    // The backend now stores exactly one Subscription per user.
    // `as any` keeps this component compatible while the frontend interface
    // is migrated from the old `iteration` model to the new `quota` field.
    const subscription = currentUser?.subscription as any;

    const currentPlan = (subscription?.plan || "free").toLowerCase();
    const subscriptionStatus = (subscription?.status || "active").toLowerCase();
    const availableQuota = subscription?.quota ?? 0;

    const isFree = currentPlan === "free";
    const isB1 = currentPlan === "b1";
    const isTester = currentPlan === "tester";

    const rawEndDate = subscription?.endDate;
    const endDate = rawEndDate ? new Date(rawEndDate) : null;
    const hasValidEndDate = Boolean(
        endDate && !Number.isNaN(endDate.getTime())
    );
    const isPastEndDate = Boolean(
        hasValidEndDate && endDate && endDate.getTime() <= Date.now()
    );
    const isExpired =
        subscriptionStatus === "expired" ||
        subscription?.isActive === false ||
        isPastEndDate;

    const formattedEndDate = hasValidEndDate && endDate
        ? new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(endDate)
        : null;

    const planLabel = isExpired && !isFree
        ? "Expired"
        : isTester
            ? "Tester"
            : isB1
                ? "TELC B1 Exam Pass"
                : "Free";

    const planDescription = (() => {
        if (isTester) {
            if (isExpired) {
                return "Your tester access has expired. You can continue with the TELC B1 Exam Pass.";
            }
            return formattedEndDate
                ? `Tester access is active until ${formattedEndDate}.`
                : "Tester access is active.";
        }

        if (isB1) {
            if (isExpired) {
                return "Your TELC B1 access period has ended. Buy a new pass to receive 10 quotas and a fresh 60-day access period.";
            }
            if (availableQuota <= 0) {
                return "You have used all 10 exam quotas. Buy a new pass to reset your balance to 10 quotas and start a fresh 60-day access period.";
            }
            return formattedEndDate
                ? `Your TELC B1 Exam Pass is active until ${formattedEndDate}. Quotas do not renew automatically.`
                : "Your TELC B1 Exam Pass is active. Quotas do not renew automatically.";
        }

        if (availableQuota > 0) {
            return "Your free account includes 1 exam quota. The free quota is granted once and does not renew.";
        }

        return "You have used your free exam quota. Unlock 10 new quotas with the TELC B1 Exam Pass.";
    })();

    // Show checkout only when it is useful. A paid purchase resets the account
    // to 10 quotas and starts a fresh 60-day window, so active paid users with
    // remaining quota are not encouraged to overwrite their current balance.
    const shouldShowPurchase =
        isFree ||
        isExpired ||
        ((isB1 || isTester) && availableQuota <= 0);

    const paymentLinkBase =
        "https://buy.stripe.com/test_dRmeVcaaZ7RBcES0m433W00";
    const paymentParams = new URLSearchParams();

    if (account?.user?.email) {
        paymentParams.set("prefilled_email", account.user.email);
    }
    if (account?.user?.uuid) {
        paymentParams.set("client_reference_id", account.user.uuid);
    }

    const paymentUrl = paymentParams.toString()
        ? `${paymentLinkBase}?${paymentParams.toString()}`
        : paymentLinkBase;

    const [popup, setPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [error, setError] = useState("");
    const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
    const [isSubmittingPass, setIsSubmittingPass] = useState(false);
    const [formState, setFormState] = useState({
        firstname: { error: "", value: currentUser?.firstname || "" },
        lastname: { error: "", value: currentUser?.lastname || "" },
        email: { error: "", value: currentUser?.email || "" },
        password: { error: "", value: "" },
        confirmpassword: { error: "", value: "" },
    });

    // Keep support for old links that point to #credits while moving the UI
    // terminology to the more accurate "exam access" model.
    const accessRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (
            window.location.hash === "#credits" ||
            window.location.hash === "#access"
        ) {
            setTimeout(() => {
                accessRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, []);

    useEffect(() => {
        setFormState((prev) => ({
            ...prev,
            firstname: {
                error: prev.firstname.error,
                value: currentUser?.firstname || "",
            },
            lastname: {
                error: prev.lastname.error,
                value: currentUser?.lastname || "",
            },
            email: {
                error: prev.email.error,
                value: currentUser?.email || "",
            },
        }));
    }, [currentUser?.firstname, currentUser?.lastname, currentUser?.email]);

    function hasFormValueChanged(model: OnChangeModel): void {
        setError("");
        setFormState((prev) => ({
            ...prev,
            [model.field]: { error: model.error, value: model.value },
        }));

        if (model.field === "password") {
            const validation = validatePassword(model.value);
            if (validation !== "") setError(validation);
        }
    }

    const validatePassword = (password: string) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength)
            return "Password must be at least 8 characters long.";
        if (!hasUpperCase)
            return "Password must contain at least one uppercase letter.";
        if (!hasLowerCase)
            return "Password must contain at least one lowercase letter.";
        if (!hasNumbers) return "Password must contain at least one number.";
        if (!hasSpecialChars)
            return "Password must contain at least one special character.";
        return "";
    };

    async function updateUserData(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setIsSubmittingInfo(true);
        try {
            const newUser: IUser = {
                ...(currentUser || ({} as IUser)),
                firstname: formState.firstname.value,
                lastname: formState.lastname.value,
                email: formState.email.value,
            };
            const updatedUser = await requestUpdateUser(newUser, dispatch);
            if (!updatedUser) {
                setPopupMessage(
                    "Unfortunately, we can’t update your account at this moment. Please try again later."
                );
            } else {
                dispatch(updateUser(updatedUser));
                setPopupMessage("Changes successfully saved.");
            }
            setPopup(true);
        } catch {
            setPopupMessage("Something went wrong. Please try again.");
            setPopup(true);
        } finally {
            setIsSubmittingInfo(false);
        }
    }

    async function updatepassword(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        if (formState.password.value !== formState.confirmpassword.value) {
            setError("Password does not match");
            return;
        }
        const validation = validatePassword(formState.password.value);
        if (validation !== "") {
            setError(validation);
            return;
        }
        setIsSubmittingPass(true);
        try {
            const newUser: IUser = {
                ...(currentUser || ({} as IUser)),
                firstname: formState.firstname.value,
                lastname: formState.lastname.value,
                email: formState.email.value,
                password: formState.password.value,
            };
            const updatedUser = await requestUpdateUser(newUser);
            if (!updatedUser) {
                setPopupMessage(
                    "Unfortunately, we can’t update your account at this moment. Please try again later."
                );
            } else {
                setPopupMessage("Changes successfully saved.");
            }
            setPopup(true);
        } catch {
            setPopupMessage("Something went wrong. Please try again.");
            setPopup(true);
        } finally {
            setIsSubmittingPass(false);
        }
    }

    const inputClass =
        "w-full bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10 " +
        "text-black dark:text-white text-sm rounded-xl px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 " +
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";
    const labelClass =
        "block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300";

    return (
        <section
            id="profile"
            className="relative min-h-screen text-black dark:text-white px-6 py-10"
        >
            <div className="relative z-10 mx-auto max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Settings
                    </h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Manage your profile, exam access, quota, and password.
                    </p>
                </div>

                {/* Exam access / quota status */}
                <div
                    id="access"
                    ref={accessRef}
                    className="mb-8 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/60 backdrop-blur-xl shadow-xl overflow-hidden"
                >
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />
                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Exam access</h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Your current EasyPrufung access and remaining exam quota.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${
                                        isExpired && !isFree
                                            ? "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-900/40"
                                            : isB1 || isTester
                                                ? "bg-green-100 text-green-700 ring-green-200 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-900/40"
                                                : "bg-neutral-100 text-neutral-700 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-800"
                                    }`}
                                >
                                    {planLabel}
                                </span>

                                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800">
                                    {availableQuota} {availableQuota === 1 ? "quota" : "quotas"} remaining
                                </span>

                                {formattedEndDate && !isFree && (
                                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-sm font-semibold text-neutral-700 ring-1 ring-inset ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-800">
                                        {isExpired ? "Ended" : "Until"} {formattedEndDate}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 rounded-xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.04]">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {planDescription}
                            </p>
                        </div>

                        {shouldShowPurchase && (
                            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        TELC Deutsch B1 Exam Pass
                                    </p>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        €19 one-time · 10 exam quotas · 60 days · no automatic renewal
                                    </p>
                                </div>

                                <a
                                    href={paymentUrl}
                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-black bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black/90 active:bg-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-white/90"
                                >
                                    {isFree && availableQuota > 0
                                        ? "Unlock 10 quotas — €19"
                                        : "Buy B1 Exam Pass — €19"}
                                    <ArrowRight />
                                </a>
                            </div>
                        )}

                        {isB1 && !isExpired && availableQuota > 0 && (
                            <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                                Your current pass is active. Use your remaining quota before buying another pass, because a new purchase starts a fresh 10-quota / 60-day period.
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal details card */}
                    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/60 backdrop-blur-xl shadow-xl overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />
                        <form
                            onSubmit={updateUserData}
                            className="p-6 sm:p-8 space-y-6"
                            noValidate
                        >
                            <div>
                                <h2 className="text-xl font-bold">Personal details</h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Update your name and view your email address.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>
                                        {t("contact_us_firstname")}
                                    </label>
                                    <TextInput
                                        id="input_firstname"
                                        field="firstname"
                                        value={formState.firstname.value}
                                        onChange={hasFormValueChanged}
                                        required
                                        type="text"
                                        inputClass={inputClass}
                                        placeholder="Your first name"
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        {t("contact_us_lastname")}
                                    </label>
                                    <TextInput
                                        id="input_lastname"
                                        field="lastname"
                                        value={formState.lastname.value}
                                        onChange={hasFormValueChanged}
                                        required
                                        type="text"
                                        inputClass={inputClass}
                                        placeholder="Your last name"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>{t("contact_us_email")}</label>
                                <TextInput
                                    id="input_email"
                                    field="email"
                                    value={formState.email.value}
                                    onChange={hasFormValueChanged}
                                    required
                                    type="email"
                                    disabled
                                    inputClass={`${inputClass} opacity-80 cursor-not-allowed`}
                                    placeholder="Your email"
                                />
                                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                    Email changes are not supported from here.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmittingInfo}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition
                  border border-black dark:border-white
                  bg-black text-white hover:bg-black/90 active:bg-black
                  dark:bg-white dark:text-black dark:hover:bg-white/90
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSubmittingInfo && (
                                    <span className="h-4 w-4 border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent rounded-full animate-spin" />
                                )}
                                {isSubmittingInfo ? "Saving..." : "Save changes"}
                            </button>
                        </form>
                    </div>

                    {/* Password card */}
                    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/60 backdrop-blur-xl shadow-xl overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />
                        <form
                            onSubmit={updatepassword}
                            className="p-6 sm:p-8 space-y-6"
                            noValidate
                        >
                            <div>
                                <h2 className="text-xl font-bold">Change password</h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Use a strong password you don’t reuse elsewhere.
                                </p>
                            </div>
                            <div>
                                <label className={labelClass}>New password</label>
                                <TextInput
                                    id="input_password"
                                    field="password"
                                    value={formState.password.value}
                                    onChange={hasFormValueChanged}
                                    required
                                    type="password"
                                    inputClass={inputClass}
                                    placeholder="Your new password"
                                />
                                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                    At least 8 characters with uppercase, lowercase, numbers and symbols.
                                </p>
                            </div>
                            <div>
                                <label className={labelClass}>Confirm password</label>
                                <TextInput
                                    id="input_confirmpassword"
                                    field="confirmpassword"
                                    value={formState.confirmpassword.value}
                                    onChange={hasFormValueChanged}
                                    required
                                    type="password"
                                    inputClass={inputClass}
                                    placeholder="Confirm your password"
                                />
                            </div>
                            {error && (
                                <div className="rounded-lg border border-red-400/40 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 px-4 py-2 text-sm">
                                    {error}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmittingPass}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition
                  border border-black dark:border-white
                  bg-black text-white hover:bg-black/90 active:bg-black
                  dark:bg-white dark:text-black dark:hover:bg-white/90
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSubmittingPass && (
                                    <span className="h-4 w-4 border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent rounded-full animate-spin" />
                                )}
                                {isSubmittingPass ? "Updating..." : "Change password"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Popup */}
            {popup && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative z-10 flex min-h-full items-center justify-center p-4">
                        <div className="w-full max-w-lg rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black shadow-2xl overflow-hidden">
                            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />
                            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
                                <h3 className="text-lg font-semibold">EasyPrufung</h3>
                                <button
                                    type="button"
                                    onClick={() => setPopup(false)}
                                    className="h-8 w-8 inline-flex items-center justify-center rounded-full text-gray-600 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10"
                                    aria-label="Close"
                                >
                                    <svg
                                        className="h-4 w-4"
                                        viewBox="0 0 14 14"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div className="px-6 py-6">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {popupMessage}
                                </p>
                            </div>
                            <div className="px-6 py-4 border-t border-black/10 dark:border-white/10 text-right">
                                <button
                                    type="button"
                                    onClick={() => setPopup(false)}
                                    className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition
                    border border-black dark:border-white
                    bg-black text-white hover:bg-black/90 active:bg-black
                    dark:bg-white dark:text-black dark:hover:bg-white/90"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Settings;
