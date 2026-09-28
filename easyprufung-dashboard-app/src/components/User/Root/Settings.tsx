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
import { useNavigate } from "react-router-dom";

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

const CheckIcon = () => (
    <svg
        className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
    >
        <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
        />
    </svg>
);

const formatUSD = (amount: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
    }).format(amount);

const Settings = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const currentUser: IUser | undefined = useSelector(
        (state: IStateType) => state.userAccount.user
    );
    const account: IUserAccount = useSelector(
        (state: IStateType) => state.userAccount
    );

    // Plans: free, starter, autopilot
    const currentPlan = account.subscription?.plan?.toLowerCase?.() || "free";
    const isAutopilotSubscription = currentPlan === "autopilot";
    const isStarterSubscription = currentPlan === "starter";
    const isPaidSubscription = isAutopilotSubscription || isStarterSubscription;
    const planLabel = isAutopilotSubscription
        ? "Lifetime"
        : isStarterSubscription
            ? "Starter"
            : "Free";

    const availableCredits = account.subscription?.iteration;

    // Derive user identifier for Stripe prefill
    const email = encodeURIComponent(account?.user?.email || "");
    const refId = encodeURIComponent(account?.user?.uuid || "");
    const isDev = process.env.NODE_ENV === "development";

    // Credit Pack Stripe Payment Links
    const creditPackLinksBase = {
        50: isDev
            ? "https://buy.stripe.com/test_00wcN58bD36Q8yi2w08Ra02"
            : "https://buy.stripe.com/bJeeVdgI95eY7ue5Ic8Ra09",
        100: isDev
            ? "https://buy.stripe.com/test_dRm7sL4Zr4aU5m63A48Ra03"
            : "https://buy.stripe.com/4gM5kD63vazidSC3A48Ra0a",
        200: isDev
            ? "https://buy.stripe.com/test_4gMfZh9fH4aU8yib2w8Ra04"
            : "https://buy.stripe.com/4gM6oH1Nf22M29U2w08Ra0b",
    } as const;

    // Pack data
    const creditPacks = [
        {
            name: "Quick Boost",
            title: "Practice Credits",
            credits: 50,
            priceUSD: 9,
            href: `${creditPackLinksBase[50]}?prefilled_email=${email}&client_reference_id=${refId}`,
            description: "Useful for extra AI-generated exercises and written feedback.",
        },
        {
            name: "Practice Plus",
            title: "Practice Credits",
            credits: 100,
            priceUSD: 16,
            href: `${creditPackLinksBase[100]}?prefilled_email=${email}&client_reference_id=${refId}`,
            description: "A larger top-up for regular mock-exam preparation.",
        },
        {
            name: "Intensive",
            title: "Practice Credits",
            credits: 200,
            priceUSD: 30,
            href: `${creditPackLinksBase[200]}?prefilled_email=${email}&client_reference_id=${refId}`,
            description: "Best for intensive preparation and frequent AI feedback.",
        },
    ];

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

    // Ref for the credits section
    const creditsRef = useRef<HTMLDivElement>(null);

    // Effect for hash scrolling
    useEffect(() => {
        if (window.location.hash === "#credits") {
            setTimeout(() => {
                // Use timeout in case the component is not yet rendered
                const el = creditsRef.current;
                if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                }
            }, 100);
        }
    }, []);

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
            className="relative min-h-screen text-black  dark:text-white px-6 py-10"
        >
            <div className="relative z-10 mx-auto max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Settings
                    </h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Manage your profile, subscription, password, and EasyPrufung practice credits.
                    </p>
                </div>

                {/* Subscription status */}
                <div className="mb-8 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/60 backdrop-blur-xl shadow-xl overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />
                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold">Subscription</h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Your current plan and remaining AI practice credits.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-md font-semibold ring-1 ring-inset ${
                        isPaidSubscription
                            ? "bg-green-100 text-green-700 ring-green-200 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-900/40"
                            : "bg-neutral-100 text-neutral-700 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-800"
                    }`}
                >
                  {planLabel}
                </span>
                                {isPaidSubscription && (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-md font-semibold text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800">
                    {availableCredits} practice credits
                  </span>
                                )}
                            </div>
                        </div>
                        {!isPaidSubscription && (
                            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Unlock more exam practice with a flexible monthly plan or one-time lifetime access.
                                </p>
                                <button
                                    onClick={async () => {
                                        navigate("/pricing");
                                    }}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition
                border border-black dark:border-white
                bg-black text-white hover:bg-black/90 active:bg-black
                dark:bg:white dark:text-black dark:hover:bg-white/90"
                                >
                                    Upgrade
                                    <ArrowRight />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Settings details card */}
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
                                    At least 8 characters with uppercase, lowercase, numbers and
                                    symbols.
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

            {/* Practice credit packs section (visible for paid plans) */}
            {isPaidSubscription && (
                <div id="credits" ref={creditsRef} className="relative z-10 mx-auto mt-10 max-w-6xl">
                    <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            Practice credit packs
                        </h2>
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                            Top up your practice credits anytime. One-time purchase, instantly added to your account.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {creditPacks.map((pack) => (
                            <div
                                key={pack.credits}
                                className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/60 backdrop-blur-xl shadow-xl overflow-hidden flex flex-col"
                            >
                                <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />
                                <div className="p-6 sm:p-8 flex flex-col h-full">
                                    <div className="mb-1 flex items-center justify-between">
                                        <h4 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                                            {pack.title}
                                            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 ring-1 ring-inset ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-800">
                        {pack.name}
                      </span>
                                        </h4>
                                        <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800">
                      {formatUSD(pack.priceUSD)}
                    </span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        {pack.description}
                                    </p>
                                    <div className="my-6 flex items-baseline justify-center gap-3">
                                        <div className="flex items-baseline">
                      <span className="mr-2 text-5xl font-extrabold tracking-tight text-black dark:text-white">
                        {pack.credits}
                      </span>
                                            <span className="text-neutral-600 dark:text-neutral-400">
                        Practice credits
                      </span>
                                        </div>
                                    </div>
                                    <ul className="mb-8 space-y-3 text-left text-sm text-gray-700 dark:text-gray-300">
                                        <li className="flex items-start gap-3">
                                            <CheckIcon />
                                            <span>Instantly added to your account</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckIcon />
                                            <span>One-time purchase, no subscription</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckIcon />
                                            <span>Use for AI-generated exercises, evaluation, feedback, and explanations</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckIcon />
                                            <span>Secure Stripe checkout</span>
                                        </li>
                                    </ul>
                                    <div className="mt-auto pt-2">
                                        <a
                                            href={pack.href}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition
                      border border-black dark:border-white
                      bg-black text-white hover:bg-black/90 active:bg-black
                      dark:bg-white dark:text-black dark:hover:bg-white/90"
                                        >
                                            Buy {pack.credits} practice credits
                                            <ArrowRight />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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