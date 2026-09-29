import React, { Dispatch, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestActivatePromoCode, requestGetUser } from "../../../api/user/api-helper";
import { OnChangeModel } from "../../../common/types/Form.types";
import TextInput from "../../../common/components/TextInput";
import { updateUser } from "../../../store/actions/user/userAccount.actions";
import { useDispatch } from "react-redux";
import ReCAPTCHA from "react-google-recaptcha";

const CodeRedemption = () => {
    const navigate = useNavigate();
    const dispatch: Dispatch<any> = useDispatch();

    const [formState, setFormState] = useState({
        code: { value: "" },
    });

    const [captchaVal, setCaptchaVal] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [popup, setPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

    function hasFormValueChanged(model: OnChangeModel): void {
        setFormState({ ...formState, [model.field]: { value: model.value } });
    }

    function onCaptchaChange(value: string | null) {
        setCaptchaVal(value);
    }

    async function activateCode(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            const status = await requestActivatePromoCode(formState.code.value);

            if (status === "ACTIVATED") {
                const user = await requestGetUser(dispatch);
                if (user !== null && user !== undefined) {
                    dispatch(updateUser(user));
                }
                setIsSuccess(true);
                setPopupMessage("Your code has been activated successfully.");
            } else {
                setIsSuccess(false);
                setPopupMessage("The code you entered is invalid. Please check it and try again.");
            }

            setPopup(true);
        } catch (err) {
            setIsSuccess(false);
            setPopupMessage("Something went wrong. Please try again later.");
            setPopup(true);
        } finally {
            setIsSubmitting(false);
        }
    }

    const inputBase =
        "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 shadow-sm transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500";
    const labelBase =
        "mb-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300";

    return (
        <section id="code_redemption" className="relative py-16 sm:py-24">
            <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
                <div className="text-center">
                    <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-white">
                        Redeem Your Code
                    </h2>
                    <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-blue-500/80" />
                    <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 dark:text-neutral-400">
                        Enter your code to unlock EasyPrüfung exam-practice access or practice credits. Use them for realistic mock exams, AI evaluation, feedback, and explanations.
                    </p>
                </div>

                <div className="mt-10 rounded-2xl border border-neutral-200/70 bg-white/90 p-6 shadow-lg backdrop-blur-sm sm:p-8 dark:border-neutral-800 dark:bg-neutral-950/90">
                    <form className="space-y-6" onSubmit={activateCode}>
                        <div>
                            <label htmlFor="code" className={labelBase}>
                                Code
                            </label>
                            <TextInput
                                id="input_code"
                                field="code"
                                value={formState.code.value}
                                onChange={hasFormValueChanged}
                                required={true}
                                type="text"
                                inputClass={inputBase}
                                placeholder="Your code"
                            />
                        </div>

                        <div className="flex justify-end">
                            <ReCAPTCHA
                                sitekey="6LdnpOwqAAAAAPGquo4cAMMo75SpoSzwpcziExhX"
                                onChange={onCaptchaChange}
                            />
                        </div>

                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={!captchaVal || isSubmitting}
                                className="group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:ring-white/10"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg
                                            className="h-5 w-5 animate-spin text-white dark:text-black"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
                                            />
                                        </svg>
                                        Redeeming...
                                    </>
                                ) : (
                                    <>
                                        Redeem Now
                                        <svg
                                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {popup && (
                <div className="relative z-50">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setPopup(false)}
                    />
                    <div className="fixed inset-0 z-50 grid place-items-center p-4">
                        <div
                            className="w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-950"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative p-8">
                                <div
                                    className={`mx-auto -mt-1 mb-4 flex h-12 w-12 items-center justify-center rounded-full shadow-lg ${
                                        isSuccess ? "bg-blue-500 text-white" : "bg-red-500 text-white"
                                    }`}
                                >
                                    {isSuccess ? (
                                        <svg
                                            className="h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                                <h3 className="text-center text-lg font-semibold text-neutral-900 dark:text-white">
                                    {isSuccess ? "Success!" : "Oops!"}
                                </h3>
                                <p className="mt-2 text-center text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                    {popupMessage}
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-3 border-t border-neutral-200 p-4 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isSuccess) navigate("/new");
                                        else setPopup(false);
                                    }}
                                    className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-black/10 transition hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/30 dark:bg-white dark:text-black dark:ring-white/10"
                                >
                                    {isSuccess ? "Continue" : "Close"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default CodeRedemption;