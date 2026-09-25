import React, {Dispatch, useEffect, useMemo, useState} from "react";
import Globe from "../../ProjectPublish/Map/Globe.tsx";
import {getProject, getProjectName, updateProject} from "../../../../../api/project/api-helper.ts";
import {changeProjectCurrentStep, changeSelectedProject} from "../../../../../store/actions/user/project.actions.ts";
import { useDispatch } from "react-redux";
import Loading from "../../../../Shared/Loading.tsx";
import { IProject } from "../../../../../store/models/user/project/project.interface.ts";

export default function AppDetails({ project }: { project: IProject }) {
    const dispatch: Dispatch<any> = useDispatch();
    const [loading, setLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [copied, setCopied] = useState(false);

    const apiBase = process.env.NODE_ENV === "development" ? "http://localhost:8080" : "https://app.easyprufung.com";

    useEffect(() => {
        if (project && project.uuid) {
            const processApi = async () => {
                setLoading(true);
                project = await getProject(project.uuid, dispatch);
                if (project != null) {
                    dispatch(changeSelectedProject(project));
                }
                setLoading(false);
            };
            processApi();
        }
    }, []);

    const publishOnEasyPrufung = () => {
        setShowMap(true);
    };

    const hideFromEasyPrufung = async () => {
        setLoading(true);
        setShowMap(false);
        const updatedProject = {
            ...project,
            isPublic: false,
        };
        const _project = await updateProject(updatedProject);
        if (_project) {
            dispatch(changeSelectedProject(_project));
        }
        setLoading(false);
    };

    const isSetupComplete = useMemo(() => {
// Consider setup "complete" if we have a built site url, name and a logo
        return Boolean(project?.tempUrl && project?.name && project?.logoUrl);
    }, [project]);

    const waitlistCount = project?.waitlists?.length ?? 0;
    const messagesCount = project?.contactForms?.length ?? 0;
    const upvotes = project?.upvote ?? 0;

    const handleCopyLink = async () => {
        try {
            if (!project?.tempUrl) return;
            await navigator.clipboard.writeText(project.tempUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {}
    };

    if (showMap && !project.isPublic) {
        return (
            <div className="w-full">
                <Globe project={project} />
                {loading && <Loading text="Loading" />}
            </div>
        );
    }

    return (
        <div className="w-full">
            {!isSetupComplete && (
                <div className="mb-4 flex justify-end">
                    <div className="inline-flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-500/10 dark:text-amber-300">
                        <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.062 21h13.876c1.054 0 1.702-1.14 1.197-2.046L13.207 2.878a1.2 1.2 0 0 0-2.414 0L3.864 18.954C3.359 19.86 4.007 21 5.062 21z" />
                        </svg>
                        <span>
<strong className="font-semibold">Finish setup:</strong> generate a name, logo, and website to unlock all features.
</span>
                    </div>
                </div>
            )}

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-black/0 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                    {/* Logo */}
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                        {project?.logoUrl ? (
                            <img
                                src={`${apiBase}${project.logoUrl}`}
                                alt={`${project?.name || "App"} logo`}
                                className="h-full w-full object-contain p-1.5"
                            />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-300">
                                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                            </svg>
                        )}
                    </div>

                    {/* Title and status */}
                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <h1 className="truncate text-3xl font-bold text-gray-900 dark:text-white">
                                {project?.name || "MyAwesomeApp"}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                    project?.isPublic
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30"
                        : "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700"
                }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${project?.isPublic ? "bg-emerald-500" : "bg-gray-400"}`} />
                {project?.isPublic ? "Public" : "Private"}
            </span>
                                {!isSetupComplete && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
                Setup incomplete
              </span>
                                )}
                            </div>
                        </div>

                        {/* Project description */}
                        {project?.description && (
                            <p className="mt-3 text-gray-700 dark:text-gray-300">{project.description}</p>
                        )}
                    </div>

                    {/* Publish/Hide */}
                    <div className="flex flex-col items-center justify-center gap-2">
                        {!project?.isPublic ? (
                            <button
                                onClick={publishOnEasyPrufung}
                                disabled={!project?.tempUrl}
                                className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                    project?.tempUrl
                                        ? "border border-gray-900 bg-gray-900 text-white hover:bg-gray-800 active:bg-black dark:border-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                                        : "cursor-not-allowed border border-gray-300 bg-gray-200 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                            >
                                Publish on EasyPrufung
                            </button>
                        ) : (
                            <button
                                onClick={hideFromEasyPrufung}
                                className="inline-flex items-center justify-center rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            >
                                Hide from EasyPrufung
                            </button>
                        )}
                    </div>

                    {/* Upvotes */}
                    <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="26"
                            height="26"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m18 15-6-6-6 6" />
                        </svg>
                        <span className="mt-[-4px] text-lg font-semibold">{upvotes}</span>
                    </div>
                </div>

                {/* Link bar */}
                {project?.tempUrl && (
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200">
                            <input className="w-full bg-transparent outline-none" value={project.tempUrl} disabled />
                            <button
                                onClick={handleCopyLink}
                                className="rounded-md px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700"
                                title="Copy preview URL"
                            >
                                {copied ? "Copied" : "Copy"}
                            </button>
                            <a
                                href={project.tempUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-md px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700"
                                title="Open preview"
                            >
                                Open
                            </a>
                        </div>
                    </div>
                )}
            </section>

            {/* Metrics */}
            <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-black/0 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-start justify-between">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Waitlist Users</h2>
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30">
          Total
        </span>
                    </div>
                    <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                        {waitlistCount.toLocaleString()}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">People who requested early access.</p>
                </div>

                <div className="rounded-2xl border border-gray-2 00 bg-white p-6 shadow-sm ring-1 ring-black/0 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-start justify-between">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Messages</h2>
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30">
          Inbox
        </span>
                    </div>
                    <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                        {messagesCount.toLocaleString()}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">User feedback and inquiries received.</p>
                </div>
            </section>

            {loading && <Loading text="Loading" />}
        </div>
    );
}