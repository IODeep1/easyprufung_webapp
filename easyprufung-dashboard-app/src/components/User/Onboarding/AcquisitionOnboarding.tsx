import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, Youtube, Facebook, Instagram, Music2, Bot, Twitter, Linkedin, MessageCircle, Send, Gamepad2, Ellipsis, Check } from "lucide-react";
import { IStateType } from "../../../store/models/root.interface";
import { updateUser } from "../../../store/actions/user/userAccount.actions";
import { requestUpdateUserPreferences } from "../../../api/user/api-helper";
import { acquisitionSources, AcquisitionSource } from "./acquisition-sources";
import Logo from "../../../images/logo.png";

const icons = { google: Search, youtube: Youtube, facebook: Facebook, instagram: Instagram, tiktok: Music2, reddit: Bot, x: Twitter, linkedin: Linkedin, whatsapp: MessageCircle, telegram: Send, discord: Gamepad2, other: Ellipsis };
const colors = { google: "text-blue-600", youtube: "text-red-600", facebook: "text-blue-600", instagram: "text-pink-600", tiktok: "text-violet-600", reddit: "text-orange-600", x: "text-gray-800 dark:text-white", linkedin: "text-blue-700", whatsapp: "text-green-600", telegram: "text-sky-500", discord: "text-indigo-500", other: "text-gray-500" };

export default function AcquisitionOnboarding() {
    const { t, i18n } = useTranslation();
    const user = useSelector((state: IStateType) => state.userAccount.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selected, setSelected] = useState<AcquisitionSource | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(false);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (!selected || !user?.email || saving) return;
        setSaving(true);
        setError(false);
        try {
            const updated = await requestUpdateUserPreferences({ email: user.email, acquisitionSource: selected });
            dispatch(updateUser(updated));
            navigate("/", { replace: true });
        } catch {
            setError(true);
            setSaving(false);
        }
    }

    return (
        <main
            id="acquisition_onboarding"
            data-no-translate
            lang={i18n.resolvedLanguage || i18n.language}
            dir={i18n.dir()}
            className="relative min-h-screen overflow-hidden bg-white px-4 py-10 text-black dark:bg-black dark:text-white sm:px-6 sm:py-16"
        >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="absolute -top-28 -right-28 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_1px)]" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-3xl">
                <div className="flex items-center justify-center gap-3 pb-10 sm:pb-12">
                    <img
                        alt={t("acquisition_welcome")}
                        width="64"
                        height="64"
                        src={Logo}
                        className="h-12 w-12 rounded-md"
                    />
                    <span className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        SmartPrüfung
                    </span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/60">
                    <div aria-hidden="true" className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />

                    <form
                        onSubmit={submit}
                        aria-labelledby="acquisition-question"
                        aria-busy={saving}
                        className="p-6 sm:p-8"
                    >
                        <div className="mb-6">
                            <p className="mb-3 text-xs font-semibold text-blue-600 dark:text-blue-400">
                                {t("acquisition_welcome")}
                            </p>
                            <h1 id="acquisition-question" className="text-2xl font-bold sm:text-3xl">
                                {t("acquisition_question")}
                            </h1>
                            <p id="acquisition-hint" className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                {t("acquisition_hint")}
                            </p>
                        </div>

                        <fieldset disabled={saving} aria-describedby="acquisition-hint">
                            <legend className="sr-only">{t("acquisition_question")}</legend>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                {acquisitionSources.map(source => {
                                    const Icon = icons[source];
                                    return (
                                        <label key={source} className="relative block cursor-pointer">
                                            <input
                                                type="radio"
                                                name="acquisitionSource"
                                                value={source}
                                                checked={selected === source}
                                                onChange={() => { setSelected(source); setError(false); }}
                                                required
                                                className="peer sr-only"
                                            />
                                            <span className="flex h-full min-h-[112px] flex-col items-center justify-center gap-3 rounded-xl border border-black/10 bg-white/80 px-3 py-5 text-center text-sm font-medium text-gray-800 transition hover:border-blue-500/50 hover:bg-blue-500/5 peer-checked:border-blue-500 peer-checked:bg-blue-500/10 peer-checked:ring-1 peer-checked:ring-blue-500 peer-focus-visible:ring-4 peer-focus-visible:ring-blue-500/30 peer-disabled:cursor-not-allowed peer-disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:border-blue-400/50 dark:hover:bg-blue-500/10 dark:peer-checked:border-blue-400 dark:peer-checked:bg-blue-500/10 dark:peer-checked:ring-blue-400">
                                                <Icon aria-hidden="true" className={`h-7 w-7 ${colors[source]}`} strokeWidth={1.8} />
                                                <span>{t(`acquisition_sources.${source}`)}</span>
                                            </span>
                                            {selected === source && (
                                                <Check
                                                    aria-hidden="true"
                                                    className="pointer-events-none absolute top-2 h-4 w-4 text-blue-600 dark:text-blue-400"
                                                    style={{ insetInlineEnd: "0.5rem" }}
                                                />
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        </fieldset>

                        {error && (
                            <p role="alert" className="mt-5 text-sm text-red-500">
                                {t("acquisition_error")}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={!selected || saving}
                            className="group relative mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-white dark:text-black dark:ring-white/10"
                        >
                            {saving && (
                                <svg aria-hidden="true" className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z" />
                                </svg>
                            )}
                            {t(saving ? "acquisition_saving" : "acquisition_continue")}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
