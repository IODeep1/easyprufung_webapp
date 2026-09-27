import React, { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { OnChangeModel } from "../../../common/types/Form.types";
import { requestForgotPassword } from "../../../api/user/api-helper";
import TextInput from "../../../common/components/TextInput";
import Loading from "../../Shared/Loading";
import { Link } from "react-router-dom";
import Logo from "../../../images/logo.png";

const ForgotPassword = () => {
// state
    const [popup, setPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { t } = useTranslation();
    const [formState, setFormState] = useState({
        email: { error: "", value: "" },
    });

    function hasFormValueChanged(model: OnChangeModel): void {
        setFormState((prev) => ({ ...prev, [model.field]: { error: model.error, value: model.value } }));
    }

// actions
    async function forgotPassword(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setLoadingMessage("Sending reset link...");
        setLoading(true);
        setIsSubmitting(true);
        try {
            const result = await requestForgotPassword(formState.email.value);
            setPopupMessage(result || "If that email exists, we've sent a reset link.");
            setPopup(true);
        } catch (err) {
            setPopupMessage("Something went wrong. Please try again.");
            setPopup(true);
        } finally {
            setLoading(false);
            setLoadingMessage("");
            setIsSubmitting(false);
        }
    }

    const inputClass =
        "w-full bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10 " +
        "text-black dark:text-white text-sm rounded-xl px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 " +
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

    const labelClass = "block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300";

    return (
        <section
            id="forgot_password"
            className="relative min-h-screen bg-white text-black dark:bg-black dark:text-white"
        >
            {/* Background accents */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_1px)]" />
            </div>

            <div className="relative z-10">
                {/* Top brand */}
                <div className="px-6 pt-7">
                    <Link to="/" className="inline-flex items-center text-2xl font-semibold">
                        <img alt="logo" width="44" height="44" src={Logo} className="mr-2 rounded-md" />
                        <span>EasyPrüfung</span>
                    </Link>
                </div>

                {/* Center card */}
                <div className="px-6 py-10 mx-auto max-w-3xl">
                    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/60 backdrop-blur-xl shadow-xl overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />
                        <div className="p-6 sm:p-10">
                            <h1 className="text-3xl font-extrabold leading-tight">Reset password</h1>
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                Enter the email associated with your account, and we’ll send you a link to reset your password.
                            </p>

                            <form onSubmit={forgotPassword} className="mt-8 space-y-6" noValidate>
                                <div>
                                    <label htmlFor="email" className={labelClass}>
                                        {t("contact_us_email")}
                                    </label>
                                    <TextInput
                                        id="input_email"
                                        field="email"
                                        value={formState.email.value}
                                        onChange={hasFormValueChanged}
                                        required
                                        type="email"
                                        inputClass={inputClass}
                                        placeholder="Your email"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !formState.email.value}
                                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition
                border border-black dark:border-white
                bg-black text-white hover:bg-black/90 active:bg-black
                dark:bg.white dark:text-black dark:hover:bg-white/90
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:opacity-60 disabled:cursor-not-allowed`.replace(
                                        "dark.bg.white",
                                        "dark:bg-white"
                                    )}
                                >
                                    {isSubmitting && (
                                        <span className="h-4 w-4 border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent rounded-full animate-spin" />
                                    )}
                                    {isSubmitting ? "Sending..." : "Send reset link"}
                                </button>

                                <div className="text-center text-xs text-gray-600 dark:text-gray-400">
                                    Remembered your password?{" "}
                                    <Link
                                        to="/login"
                                        className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        Back to log in
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {popup && (
                    <div className="fixed inset-0 z-50">
                        <div className="absolute inset-0 bg-black/50" />
                        <div className="relative z-10 flex min-h-full items-center justify-center p-4">
                            <div className="w-full max-w-lg rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black shadow-2xl overflow-hidden">
                                <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />
                                <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
                                    <h3 className="text-lg font-semibold">EasyPrüfung</h3>
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
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="px-6 py-6">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{popupMessage}</p>
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

                {loading && <Loading text={loadingMessage} />}
            </div>
        </section>
    );
};

export default ForgotPassword;