import React, { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { OnChangeModel } from "../../../common/types/Form.types";
import { requestCreateContactForm } from "../../../api/contact/contact-api-helper";
import TextInput from "../../../common/components/TextInput";
import TextAreaInput from "../../../common/components/TextAreaInput";

const Contact = () => {
    const { t } = useTranslation();
    const [popup, setPopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formState, setFormState] = useState({
        firstName: { error: "", value: "" },
        lastName: { error: "", value: "" },
        email: { error: "", value: "" },
        subject: { error: "", value: "" },
        message: { error: "", value: "" },
    });

    function hasFormValueChanged(model: OnChangeModel): void {
        setFormState({
            ...formState,
            [model.field]: { error: model.error, value: model.value },
        });
    }

    function resetForm() {
        setFormState({
            firstName: { error: "", value: "" },
            lastName: { error: "", value: "" },
            email: { error: "", value: "" },
            subject: { error: "", value: "" },
            message: { error: "", value: "" },
        });
    }

// actions
    async function sendContactForm(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();

        const newContactForm = {
            firstname: formState.firstName.value,
            lastname: formState.lastName.value,
            email: formState.email.value,
            subject: formState.subject.value,
            message: formState.message.value,
            type: "contact-form",
        };

        try {
            setIsSubmitting(true);
            await requestCreateContactForm(newContactForm);
            resetForm();
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
        <section id="contact" className="relative py-16 sm:py-20 ">
            <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
                <div className="text-center">
                    <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-white">
                        {t("contact_us_title")}
                    </h2>
                    <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-blue-500/80" />
                    <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 dark:text-neutral-400">
                        Need help with TELC B1 practice, your account, billing, or upcoming exam levels? Send us a message below.
                    </p>
                </div>

                <div className="mt-10 rounded-2xl border border-neutral-200/70 bg-white/90 p-6 shadow-lg backdrop-blur-sm sm:p-8 dark:border-neutral-800 dark:bg-neutral-950/90">
                    <form onSubmit={sendContactForm} className="space-y-6">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className={labelBase}>{t("contact_us_firstname")}</label>
                                <TextInput
                                    type="text"
                                    id="input_firstName"
                                    field="firstName"
                                    value={formState.firstName.value}
                                    onChange={hasFormValueChanged}
                                    inputClass={inputBase}
                                    placeholder="Emily"
                                    required
                                />
                            </div>
                            <div>
                                <label className={labelBase}>{t("contact_us_lastname")}</label>
                                <TextInput
                                    type="text"
                                    id="input_lastName"
                                    field="lastName"
                                    value={formState.lastName.value}
                                    onChange={hasFormValueChanged}
                                    inputClass={inputBase}
                                    placeholder="Anderson"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className={labelBase}>
                                {t("contact_us_email")}
                            </label>
                            <TextInput
                                type="email"
                                id="input_email"
                                field="email"
                                value={formState.email.value}
                                onChange={hasFormValueChanged}
                                inputClass={inputBase}
                                placeholder="emily@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="subject" className={labelBase}>
                                {t("contact_us_subject")}
                            </label>
                            <TextInput
                                type="text"
                                id="input_subject"
                                field="subject"
                                value={formState.subject.value}
                                onChange={hasFormValueChanged}
                                inputClass={inputBase}
                                placeholder={t("contact_us_subject_placeholder")}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className={labelBase}>
                                {t("contact_us_message")}
                            </label>
                            <TextAreaInput
                                id="input_message"
                                field="message"
                                value={formState.message.value}
                                onChange={hasFormValueChanged}
                                rows={6}
                                inputClass={`${inputBase} resize-y`}
                                placeholder={t("contact_us_message_placeholder")}
                            />
                        </div>

                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={isSubmitting}
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
                                        {t("contact_us_sending", "Sending...")}
                                    </>
                                ) : (
                                    <>
                                        {t("contact_us_send_message")}
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
                            <p className="mt-3 text-center text-xs text-neutral-500 dark:text-neutral-400">
                                By submitting, you agree to be contacted about your request.
                            </p>
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
                                <div className="mx-auto -mt-1 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg">
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
                                </div>
                                <h3 className="text-center text-lg font-semibold text-neutral-900 dark:text-white">
                                    Thank you!
                                </h3>
                                <p className="mt-2 text-center text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                    {t("contact_us_popup_description")}
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-3 border-t border-neutral-200 p-4 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setPopup(false)}
                                    className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-black/10 transition hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/30 dark:bg-white dark:text-black dark:ring-white/10"
                                >
                                    {t("contact_us_popup_close")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Contact;