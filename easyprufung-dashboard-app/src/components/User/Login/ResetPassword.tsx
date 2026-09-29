import React, { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { OnChangeModel } from "../../../common/types/Form.types";
import { requestResetPassword } from "../../../api/user/api-helper";
import TextInput from "../../../common/components/TextInput";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Loading from "../../Shared/Loading";
import Logo from "../../../images/logo.png";

const ResetPassword = () => {
// routing
    const location = useLocation();
    const navigate = useNavigate();

// ui state
    const [popup, setPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

// form state
    const [error, setError] = useState("");
    const [token, setToken] = useState("");
    const { t } = useTranslation();
    const [formState, setFormState] = useState({
        password: { error: "", value: "" },
        confirmpassword: { error: "", value: "" },
    });

    function hasFormValueChanged(model: OnChangeModel): void {
        setError("");
        setFormState((prev) => ({ ...prev, [model.field]: { error: model.error, value: model.value } }));

        if (model.field === "password") {
            const validation = validatePassword(model.value);
            if (validation !== "") {
                setError(validation);
            }
        }
    }

    const validatePassword = (password: string) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) return "Password must be at least 8 characters long.";
        if (!hasUpperCase) return "Password must contain at least one uppercase letter.";
        if (!hasLowerCase) return "Password must contain at least one lowercase letter.";
        if (!hasNumbers) return "Password must contain at least one number.";
        if (!hasSpecialChars) return "Password must contain at least one special character.";
        return "";
    };

// actions
    async function resetPassword(e: FormEvent<HTMLFormElement>): Promise<void> {
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

        if (!token) {
            setError("No token found in the URL.");
            return;
        }

        setLoadingMessage("Updating your password...");
        setLoading(true);
        setIsSubmitting(true);
        try {
            const result = await requestResetPassword(token, formState.password.value);
            setPopupMessage(result || "Password reset processed.");
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

// read token from url
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tokenFromUrl = queryParams.get("token");
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setError("No token found in the URL.");
        }
    }, [location]);

    const inputClass =
        "w-full bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10 " +
        "text-black dark:text-white text-sm rounded-xl px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 " +
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

    const labelClass = "block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300";

    return (
        <section id="reset_password" className="relative min-h-screen bg-white text-black dark:bg-black dark:text-white">
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
                                Choose a strong password and keep it safe. You’ll use it to access your account.
                            </p>

                            <form onSubmit={resetPassword} className="mt-8 space-y-6" noValidate>
                                <div>
                                    <label htmlFor="password" className={labelClass}>
                                        New password
                                    </label>
                                    <TextInput
                                        id="input_password"
                                        field="password"
                                        value={formState.password.value}
                                        onChange={hasFormValueChanged}
                                        required
                                        type="password"
                                        inputClass={inputClass}
                                        placeholder="Your password"
                                    />
                                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                        Use at least 8 characters with uppercase, lowercase, numbers and symbols.
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="confirmpassword" className={labelClass}>
                                        Confirm new password
                                    </label>
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
                                    disabled={isSubmitting || !token}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition
                         border border-black dark:border-white
                         bg-black text-white hover:bg-black/90 active:bg-black
                         dark:bg-white dark:text-black dark:hover:bg-white/90
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting && (
                                        <span className="h-4 w-4 border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent rounded-full animate-spin" />
                                    )}
                                    {isSubmitting ? "Changing password..." : "Change password"}
                                </button>
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
                                        <svg className="h-4 w-4" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{popupMessage}</p>
                                </div>
                                <div
                                    className="px-6 py-4 border-t border-black/10 dark:border-white/10 text-right"
                                    onClick={() => {
                                        if (popupMessage === "Your password successfully updated.") {
                                            navigate("/login");
                                        } else {
                                            setPopup(false);
                                        }
                                    }}
                                >
                                    <button
                                        type="button"
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

export default ResetPassword;