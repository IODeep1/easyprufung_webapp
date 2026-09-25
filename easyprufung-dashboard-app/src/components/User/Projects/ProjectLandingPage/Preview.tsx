import React, { Dispatch, useEffect, useRef, useState } from 'react';
import { IProjectState, IStateType } from "../../../../store/models/root.interface";
import { useDispatch, useSelector } from "react-redux";
import { IProject } from "../../../../store/models/user/project/project.interface";
import {
    deleteProjectLandingPage,
    downloadProjectLandingPage,
    getProjectLandingPage,
    saveProjectLandingPage,
    updateProjectLandingPage,
} from "../../../../api/project/api-helper";
import { changeProjectCurrentStep } from "../../../../store/actions/user/project.actions";
import { IUserAccount } from "../../../../store/models/user/userAccount.interface";
import { NavLink, useNavigate } from "react-router-dom";
import LandingPageEditor from "./LandingPageEditor.tsx";
import Loading from "../../../Shared/Loading.tsx";
import { replaceLandingPageBodyContent } from "./helper/landingpage-helper.ts";

type ResizeSide = 'left' | 'right' | null;

interface WindowSize {
    name: string;
    width: number;
    height: number;
}

const WINDOW_SIZES: WindowSize[] = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Laptop', width: 1366, height: 768 },
    { name: 'Desktop', width: 1920, height: 1080 },
];

function addUIDsToHtml(html: string) {
    let uid = 0;
    return html.replace(/<(img|label|span|h[1-6]|p|a)([^>]*)>/gi, (match, tag, attrs) => {
        uid++;
        if (/data-uid=/.test(attrs)) return match;
        return `<${tag}${attrs} data-uid="uid${uid}">`;
    });
}

export const Preview = ({ currentUrl, setShowProgress }: { currentUrl: string; setShowProgress: (b: boolean) => void }) => {
    const navigate = useNavigate();
    const dispatch: Dispatch<any> = useDispatch();
    const account: IUserAccount = useSelector((state: IStateType) => state.userAccount);
    let isFreeSubscription = account.subscription?.plan === "free";

    const projectState: IProjectState = useSelector((state: IStateType) => state.projects);
    let project: IProject | null = projectState.selectedProject;

    const [loadingMessage, setLoadingMessage] = useState<string>("Loading...");
    const [loading, setLoading] = useState<boolean>(false);

    const [inputHtml, setInputHtml] = useState<string>("");
    const [history, setHistory] = useState<{ past: string[]; present: string; future: string[] }>({
        past: [],
        present: "",
        future: [],
    });
    const [editMode, setEditMode] = useState<boolean>(true);
    const [saveCount, setSaveCount] = useState(0);

    useEffect(() => {
        const processApi = async () => {
            if (!project) return;
            setLoadingMessage("Loading...");
            setLoading(true);
            setUrl(project.tempUrl);
            setIframeUrl(`${project.tempUrl}?t=${new Date().getTime()}`);
            const apiProject = await getProjectLandingPage(project.uuid, dispatch);
            const apiHtml = apiProject?.indexHtmlContent || "";
            if (!apiHtml || apiHtml.includes("SP LandingPage")) {
                setEditMode(false);
            }
            setInputHtml(apiHtml);
            const initialBodyHtml = addUIDsToHtml(new DOMParser().parseFromString(apiHtml, "text/html").body.innerHTML);
            setHistory({ past: [], present: initialBodyHtml, future: [] });
            setLoading(false);
        };
        processApi();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project, saveCount]);

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const activePreview = currentUrl;

    const [buildError, setBuildError] = useState("");
    const [websiteDownPopUp, setWebsiteDownPopUp] = useState(false);
    const [url, setUrl] = useState('');
    const [iframeUrl, setIframeUrl] = useState<string | undefined>();
    const [isDeviceModeOn, setIsDeviceModeOn] = useState(false);
    const [widthPercent, setWidthPercent] = useState<number>(37.5);

    const resizingState = useRef({
        isResizing: false,
        side: null as ResizeSide,
        startX: 0,
        startWidthPercent: 37.5,
        windowWidth: window.innerWidth,
    });

    const SCALING_FACTOR = 2;

    const [isWindowSizeDropdownOpen, setIsWindowSizeDropdownOpen] = useState(false);
    const [isDownloadDropdownOpen, setDownloadDropdownOpen] = useState(false);

    const [reloadCount, setReloadCount] = useState(0);
    const handleReloadSubframe = () => setReloadCount((c) => c + 1);

    const reloadPreview = () => {
        if (iframeRef.current) {
            iframeRef.current.src = `${iframeRef.current.src}?t=${new Date().getTime()}`;
            handleReloadSubframe();
        }
    };

    const toggleDeviceMode = () => {
        setIsDeviceModeOn((prev) => !prev);
    };

    const startResizing = (e: React.MouseEvent, side: ResizeSide) => {
        if (!isDeviceModeOn) return;

        document.body.style.userSelect = 'none';

        resizingState.current.isResizing = true;
        resizingState.current.side = side;
        resizingState.current.startX = e.clientX;
        resizingState.current.startWidthPercent = widthPercent;
        resizingState.current.windowWidth = window.innerWidth;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!resizingState.current.isResizing) return;

        const dx = e.clientX - resizingState.current.startX;
        const windowWidth = resizingState.current.windowWidth;
        const dxPercent = (dx / windowWidth) * 100 * SCALING_FACTOR;

        let newWidthPercent = resizingState.current.startWidthPercent;
        if (resizingState.current.side === 'right') {
            newWidthPercent += dxPercent;
        } else if (resizingState.current.side === 'left') {
            newWidthPercent -= dxPercent;
        }
        newWidthPercent = Math.max(10, Math.min(newWidthPercent, 90));
        setWidthPercent(newWidthPercent);
    };

    const onMouseUp = () => {
        resizingState.current.isResizing = false;
        resizingState.current.side = null;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.userSelect = '';
    };

    useEffect(() => {
        const handleWindowResize = () => { };
        window.addEventListener('resize', handleWindowResize);
        return () => window.removeEventListener('resize', handleWindowResize);
    }, []);

    const GripIcon = () => (
        <div className="flex h-full items-center justify-center select-none pointer-events-none">
            <div className="ml-0.5 text-[10px] leading-[5px] text-black/50 dark:text-white/50">••• •••</div>
        </div>
    );

    const openInNewWindow = (size: WindowSize) => {
        const newWindow = window.open(
            activePreview,
            '_blank',
            `noopener,noreferrer,width=${size.width},height=${size.height},menubar=no,toolbar=no,location=no,status=no`,
        );
        if (newWindow) newWindow.focus();
    };

    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    const [popup, setPopup] = useState(false);
    const showDeletePopUp = () => setPopup(true);

    // Upgrade modal state
    const [upgradePopup, setUpgradePopup] = useState(false);
    const showUpgradePopup = () => setUpgradePopup(true);

    const deleteLandingPage = async () => {
        if (!project) return;
        setShowProgress(false);
        setLoadingMessage("Deleting...");
        setLoading(true);
        project = await deleteProjectLandingPage(project.uuid);
        if (project) {
            dispatch(changeProjectCurrentStep(project, projectState.currentStep));
        }
        setLoading(false);
    };

    const downloadCode = async (type: "code" | "build") => {
        if (isFreeSubscription) {
            showUpgradePopup();
            return;
        }
        if (project === null) return;
        const zipUrl = await downloadProjectLandingPage(project.uuid, type);
        if (!zipUrl) return;
        const link = document.createElement('a');
        link.href = zipUrl;
        link.setAttribute('download', `${project.name.toLowerCase()}_${type}.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const Save = async () => {
        if (isFreeSubscription) {
            showUpgradePopup();
            return;
        }
        if (inputHtml && project) {
            setLoadingMessage("Saving...");
            setLoading(true);
            const newFullHtml = replaceLandingPageBodyContent(inputHtml, history.present);
            project.indexHtmlContent = newFullHtml;
            await saveProjectLandingPage(project);
            setSaveCount((c) => c + 1);
            setLoading(false);
        }
    };

    const undo = () => {
        setHistory((h) => {
            if (h.past.length === 0) return h;
            const previous = h.past[h.past.length - 1];
            const newPast = h.past.slice(0, h.past.length - 1);
            return { past: newPast, present: previous, future: [h.present, ...h.future] };
        });
    };

    const redo = () => {
        setHistory((h) => {
            if (h.future.length === 0) return h;
            const next = h.future[0];
            const newFuture = h.future.slice(1);
            return { past: [...h.past, h.present], present: next, future: newFuture };
        });
    };

    const setEditorHtml = (newHtml: string) => {
        setHistory((h) => ({ past: [...h.past, h.present], present: newHtml, future: [] }));
    };

    function ViewMode() {
        return (
            <div className="overflow-hidden w-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <iframe
                    ref={iframeRef}
                    src={iframeUrl}
                    title="Landing Page View"
                    className="min-h=[80vh] min-h-[80vh] w-full bg-white dark:bg-gray-900"
                    sandbox="allow-scripts allow-forms allow-popups allow-modals allow-storage-access-by-user-activation allow-same-origin"
                    allow="cross-origin-isolated"
                />
            </div>
        );
    }

    const deviceWidthPx = Math.round((containerRef.current?.clientWidth || 0) * (widthPercent / 100));

    const isInvalidHtml = (!inputHtml || inputHtml.trim() === "" || inputHtml.includes("SP LandingPage"));

    return (
        <div className="mx-auto h-screen max-w-6xl space-y-4">
            <div ref={containerRef} className="relative flex h-full w-full flex-col">
                {/* Toolbar */}
                <div className="sticky top-0 z-10 rounded-xl border border-gray-200 bg-white/80 p-2 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Reload */}
                        <button
                            title="Reload"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                            onClick={reloadPreview}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                <path d="M21 3v5h-5" />
                            </svg>
                        </button>

                        {/* URL bar */}
                        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm dark:border-gray-800 dark:bg-gray-800">
                            <input
                                disabled
                                title="URL"
                                ref={inputRef}
                                className="w-full bg-transparent text-gray-800 outline-none dark:text-gray-100"
                                type="text"
                                value={url}
                                onChange={(event) => setUrl(event.target.value)}
                            />
                            <button
                                title="Copy"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-gray-700 dark:hover:bg-gray-700"
                                onClick={handleCopy}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                </svg>
                            </button>
                            {copied && (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                  Copied
                </span>
                            )}
                        </div>

                        {/* Edit/View */}
                        <button
                            title={editMode ? "View" : "Edit"}
                            disabled={isInvalidHtml}
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border  
    ${editMode
                                ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-500/10 dark:text-blue-300"
                                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                            }  
    ${isInvalidHtml ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}  
  `}
                            onClick={() => setEditMode(!editMode)}
                        >
                            {!editMode ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-[18px] w-[18px] ${isInvalidHtml ? "opacity-50" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                                    <path d="m15 5 4 4" />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-[18px] w-[18px] ${isInvalidHtml ? "opacity-50" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>

                        {/* Undo */}
                        <button
                            title="Undo"
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${
                                history.past.length === 0
                                    ? "cursor-not-allowed border-gray-200 bg-white text-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-600"
                                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                            }`}
                            onClick={undo}
                            disabled={history.past.length === 0}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M3 7v6h6" />
                                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                            </svg>
                        </button>

                        {/* Redo */}
                        <button
                            title="Redo"
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${
                                history.future.length === 0
                                    ? "cursor-not-allowed border-gray-200 bg-white text-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-600"
                                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                            }`}
                            onClick={redo}
                            disabled={history.future.length === 0}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M21 7v6h-6" />
                                <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
                            </svg>
                        </button>

                        {/* Save */}
                        <div className="relative">
                            <button
                                title="Save"
                                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${
                                    history.past.length === 0
                                        ? "cursor-not-allowed border-gray-200 bg-white text-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-600"
                                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                                }`}
                                onClick={Save}
                                disabled={history.past.length === 0}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                                    <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
                                    <path d="M7 3v4a1 1 0 0 0 1 1h7" />
                                </svg>
                            </button>
                            {history.past.length !== 0 && (
                                <div className="flex flex-col absolute top-8 left-3 inline-flex ">
                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-gray-900 animate-pulse" />
                                    <div className="hidden w-[180px] sm:inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-900/40 dark:bg-amber-500/10 dark:text-amber-300">
                                        You have unsaved changes
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Device mode */}
                        <button
                            title={isDeviceModeOn ? "Switch to Responsive mode" : "Switch to Device mode"}
                            className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm ${
                                isDeviceModeOn
                                    ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-500/10 dark:text-sky-300"
                                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                            }`}
                            onClick={toggleDeviceMode}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8" />
                                <path d="M10 19v-3.96 3.15" />
                                <path d="M7 19h5" />
                                <rect width="6" height="10" x="16" y="12" rx="2" />
                            </svg>
                            {isDeviceModeOn ? `${Math.max(deviceWidthPx, 0)}px` : "Device"}
                        </button>

                        {/* Window size dropdown */}
                        <div className="relative">
                            <button
                                title="Open preview window with size"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                onClick={() => setIsWindowSizeDropdownOpen(!isWindowSizeDropdownOpen)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M15 3h6v6" />
                                    <path d="M10 14 21 3" />
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                </svg>
                            </button>
                            {isWindowSizeDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-50" onClick={() => setIsWindowSizeDropdownOpen(false)} />
                                    <div className="absolute right-0 top-full z-50 mt-2 min-w-[240px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-black">
                                        {WINDOW_SIZES.map((size) => (
                                            <button
                                                key={size.name}
                                                className="flex w-full items-center gap-3 bg-white px-4 py-3.5 text-left text-sm text-gray-800 hover:bg-gray-50 dark:bg-black dark:text-gray-300 dark:hover:bg-gray-900"
                                                onClick={() => {
                                                    setIsWindowSizeDropdownOpen(false);
                                                    openInNewWindow(size);
                                                }}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{size.name}</span>
                                                    <span className="text-xs text-gray-500">
                            {size.width} × {size.height}
                          </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Download dropdown */}
                        <div className="relative">
                            <button
                                title="Download"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                onClick={() => setDownloadDropdownOpen(!isDownloadDropdownOpen)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" x2="12" y1="15" y2="3" />
                                </svg>
                            </button>
                            {isDownloadDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-50" onClick={() => setDownloadDropdownOpen(false)} />
                                    <div className="absolute right-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-black">
                                        <button
                                            className="flex w-full items-center justify-between bg-white px-4 py-3.5 text-left text-sm text-gray-800 hover:bg-gray-50 dark:bg-black dark:text-gray-300 dark:hover:bg-gray-900"
                                            onClick={() => {
                                                setDownloadDropdownOpen(false);
                                                downloadCode("code");
                                            }}
                                        >
                                            <span>Download Source Code</span>
                                            {isFreeSubscription && (
                                                <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:border-amber-900/40 dark:bg-amber-500/10 dark:text-amber-300">
                          Pro
                        </span>
                                            )}
                                        </button>

                                    </div>
                                </>
                            )}
                        </div>

                        {/* Delete */}
                        <button
                            title="Delete"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-300"
                            onClick={showDeletePopUp}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                <line x1="10" x2="10" y1="11" y2="17" />
                                <line x1="14" x2="14" y1="11" y2="17" />
                            </svg>
                        </button>
                    </div>

                    {/* Device hint */}
                    {isDeviceModeOn && (
                        <div className="px-2">
                            <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30">
                                Drag the side handles to resize preview width
                            </div>
                        </div>
                    )}

                    {/* Legacy HTML notice (top hint) */}
                    {!loading && isInvalidHtml && (
                        <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-900/40 dark:bg-amber-500/10 dark:text-amber-200">
                            <div className="flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-5 w-5 flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Editing is disabled for this page</p>
                                    <p className="text-sm opacity-90">
                                        You cannot edit the content because your page was generated with an older version. To unlock all features, please start over and create a new page.
                                    </p>
                                </div>
                                <button
                                    onClick={showDeletePopUp}
                                    className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-900/40 dark:bg-transparent dark:text-amber-200 dark:hover:bg-amber-900/20"
                                >
                                    Start over
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Workspace */}
                <div className="flex flex-1 items-center justify-center overflow-auto">
                    <div
                        style={{
                            width: isDeviceModeOn ? `${widthPercent}%` : '100%',
                            height: '100%',
                            overflow: 'visible',
                            position: 'relative',
                            display: 'flex',
                            padding: isDeviceModeOn ? '1.25rem' : '0',
                        }}
                    >
                        {inputHtml && (editMode ? (
                            <LandingPageEditor inputHtml={inputHtml} html={history.present} setHtml={setEditorHtml} reloadCount={reloadCount} />
                        ) : (
                            <ViewMode />
                        ))}

                        {isDeviceModeOn && (
                            <>
                                <div
                                    onMouseDown={(e) => startResizing(e, 'left')}
                                    className="absolute left-0 top-0 -ml-[15px] flex h-full w-[15px] cursor-ew-resize items-center justify-center bg-white/20 transition hover:bg-white/50"
                                    title="Drag to resize width"
                                >
                                    <GripIcon />
                                </div>
                                <div
                                    onMouseDown={(e) => startResizing(e, 'right')}
                                    className="absolute right-0 top-0 -mr-[15px] flex h-full w-[15px] cursor-ew-resize items-center justify-center bg-white/20 transition hover:bg-white/50"
                                    title="Drag to resize width"
                                >
                                    <GripIcon />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete modal */}
            {popup && (
                <div className="relative z-50">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
                                <div className="flex items-start justify-between border-b border-gray-200 p-4 dark:border-gray-800">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">EasyPrufung</h3>
                                    <button
                                        type="button"
                                        onClick={() => setPopup(false)}
                                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                        </svg>
                                        <span className="sr-only">Close modal</span>
                                    </button>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                        Are you sure you want to delete this landing page and begin again? This will erase all your content.
                                    </p>
                                </div>
                                <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-800">
                                    <button
                                        type="button"
                                        onClick={() => setPopup(false)}
                                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                                    >
                                        No
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPopup(false);
                                            deleteLandingPage();
                                        }}
                                        className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                                    >
                                        Yes, delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Website down modal */}
            {websiteDownPopUp && (
                <div className="relative z-50">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
                                <div className="flex items-start justify-between border-b border-gray-200 p-4 dark:border-gray-800">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text:white">EasyPrufung</h3>
                                    <button
                                        type="button"
                                        onClick={() => setWebsiteDownPopUp(false)}
                                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                        </svg>
                                        <span className="sr-only">Close modal</span>
                                    </button>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    <span>
                      Something went wrong while generating your landing page. Would you like to ask EasyPrufung for a fix,
                      or post your generated URL:
                      <span className="text-blue-600 dark:text-blue-400">
                        <br />
                          {` ${activePreview} `}
                          <br />
                      </span>
                      in our Discord channel and we'll assist you?
                    </span>
                                    </p>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-200 p-4 dark:border-gray-800">
                                    <button
                                        onClick={async () => {
                                            setWebsiteDownPopUp(false);
                                            if (!projectState?.selectedProject) return;
                                            setShowProgress(false);
                                            setLoading(true);
                                            const newChatMessage = {
                                                step: projectState.currentStep,
                                                content: `Build returned the following error: '${buildError}'\n Please investigate the issue and implement a fix.`,
                                            };
                                            const updatedProject = await updateProjectLandingPage(newChatMessage, projectState.selectedProject.uuid);
                                            if (updatedProject) dispatch(changeProjectCurrentStep(updatedProject, projectState.currentStep));
                                            setLoading(false);
                                        }}
                                        className="inline-flex items-center justify-center rounded-lg border border-black bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 active:bg-gray-900 dark:border-white dark:bg-white dark:text-black dark:hover:bg-gray-300"
                                    >
                                        Fix
                                    </button>
                                    <NavLink
                                        onClick={() => setWebsiteDownPopUp(false)}
                                        to="https://discord.gg/Gdm5TJ789H"
                                        target="_blank"
                                        className="group relative inline-flex items-center gap-2.5 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 duration-300 ease-in-out hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                                    >
                                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.942 5.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.586 11.586 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3 17.392 17.392 0 0 0-2.868 11.662 15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.638 10.638 0 0 1-1.706-.83c.143-.106.283-.217.418-.331a11.664 11.664 0 0 0 10.118 0c.137.114.277.225.418.331-.544.328-1.116.606-1.71.832a12.58 12.58 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-11.59ZM8.678 14.813a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.929 1.929 0 0 1-1.8 2.045Zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Z" />
                                        </svg>
                                        Post on Discord
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade modal */}
            {upgradePopup && (
                <div className="relative z-50">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <div className="relative max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
                                <div className="flex items-start justify-between border-b border-gray-200 p-4 dark:border-gray-800">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">EasyPrufung</h3>
                                    <button
                                        type="button"
                                        onClick={() => setUpgradePopup(false)}
                                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                        </svg>
                                        <span className="sr-only">Close modal</span>
                                    </button>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                        This feature is available with our premium plan.
                                    </p>
                                </div>
                                <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-800">
                                    <button
                                        type="button"
                                        onClick={() => setUpgradePopup(false)}
                                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                                    >
                                        Later
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUpgradePopup(false);
                                            navigate('/pricing');
                                        }}
                                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                    >
                                        Upgrade
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading && <Loading text={loadingMessage} />}
        </div>
    );
};