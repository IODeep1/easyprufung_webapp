import React, { Dispatch, FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { OnChangeModel } from "../../../common/types/Form.types";
import { requestCreateUser } from "../../../api/user/api-helper";
import TextInput from "../../../common/components/TextInput";
import { IUser } from "../../../store/models/user/user.interface";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../../images/logo.png";
import ReCAPTCHA from "react-google-recaptcha";
import GoogleLoginButton from "../Login/GoogleLoginButton";
import { IUserAccount } from "../../../store/models/user/userAccount.interface";
import { IStateType } from "../../../store/models/root.interface";
import { login } from "../../../store/actions/user/userAccount.actions";
import Loading from "../../Shared/Loading";

const Registration = () => {
// init
    let user: IUser;
    const account: IUserAccount = useSelector((state: IStateType) => state.userAccount);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const dispatch: Dispatch<any> = useDispatch();

    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const [formState, setFormState] = useState({
        firstname: { error: "", value: "" },
        lastname: { error: "", value: "" },
        email: { error: "", value: "" },
        password: { error: "", value: "" },
    });

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [captchaVal, setCaptchaVal] = useState<string | null>(null);

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

    function onCaptchaChange(value: string | null) {
        setCaptchaVal(value);
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
    async function registeruser(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();

        const validation = validatePassword(formState.password.value);
        if (validation !== "") {
            setError(validation);
            return;
        }

        const newUser = {
            ...user,
            firstname: formState.firstname.value,
            lastname: formState.lastname.value,
            email: formState.email.value,
            password: formState.password.value,
            source: "default",
        };

        setLoadingMessage("Creating your account...");
        setLoading(true);
        setIsSubmitting(true);

        try {
            const createdUser = await requestCreateUser(newUser);
            if (!createdUser) {
                setError("Unfortunately, we can’t create your account at this moment. Please try again later.");
                return;
            }
            dispatch(login(createdUser));
            navigate("/");
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
            setLoadingMessage("");
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        if (account && account.user?.email) {
            navigate("/");
        }
    }, [account, navigate]);

    const inputClass =
        "w-full bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10 " +
        "text-black dark:text-white text-sm rounded-xl px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 " +
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

    const labelClass = "block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300";

    return (
        <section
            id="register"
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
                    <Link
                        to="/"
                        className="inline-flex items-center text-2xl font-semibold text-gray-900 dark:text-white"
                    >
                        <img alt="logo" width="44" height="44" src={Logo} className="mr-2 rounded-md" />
                        <span>EasyPrüfung</span>
                    </Link>
                </div>

                <div className="px-6 py-10 mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                    {/* Left: Content */}
                    <div className="order-2 md:order-1">
                        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
                            Create your account
                        </h1>
                        <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                            Join EasyPrüfung to prepare for German TELC and Goethe exams with realistic mock exams and AI-powered feedback.
                        </p>

                        <div className="mt-8 space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur px-3 py-1 text-xs text-gray-700 dark:text-gray-300">
                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                                TELC Deutsch B1 available now
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur px-3 py-1 text-xs text-gray-700 dark:text-gray-300 ml-2">
                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                                AI scoring & personalized feedback
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur px-3 py-1 text-xs text-gray-700 dark:text-gray-300 ml-2">
                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                                A1–C2 exam roadmap
                            </div>
                        </div>

                        <div className="mt-10">
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                Already have an account?
                                <Link
                                    to="/login"
                                    className="ml-1 font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline-offset-4 hover:underline"
                                >
                                    Log in
                                </Link>
                                .
                            </div>
                        </div>
                    </div>

                    {/* Right: Card Form */}
                    <div className="order-1 md:order-2">
                        <div className="w-full max-w-lg md:ml-auto rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/60 backdrop-blur-xl shadow-xl overflow-hidden">
                            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />
                            <div className="p-6 sm:p-8">
                                <h2 className="text-2xl font-bold">Sign up</h2>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Use Google or your email to get started.
                                </p>

                                {/* Social auth */}
                                <div className="mt-6 flex justify-center">
                                    <GoogleLoginButton />
                                </div>

                                {/* Divider */}
                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-black/10 dark:border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center">
                <span className="bg-white dark:bg-black px-3 text-xs text-gray-600 dark:text-gray-400">
                  Or sign up with email
                </span>
                                    </div>
                                </div>

                                <form onSubmit={registeruser} className="space-y-6" noValidate>
                                    {/* Name fields */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>{t("contact_us_firstname")}</label>
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
                                            <label className={labelClass}>{t("contact_us_lastname")}</label>
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

                                    {/* Email */}
                                    <div>
                                        <label className={labelClass}>{t("contact_us_email")}</label>
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

                                    {/* Password */}
                                    <div>
                                        <label className={labelClass}>Password</label>
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
                                            Use at least 8 characters with a mix of uppercase, lowercase, numbers and symbols.
                                        </p>
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div className="rounded-lg border border-red-400/40 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 px-4 py-2 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    {/* reCAPTCHA */}
                                    <div className="flex justify-end">
                                        <ReCAPTCHA
                                            sitekey="6LcEq9UtAAAAAIMS8OZ8SLinOvMm1ePEO-k9GAAQ"
                                            onChange={onCaptchaChange}
                                        />
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={!captchaVal || isSubmitting}
                                        className={`w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition
                  border border-black dark:border-white
                  bg-black text-white hover:bg-black/90 active:bg-black
                  dark:bg-white dark:text-black dark:hover:bg-white/90
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  disabled:opacity-60 disabled:cursor-not-allowed`}
                                    >
                                        {isSubmitting && (
                                            <span className="h-4 w-4 border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent rounded-full animate-spin" />
                                        )}
                                        {isSubmitting ? "Creating account..." : "Sign up"}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <p className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
                            By signing up, you agree to our{" "}
                            <Link
                                to="/terms"
                                className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Terms
                            </Link>{" "}
                            and{" "}
                            <Link
                                to="/privacy"
                                className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative z-10 px-6 pb-6 text-center text-xs text-gray-500 dark:text-gray-400">
                EasyPrüfung is an independent preparation platform and is not affiliated with or endorsed by telc gGmbH or the Goethe-Institut.
            </div>
            {loading && <Loading text={loadingMessage} />}
        </section>
    );
};

export default Registration;