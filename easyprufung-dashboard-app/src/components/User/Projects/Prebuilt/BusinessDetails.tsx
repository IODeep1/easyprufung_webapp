import React, { Dispatch, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Globe from "../ProjectPublish/Map/Globe.tsx";
import Loading from "../../../Shared/Loading.tsx";
import { updateProject, deleteProject } from "../../../../api/project/api-helper.ts";
import { changeSelectedProject } from "../../../../store/actions/user/project.actions.ts";
import { IProject } from "../../../../store/models/user/project/project.interface.ts";

export default function BusinessDetails({ project }: { project: IProject }) {
    const navigate = useNavigate();
    const dispatch: Dispatch<any> = useDispatch();
    const [loading, setLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [popup, setPopup] = useState(false);
    const [copied, setCopied] = useState(false);

    const apiBase = process.env.NODE_ENV === "development" ? "http://localhost:8080" : "https://app.easyprufung.com";

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

    const deleteProjectAction = async () => {
        if (!project) return;
        setLoading(true);
        const status = await deleteProject(project.uuid);
        if (status) {
            navigate("/add");
            project.updatedDate = "";
            dispatch(changeSelectedProject(project));
        }
        setLoading(false);
    };

    const handleCopyLink = async () => {
        try {
            if (!project?.tempUrl) return;
            await navigator.clipboard.writeText(project.tempUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {}
    };

    const upvotes = project?.upvote ?? 0;

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
            {/* Approval warning */}
            {project && !project.isApproved && project.isPublic && (
                <div className="mb-4 flex justify-end">
                    <div className="inline-flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-500/10 dark:text-amber-300">
                        <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.062 21h13.876c1.054 0 1.702-1.14 1.197-2.046L13.207 2.878a1.2 1.2 0 0 0-2.414 0L3.864 18.954C3.359 19.86 4.007 21 5.062 21z" />
                        </svg>
                        <span>
                        <strong className="font-semibold">Warning:</strong> Your business will be visible shortly after approval.
                    </span>
                    </div>
                </div>
            )}


            {/* Main card (new AppDetails design) */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-black/0 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                    {/* Logo */}
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                        {project?.logoUrl ? (
                            <img
                                src={`${apiBase}${project.logoUrl}`}
                                alt={`${project?.name || "Business"} logo`}
                                className="h-full w-full object-contain p-1.5"
                            />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-300">
                                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                            </svg>
                        )}
                    </div>

                    {/* Title + status */}
                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <h1 className="truncate text-3xl font-bold text-gray-900 dark:text-white">
                                {project?.name || "MyAwesomeApp"}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                                    project && project.isApproved && project?.isPublic
                                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30"
                                        : "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700"
                                }`}
                            >
                                <span className={`h-1.5 w-1.5 rounded-full ${ project && project.isApproved && project?.isPublic ? "bg-emerald-500" : "bg-gray-400"}`} />
                                {project && project.isApproved && project?.isPublic ? "Public" : "Private"}
                            </span>
                            </div>
                        </div>

                        {/* Description */}
                        {project?.description && (
                            <p className="mt-3 text-gray-700 dark:text-gray-300">{project.description}</p>
                        )}
                    </div>

                    {/* Publish/Hide */}
                    <div className="flex flex-col items-center justify-center gap-2">
                        {!project?.isPublic ? (
                            <button
                                onClick={publishOnEasyPrufung}
                                disabled={!project?.url}
                                className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                    project?.url
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

                    {/* Delete */}
                    <button
                        title="Delete"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-500/10"
                        onClick={() => setPopup(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            <line x1="10" x2="10" y1="11" y2="17"/>
                            <line x1="14" x2="14" y1="11" y2="17"/>
                        </svg>
                    </button>
                </div>

                {/* Link bar */}
                {project?.url && (
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200">
                            <input className="w-full bg-transparent outline-none" value={project.url} disabled />
                            <button
                                onClick={handleCopyLink}
                                className="rounded-md px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700"
                                title="Copy preview URL"
                            >
                                {copied ? "Copied" : "Copy"}
                            </button>
                            <a
                                href={project.url}
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

            {/* Loading overlay */}
            {loading && <Loading text="Loading" />}

            {/* Delete confirmation modal */}
            {popup && (
                <div className="relative z-10">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center text-center">
                            <div className="max-w-2xl p-8">
                                <div className="relative bg-white rounded-lg lg:mx-20 shadow dark:bg-gray-700">
                                    <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            EasyPrufung
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setPopup(false)}
                                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                        >
                                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                            </svg>
                                            <span className="sr-only">Close modal</span>
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                            Are you sure you want to delete this business? This action will permanently remove all your content.
                                        </p>
                                    </div>
                                    <div className="p-6 flex justify-between text-right border-t border-gray-200 rounded-b dark:border-gray-600">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPopup(false);
                                                deleteProjectAction();
                                            }}
                                            className="inline-flex shadow-sm items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 h-10 px-4 py-2"
                                        >
                                            Yes
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setPopup(false)}
                                            className="inline-flex shadow-sm items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium border border-gray-300 bg-white dark:bg-black hover:bg-gray-200 text-gray-800 dark:text-white transition-colors duration-200 h-10 px-4 py-2"
                                        >
                                            No
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}