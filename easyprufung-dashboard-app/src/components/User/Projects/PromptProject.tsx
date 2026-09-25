import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { createProject } from "../../../api/project/api-helper";
import { IUserAccount } from "../../../store/models/user/userAccount.interface";
import { useSelector } from "react-redux";
import { IStateType } from "../../../store/models/root.interface";
import { useLocation, useNavigate } from "react-router-dom";
import { IProject } from "../../../store/models/user/project/project.interface";
import { OnChangeModel } from "../../../common/types/Form.types";
import TextAreaInput from "../../../common/components/TextAreaInput";
import Loading from "../../Shared/Loading";
import { TypeAnimation } from "react-type-animation";

const PromptProject = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [popup, setPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");

    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const { t } = useTranslation();
    const account: IUserAccount = useSelector((state: IStateType) => state.userAccount);
    const isFreeSubscription = account.subscription?.plan === "free";
    const quota = account.subscription ? account.subscription.quota : 0;

    const [formState, setFormState] = useState({
        userprompt: { error: "", value: "" },
    });

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        let userPrompt = queryParams.get("prompt");
        if (!userPrompt) {
            userPrompt = localStorage.getItem("user_prompt") || "";
        }
        if (userPrompt) {
            setFormState((prev) => ({ ...prev, userprompt: { error: "", value: userPrompt || "" } }));
        }
    }, [location.search]);

    function hasFormValueChanged(model: OnChangeModel): void {
        setFormState((prev) => ({ ...prev, [model.field]: { error: model.error, value: model.value } }));
    }

    const sendPrompt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.userprompt.value?.trim()) return;

        localStorage.setItem("user_prompt", formState.userprompt.value);

        if (quota === 0 || isFreeSubscription) {
            navigate("/pricing");
            return;
        }

        if (!account.user?.email) {
            navigate("/login");
            return;
        }

// clear local storage
        localStorage.setItem("user_prompt", "");

        setLoadingMessage("Generating your project...");
        setLoading(true);

        const newProject: Partial<IProject> = {
            prompt: formState.userprompt.value,
        };

        const projectDetail = await createProject(newProject as IProject);
        setLoading(false);

        if (projectDetail !== null && projectDetail.uuid !== undefined) {
            localStorage.setItem("current_step", "project_validation");
            navigate("/projects/" + projectDetail.uuid, { state: projectDetail });
        } else {
            setPopupMessage("Failed to generate. Adjust your prompt and try again.");
            setPopup(true);
        }
    };

    return (
        <section
            id="create_project"
            className="relative isolate"
        >
            {/* Background - subtle grid for modern black & white feel */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 text-black dark:text-white"
            >
                <div className="h-full w-full opacity-[0.04] dark:opacity-[0.06] [background:radial-gradient(black_1px,transparent_1px)] [background-size:20px_20px]" />
            </div>

            <div className="px-4 py-12 md:py-16 mx-auto max-w-3xl">
                <header className="mb-8 md:mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black dark:text-white">
                        What do you want to launch?
                    </h1>
                    <p className="mt-4 text-base md:text-lg text-neutral-600 dark:text-neutral-300">
                        Describe your idea and EasyPrufung will validate demand, name your venture, craft a logo, build and edit your landing page in real time—guided by an AI copilot.
                    </p>
                    <div className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
                        <TypeAnimation
                            sequence={[
                                "Example: AI health coach with personalized fitness and nutrition.",
                                3000,
                                "Example: Marketplace for local artisans with automated product photos.",
                                3000,
                                "Example: B2B SaaS that monitors API uptime and sends Slack alerts.",
                                3000,
                            ]}
                            wrapper="span"
                            speed={70}
                            repeat={Infinity}
                        />
                    </div>
                </header>

                <form onSubmit={sendPrompt} className="space-y-6">
                    <div>
                        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black shadow-sm hover:shadow transition-shadow">
                            <label htmlFor="input_userprompt" className="sr-only">
                                Your idea
                            </label>
                            <TextAreaInput
                                id="input_userprompt"
                                field="userprompt"
                                value={formState.userprompt.value}
                                onChange={hasFormValueChanged}
                                required={true}
                                type="text"
                                inputClass="block w-full min-h-[180px] resize-y leading-relaxed text-base placeholder-neutral-400 bg-transparent text-black dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent p-4 md:p-6"
                                placeholder="Describe your startup idea (audience, goals, constraints)…"
                            />
                        </div>
                        <div className="flex mt-2 items-center justify-between px-4 md:px-6 pb-4 md:pb-6">
                            <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400">
                                Tip: Mention your audience, goals, and constraints for better results.
                            </p>
                            {quota !== -1 && !isFreeSubscription && (
                                <span className="ml-3 inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-xs text-neutral-600 dark:text-neutral-300">
                              {quota} remaining
                            </span>
                            )}

                        </div>
                    </div>


                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-full border border-black bg-black px-6 md:px-8 py-3 text-white transition hover:bg-neutral-900 active:bg-black/90 disabled:opacity-60 disabled:cursor-not-allowed dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="h-5 w-5 animate-spin"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <circle
                                            className="opacity-20"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            d="M22 12a10 10 0 0 1-10 10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            className="opacity-80"
                                        />
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    Start
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M5 12h14" />
                                        <path d="M12 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {loading && <Loading text={loadingMessage} />}

            {popup && (
                <div className="relative z-50">
                    <div className="fixed inset-0 bg-black/70"></div>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white text-black shadow-2xl dark:border-neutral-800 dark:bg-black dark:text-white">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
                                    <h3 className="text-lg font-semibold">EasyPrufung</h3>
                                    <button
                                        type="button"
                                        onClick={() => setPopup(false)}
                                        className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white"
                                        aria-label="Close modal"
                                    >
                                        <svg
                                            className="h-4 w-4"
                                            viewBox="0 0 14 14"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M1 1l12 12M13 1L1 13"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <div className="px-5 py-6">
                                    <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                                        {popupMessage}
                                    </p>
                                </div>
                                <div className="flex justify-end gap-3 px-5 py-4 border-t border-neutral-200 dark:border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() => setPopup(false)}
                                        className="inline-flex items-center rounded-full border border-black bg-black px-5 py-2 text-sm text-white hover:bg-neutral-900 active:bg-black/90 dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                                    >
                                        Ok
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default PromptProject;