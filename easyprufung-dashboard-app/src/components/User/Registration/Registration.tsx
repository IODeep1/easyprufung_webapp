import { tr as translateFeature, useFeatureLocale } from "../../../localization/feature-i18n";
import { authDestination } from "../Exam/guest/guest-api";
import React, { Dispatch, FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { OnChangeModel } from "../../../common/types/Form.types";
import { requestCreateUser } from "../../../api/user/api-helper";
import TextInput from "../../../common/components/TextInput";
import { IUser } from "../../../store/models/user/user.interface";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../../../images/logo.png";
import ReCAPTCHA from "react-google-recaptcha";
import GoogleLoginButton from "../Login/GoogleLoginButton";
import { IUserAccount } from "../../../store/models/user/userAccount.interface";
import { IStateType } from "../../../store/models/root.interface";
import { login } from "../../../store/actions/user/userAccount.actions";
import Loading from "../../Shared/Loading";

const Registration = ({ teacherMode = false, partnerMode = false }: { teacherMode?: boolean; partnerMode?: boolean }) => {
  const feature = useFeatureLocale();
  const locale = partnerMode ? "en" : feature.locale;
  const dir = partnerMode ? "ltr" : feature.dir;
  const tr = partnerMode ? (text: string) => text : translateFeature;

  // init
  let user: IUser;
  const account: IUserAccount = useSelector(
    (state: IStateType) => state.userAccount
  );
  const navigate = useNavigate();
  const location = useLocation();
  const guestError = Boolean(
    (location.state as { guestError?: boolean } | null)?.guestError
  );
  const { t, i18n } = useTranslation();
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
    setFormState((prev) => ({
      ...prev,
      [model.field]: { error: model.error, value: model.value },
    }));

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

    if (password.length < minLength)
      return tr("Password must be at least 8 characters long.");
    if (!hasUpperCase)
      return tr("Password must contain at least one uppercase letter.");
    if (!hasLowerCase)
      return tr("Password must contain at least one lowercase letter.");
    if (!hasNumbers) return tr("Password must contain at least one number.");
    if (!hasSpecialChars)
      return tr("Password must contain at least one special character.");
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
      preferredLanguage: (partnerMode ? "en" : i18n.resolvedLanguage ||
        i18n.language) as IUser["preferredLanguage"],
    };

    setLoadingMessage("Creating your account...");
    setLoading(true);
    setIsSubmitting(true);

    try {
      const createdUser = await requestCreateUser(newUser);
      if (!createdUser) {
        setError(
          "Unfortunately, we can’t create your account at this moment. Please try again later."
        );
        return;
      }
      dispatch(login(createdUser));
      navigate(authDestination());
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (account && account.user?.email && !guestError) {
      navigate(authDestination());
    }
  }, [account, navigate, guestError]);

  const inputClass =
    "w-full bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10 " +
    "text-black dark:text-white text-sm rounded-xl px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

  const labelClass =
    "block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300";

  return (
    <section
      id="register"
      data-no-translate={teacherMode || partnerMode ? "true" : undefined}
      lang={locale}
      dir={dir}
      className="relative min-h-screen bg-white text-black dark:bg-black dark:text-white"
    >
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
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
            <img
              alt={tr("logo")}
              width="44"
              height="44"
              src={Logo}
              className="mr-2 rounded-md"
            />
            <span>{tr("SmartPrüfung")}</span>
          </Link>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-10 px-6 py-10 md:grid-cols-2">
          {/* Left: Content */}
          <div className="order-2 md:order-1">
            <h1 className="text-4xl font-extrabold leading-tight lg:text-5xl">
              {partnerMode ? "Create your partner account" : teacherMode
                ? tr("Create your teacher account")
                : tr("Create your account")}
            </h1>
            <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
              {partnerMode ? "Register for free, submit your partner application and get your own discount code after approval." : teacherMode
                ? tr(
                    "Register to create classes, invite students and assign TELC Deutsch B1 mock exams. Teacher Mode is free."
                  )
                : tr(
                    "Join SmartPrüfung to prepare for German TELC and Goethe exams with realistic mock exams and AI-powered feedback."
                  )}
            </p>

            <div className="mt-8 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs text-gray-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                {partnerMode ? "Free partner registration" : teacherMode
                  ? tr("Free class management")
                  : tr("TELC Deutsch B1 available now")}
              </div>
              <div className="ms-2 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs text-gray-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                {partnerMode ? "Discounts for your learners" : teacherMode
                  ? tr("Private invitations and assignments")
                  : tr("AI scoring & personalized feedback")}
              </div>
              <div className="ms-2 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs text-gray-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                {partnerMode ? "Track commissions and manual payouts" : teacherMode
                  ? tr("Student-controlled progress sharing")
                  : tr("A1–C2 exam roadmap")}
              </div>
            </div>

            <div className="mt-10">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {tr("Already have an account?")}
                <Link
                  to="/login"
                  className="ml-1 font-semibold text-blue-600 underline-offset-4 hover:text-blue-500 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {tr("Log in")}
                </Link>
                .
              </div>
            </div>
          </div>

          {/* Right: Card Form */}
          <div className="order-1 md:order-2">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/60 md:ml-auto">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold">{tr("Sign up")}</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {tr("Use Google or your email to get started.")}
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
                    <span className="bg-white px-3 text-xs text-gray-600 dark:bg-black dark:text-gray-400">
                      {tr("Or sign up with email")}
                    </span>
                  </div>
                </div>

                <form onSubmit={registeruser} className="space-y-6" noValidate>
                  {/* Name fields */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        {teacherMode || partnerMode
                          ? tr("First name")
                          : t("contact_us_firstname")}
                      </label>
                      <TextInput
                        id="input_firstname"
                        field="firstname"
                        value={formState.firstname.value}
                        onChange={hasFormValueChanged}
                        required
                        type="text"
                        inputClass={inputClass}
                        placeholder={tr("Your first name")}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        {teacherMode || partnerMode
                          ? tr("Last name")
                          : t("contact_us_lastname")}
                      </label>
                      <TextInput
                        id="input_lastname"
                        field="lastname"
                        value={formState.lastname.value}
                        onChange={hasFormValueChanged}
                        required
                        type="text"
                        inputClass={inputClass}
                        placeholder={tr("Your last name")}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className={labelClass}>
                      {teacherMode || partnerMode ? tr("Email") : t("contact_us_email")}
                    </label>
                    <TextInput
                      id="input_email"
                      field="email"
                      value={formState.email.value}
                      onChange={hasFormValueChanged}
                      required
                      type="email"
                      inputClass={inputClass}
                      placeholder={tr("Your email")}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className={labelClass}>{tr("Password")}</label>
                    <TextInput
                      id="input_password"
                      field="password"
                      value={formState.password.value}
                      onChange={hasFormValueChanged}
                      required
                      type="password"
                      inputClass={inputClass}
                      placeholder={tr("Your password")}
                    />
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      {tr(
                        "Use at least 8 characters with a mix of uppercase, lowercase, numbers and symbols."
                      )}
                    </p>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="rounded-lg border border-red-400/40 bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
                      {tr(error)}
                    </div>
                  )}

                  {/* reCAPTCHA */}
                  <div className="flex justify-end">
                    <ReCAPTCHA
                      sitekey="6LfcwvwtAAAAAANH8aw5JEhmFfOdBJdSxHqkgCN4"
                      onChange={onCaptchaChange}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!captchaVal || isSubmitting}
                    className={`mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black bg-black px-4 py-3
                  text-sm font-semibold text-white
                  transition hover:bg-black/90 focus:outline-none focus:ring-2
                  focus:ring-blue-500 active:bg-black disabled:cursor-not-allowed
                  disabled:opacity-60 dark:border-white dark:bg-white
                  dark:text-black dark:hover:bg-white/90`}
                  >
                    {isSubmitting && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent" />
                    )}
                    {isSubmitting ? tr("Creating account...") : tr("Sign up")}
                  </button>
                </form>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
              {tr("By signing up, you agree to our")}{" "}
              <Link
                to="/terms"
                className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {tr("Terms")}
              </Link>{" "}
              {tr("and")}{" "}
              <Link
                to="/privacy"
                className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {tr("Privacy Policy")}
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-6 pb-6 text-center text-xs text-gray-500 dark:text-gray-400">
        {tr(
          "SmartPrüfung is an independent preparation platform and is not affiliated with or endorsed by telc gGmbH or the Goethe-Institut."
        )}
      </div>
      {loading && <Loading text={tr(loadingMessage)} />}
    </section>
  );
};

export default Registration;
