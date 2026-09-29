import React, { useState, FormEvent, Dispatch, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { OnChangeModel } from "../../../common/types/Form.types";
import { authenticateUser } from "../../../api/user/api-helper";
import { useDispatch } from "react-redux";
import { login } from "../../../store/actions/user/userAccount.actions";
import TextInput from "../../../common/components/TextInput";
import GoogleLoginButton from "./GoogleLoginButton";
import { useLocation } from "react-router-dom";
import Logo from "../../../images/logo.png";
import JoinMakers from "./JoinMakers";

const Login = () => {
// init
    const dispatch: Dispatch<any> = useDispatch();
    const location = useLocation();
    const { t } = useTranslation();

    const [formState, setFormState] = useState({
        email: { error: "", value: "" },
        password: { error: "", value: "" },
    });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function hasFormValueChanged(model: OnChangeModel): void {
        setError("");
        setFormState((prev) => ({
            ...prev,
            [model.field]: { error: model.error, value: model.value },
        }));
    }

    useEffect(() => {
        window.scrollTo(0, 0);
        const queryParams = new URLSearchParams(location.search);
        const email = queryParams.get("email");
        if (email) {
            setFormState((prev) => ({
                ...prev,
                email: { error: "", value: email },
            }));
        }
    }, [location]);

// actions
    async function loginuser(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        try {
            const user = await authenticateUser(
                formState.email.value,
                formState.password.value
            );
            if (user) {
                dispatch(login(user));
            } else {
                setError("Your email or password is incorrect.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section
            id="Login"
            className="relative min-h-screen flex items-center justify-center bg-white text-black dark:bg-black dark:text-white px-6 py-10"
        >
            {/* Background accents */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-28 -right-28 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_1px)]" />
            </div>

            <div className="relative z-10 w-full max-w-6xl">
                {/* Logo & Brand */}
                <div className="flex items-center justify-center gap-3 pb-12">
                    <img
                        alt="EasyPrüfung logo"
                        width="64"
                        height="64"
                        src={Logo}
                        className="h-12 w-12 rounded-md"
                    />
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
        EasyPrüfung
      </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    {/* Left: Welcome / Marketing */}
                    <div className="order-2 md:order-1">
                        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
                            Welcome back
                        </h1>

                        <p className="mt-5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                            Continue your German exam preparation with realistic timed mock exams, AI scoring, and personalized feedback.
                        </p>

                        {/* Highlights */}
                        <div className="mt-8 space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur px-3 py-1 text-xs text-gray-700 dark:text-gray-300">
                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                                Realistic TELC exam practice
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur px-3 py-1 text-xs text-gray-700 dark:text-gray-300 ml-2">
                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                                AI scoring & written feedback
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur px-3 py-1 text-xs text-gray-700 dark:text-gray-300 ml-2">
                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                                Review mistakes and past results
                            </div>
                        </div>

                        <p className="mt-6 text-sm text-gray-700 dark:text-gray-300">
                            Don’t have an account?
                            <a
                                href="/register"
                                className="ml-1 font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline-offset-4 hover:underline"
                            >
                                Register here
                            </a>
                            .
                        </p>

                        <div className="mt-10">
                            <JoinMakers />
                        </div>
                    </div>

                    {/* Right: Auth Card */}
                    <div className="order-1 md:order-2">
                        <div className="w-full max-w-lg md:ml-auto rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/60 backdrop-blur-xl shadow-xl overflow-hidden">
                            {/* Card top accent */}
                            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />

                            <form className="p-6 sm:p-8" onSubmit={loginuser} noValidate>
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold">Sign in</h2>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        Use your email and password to access your account.
                                    </p>
                                </div>

                                <div className="space-y-5">
                                    {/* Email */}
                                    <TextInput
                                        id="input_email"
                                        field="email"
                                        value={formState.email.value}
                                        onChange={hasFormValueChanged}
                                        required
                                        type="email"
                                        inputClass="w-full bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white text-sm rounded-xl px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        placeholder="Email"
                                    />

                                    {/* Password */}
                                    <TextInput
                                        id="input_password"
                                        field="password"
                                        value={formState.password.value}
                                        onChange={hasFormValueChanged}
                                        required
                                        type="password"
                                        inputClass="w-full bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white text-sm rounded-xl px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        placeholder="Password"
                                    />

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 select-none">

                                        </div>
                                        <a
                                            href="/forgot_password"
                                            className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            Forgot password?
                                        </a>
                                    </div>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="mt-4 rounded-lg border border-red-400/40 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 px-4 py-2 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition
                border border-black dark:border-white
                bg-black text-white hover:bg-black/90 active:bg-black
                dark:bg-white dark:text-black dark:hover:bg-white/90
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:opacity-60 disabled:cursor-not-allowed`}
                                >
                                    {isSubmitting && (
                                        <span className="h-4 w-4 border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent rounded-full animate-spin" />
                                    )}
                                    {isSubmitting ? "Logging in..." : "Log in"}
                                </button>

                                {/* Divider */}
                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-black/10 dark:border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center">
                <span className="bg-white dark:bg-black px-3 text-xs text-gray-600 dark:text-gray-400">
                  Or continue with
                </span>
                                    </div>
                                </div>

                                {/* Google */}
                                <div className="flex justify-center">
                                    <GoogleLoginButton />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Footer small note */}
                <div className="mt-10 text-center text-xs text-gray-600 dark:text-gray-400">
                    Practice in a familiar environment. Build confidence. Be ready for the real exam. Need help?{" "}
                    <a
                        href="http://easyprufung.com/contact"
                        className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Contact support
                    </a>
                    .
                    <div className="mt-2">EasyPrüfung is an independent preparation platform and is not affiliated with or endorsed by telc gGmbH or the Goethe-Institut.</div>
                </div>
            </div>
        </section>
    );
};

export default Login;