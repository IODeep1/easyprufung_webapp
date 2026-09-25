import React, { Dispatch, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Slider } from "../../../../common/components/Silder";
import {
    deleteProjectLogo,
    getProjectLogoSvgContent,
    saveProjectIcon,
} from "../../../../api/project/api-helper";
import { useNavigate, useParams } from "react-router-dom";
import { IProject } from "../../../../store/models/user/project/project.interface";
import {
    changeProjectCurrentStep,
    changeSelectedProject,
} from "../../../../store/actions/user/project.actions";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../../Shared/Loading";
import { IProjectIconConfiguration } from "../../../../store/models/user/project/projectIconConfiguration.interface";
import html2canvas from "html2canvas";
import ColorPicker from "react-best-gradient-color-picker";
import { useTheme } from "../../../../hooks/useColorMode";
import { debounce } from "@mui/material";
import { IUserAccount } from "../../../../store/models/user/userAccount.interface";
import { IProjectState, IStateType } from "../../../../store/models/root.interface";
import { FormLogoContext } from "./context/logo-context.tsx";
import {
    FiDownload,
    FiSave,
    FiTrash2,
    FiRotateCcw,
    FiRotateCw,
    FiChevronDown,
    FiImage,
    FiGrid,
    FiSearch,
    FiX,
    FiZap,
    FiLayers,
} from "react-icons/fi";

export default function EditorLogo() {
    const navigate = useNavigate();
    const account: IUserAccount = useSelector((state: IStateType) => state.userAccount);
    let isFreeSubscription = account.subscription?.plan === "free";

    const projectState: IProjectState = useSelector((state: IStateType) => state.projects);
    let project: IProject = projectState.selectedProject;
    const formLogoCtx = useContext(FormLogoContext);
    const dispatch: Dispatch<any> = useDispatch();

    let svgConfiguration: IProjectIconConfiguration;

    // History Stacks
    const [undoStack, setUndoStack] = useState<any[]>([]);
    const [redoStack, setRedoStack] = useState<any[]>([]);
    const [isUndoRedo, setIsUndoRedo] = useState(false);

    const { colorMode } = useTheme();
    const [isLightMode, setIsLightMode] = useState(colorMode === "light");

    const [selectedSvgContent, setSelectedSvgContent] = useState<string | null>(null);
    const [size, setSize] = useState(300);
    const [rotation, setRotation] = useState(0);
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [strokeColor, setStrokeColor] = useState("#111827");
    const [fillColor, setFillColor] = useState("#111827");
    const [fillOpacity, setFillOpacity] = useState(1);
    const [showIconSelector, setShowIconSelector] = useState(false);
    const [visibleIcons, setVisibleIcons] = useState(200);

    const [rounded, setRounded] = useState(4);
    const [padding, setPadding] = useState(2);
    const [backgroundColor, setBackgroundColor] = useState("rgba(255, 255, 255, 0)");
    const [isGradientBackground, setIsGradientBackground] = useState(false);
    const [gradientData, setGradientData] = useState<any>({
        type: "radial",
        shape: "circle",
        position: "at center",
        colorStops: [
            { color: "rgba(76,254,136,1)", position: "0%" },
            { color: "rgba(76,254,136,1)", position: "24%" },
            { color: "rgba(76,254,136,1)", position: "54%" },
            { color: "rgba(9,9,121,1)", position: "59%" },
            { color: "rgba(0,212,255,1)", position: "100%" },
        ],
    });

    // Unsaved changes tracking
    const [unsaved, setUnsaved] = useState(false);
    const lastSavedSnapshotRef = useRef<string>("");

    const buildSnapshot = useCallback(
        (params?: {
            size?: number;
            rotation?: number;
            strokeWidth?: number;
            strokeColor?: string;
            fillColor?: string;
            fillOpacity?: number;
            rounded?: number;
            padding?: number;
            backgroundColor?: string;
            isGradientBackground?: boolean;
            iconData?: string | null;
        }) => {
            const snap = {
                size: params?.size ?? size,
                rotation: params?.rotation ?? rotation,
                strokeWidth: params?.strokeWidth ?? strokeWidth,
                strokeColor: params?.strokeColor ?? strokeColor,
                fillColor: params?.fillColor ?? fillColor,
                fillOpacity: params?.fillOpacity ?? fillOpacity,
                backgroundRounded: params?.rounded ?? rounded,
                backgroundPadding: params?.padding ?? padding,
                backgroundColor: params?.backgroundColor ?? backgroundColor,
                isGradientBackground: params?.isGradientBackground ?? isGradientBackground,
                iconData: typeof params?.iconData === "string" ? params?.iconData : selectedSvgContent ?? "",
            };
            return JSON.stringify(snap);
        },
        [
            size,
            rotation,
            strokeWidth,
            strokeColor,
            fillColor,
            fillOpacity,
            rounded,
            padding,
            backgroundColor,
            isGradientBackground,
            selectedSvgContent,
        ]
    );

    useEffect(() => {
        setIsLightMode(colorMode === "light");
    }, [colorMode]);

    const parseGradient = (gradient: string) => {
        const linearGradientRegex = /linear-gradient\(([^,]+),\s*(.*)\)/;
        const radialGradientRegex = /radial-gradient\(([^,]+),\s*(.*)\)/;

        let match: RegExpMatchArray | null,
            direction: string | undefined,
            colorStops: any[] | undefined;

        if ((match = gradient.match(linearGradientRegex))) {
            direction = match[1].trim().replace("deg", "");
            const colorStopsString = match[2].trim();
            const stopRegex =
                /([a-zA-Z]+\(\d+,\s*\d+,\s*\d+(?:,\s*\d+(\.\d+)?)?\))\s*(\d+%)/g;
            colorStops = [];
            let stopMatch: RegExpExecArray | null;
            while ((stopMatch = stopRegex.exec(colorStopsString)) !== null) {
                const color = stopMatch[1].trim();
                const position = stopMatch[3].trim();
                colorStops.push({ color, position });
            }
            return { type: "linear", direction, colorStops };
        }

        if ((match = gradient.match(radialGradientRegex))) {
            const shapeAndPosition = match[1].trim();
            const colorStopsString = match[2].trim();
            const [shape, ...positionParts] = shapeAndPosition.split(" ");
            const position = positionParts.join(" ").trim();
            const stopRegex =
                /([a-zA-Z]+\(\d+,\s*\d+,\s*\d+(?:,\s*\d+(\.\d+)?)?\))\s*(\d+%)/g;
            colorStops = [];
            let stopMatch: RegExpExecArray | null;
            while ((stopMatch = stopRegex.exec(colorStopsString)) !== null) {
                const color = stopMatch[1].trim();
                const pos = stopMatch[3].trim();
                colorStops.push({ color, position: pos });
            }
            return { type: "radial", shape, position, colorStops };
        }
    };

    const checkGradient = (value: any) => {
        return (
            typeof value === "string" &&
            (value.startsWith("linear-gradient") || value.startsWith("radial-gradient"))
        );
    };

    const handleBackGroundColorPickerChange = (value: string) => {
        const isGradient = checkGradient(value);
        setIsGradientBackground(isGradient);
        if (isGradient) {
            const parsedGradient = parseGradient(value);
            if (parsedGradient) setGradientData(parsedGradient);
        }
        setBackgroundColor(value);
    };

    const svgBackGroundData = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <g fill-rule="evenodd">
        <g fill="#9C92AC" fill-opacity="0.15">
          <path opacity=".3" d="M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z"/>
          <path d="M6 5V0H5v5H0v1h5v94h1V6h94V5H6z"/>
        </g>
      </g>
    </svg>
  `;

    const [fileData, setFileData] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    // Keep iconSize as our internal coordinate system; render responsive with viewBox
    const iconSize = 400;
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Loading...");
    // Upgrade modal state
    const [upgradePopup, setUpgradePopup] = useState(false);
    const showUpgradePopup = () => setUpgradePopup(true);

    useEffect(() => {
        const requireFiles = require.context("./icons", false, /\.txt$/);
        const files: any[] = [];
        requireFiles.keys().forEach((file: string) => {
            const content = requireFiles(file);
            files.push({ name: file.replace("./", "").replace(".txt", ""), content });
        });
        setFileData(files);

        if (id) {
            const processApi = async () => {
                setLoading(true);
                project = await getProjectLogoSvgContent(id);
                if (project != null) {
                    if (project.iconConfiguration) {
                        svgConfiguration = JSON.parse(project.iconConfiguration);
                        setSize(svgConfiguration.size ?? 300);
                        setRotation(svgConfiguration.rotation ?? 0);
                        setStrokeWidth(svgConfiguration.strokeWidth ?? 2);
                        setStrokeColor(svgConfiguration.strokeColor ?? "#111827");
                        setFillColor(svgConfiguration.fillColor ?? "#111827");
                        setFillOpacity(svgConfiguration.fillOpacity ?? 1);
                        setRounded(svgConfiguration.backgroundRounded ?? 4);
                        setPadding(svgConfiguration.backgroundPadding ?? 2);
                        const normalizedIsGradient =
                            (svgConfiguration as any).isGradientBackGround ??
                            (svgConfiguration as any).isGradientBackground ??
                            false;
                        setIsGradientBackground(normalizedIsGradient);
                        handleBackGroundColorPickerChange(
                            svgConfiguration.backgroundColor ?? "rgba(255, 255, 255, 0)"
                        );

                        // Initialize "last saved" snapshot aligned with our current key naming
                        lastSavedSnapshotRef.current = buildSnapshot({
                            size: svgConfiguration.size ?? 300,
                            rotation: svgConfiguration.rotation ?? 0,
                            strokeWidth: svgConfiguration.strokeWidth ?? 2,
                            strokeColor: svgConfiguration.strokeColor ?? "#111827",
                            fillColor: svgConfiguration.fillColor ?? "#111827",
                            fillOpacity: svgConfiguration.fillOpacity ?? 1,
                            rounded: svgConfiguration.backgroundRounded ?? 4,
                            padding: svgConfiguration.backgroundPadding ?? 2,
                            backgroundColor: svgConfiguration.backgroundColor ?? "rgba(255, 255, 255, 0)",
                            isGradientBackground: normalizedIsGradient,
                            iconData: project.iconData ?? "",
                        });
                    } else {
                        // No existing config; set baseline snapshot from defaults
                        lastSavedSnapshotRef.current = buildSnapshot({ iconData: project.iconData ?? "" });
                    }

                    setSelectedSvgContent(project.iconData);
                    dispatch(changeSelectedProject(project));
                }
                setLoading(false);
            };
            processApi();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectState?.selectedProject?.updatedDate]);

    const updatedProject = useRef(project);

    const pushStateToUndoStack = (state: any) => {
        if (!isUndoRedo) {
            setUndoStack((prev) => [...prev, state]);
        }
    };

    const debouncedPushState = useCallback(
        debounce((newState: any) => {
            pushStateToUndoStack(newState);
        }, 500),
        []
    );

    const applyState = (s: any) => {
        setSize(s.size);
        setRotation(s.rotation);
        setStrokeWidth(s.strokeWidth);
        setStrokeColor(s.strokeColor);
        setFillColor(s.fillColor);
        setFillOpacity(s.fillOpacity);
        setShowIconSelector(s.showIconSelector);
        setVisibleIcons(s.visibleIcons);
        setRounded(s.rounded);
        setPadding(s.padding);
        setBackgroundColor(s.backgroundColor);
        setIsGradientBackground(s.isGradientBackground);
    };

    useEffect(() => {
        const currentState = {
            size,
            rotation,
            strokeWidth,
            strokeColor,
            fillColor,
            fillOpacity,
            showIconSelector,
            visibleIcons,
            rounded,
            padding,
            backgroundColor,
            isGradientBackground,
        };
        debouncedPushState(currentState);

        const svgString = generateSvg();
        const newIconConfiguration = {
            ...svgConfiguration,
            size,
            rotation,
            strokeWidth,
            strokeColor,
            fillColor,
            fillOpacity,
            backgroundRounded: rounded,
            backgroundPadding: padding,
            backgroundColor,
            isGradientBackground,
        };
        project.iconConfiguration = JSON.stringify(newIconConfiguration);
        project.svgIcon = svgString;
        updatedProject.current = project;

        // Unsaved detection: compare snapshot with last saved snapshot
        const currentSnapshot = buildSnapshot();
        setUnsaved(currentSnapshot !== lastSavedSnapshotRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        selectedSvgContent,
        size,
        rotation,
        strokeWidth,
        strokeColor,
        fillColor,
        fillOpacity,
        rounded,
        padding,
        backgroundColor,
        isGradientBackground,
    ]);

    // Warn user when leaving with unsaved changes
    useEffect(() => {
        const beforeUnload = (e: BeforeUnloadEvent) => {
            if (!unsaved) return;
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", beforeUnload);
        return () => window.removeEventListener("beforeunload", beforeUnload);
    }, [unsaved]);

    const generateSvg = () => {
        // Define a clipPath for rounded corners and padding
        const clipPath = `  
        <defs>  
          <clipPath id="icon-round">  
            <rect  
              x="${padding / 2}"  
              y="${padding / 2}"  
              width="${24 - padding}"  
              height="${24 - padding}"  
              rx="${rounded}" />  
          </clipPath>  
        </defs>  
      `;

        // Apply clipPath to the icon content
        const innerSvg = `  
        <g transform="translate(${iconSize / 2 - size / 2}, ${iconSize / 2 - size / 2})">  
          <g transform="rotate(${rotation}, ${size / 2}, ${size / 2})">  
            <svg  
              width="${size}"  
              height="${size}"  
              viewBox="0 0 24 24"  
              stroke-linecap="round"  
              stroke-linejoin="round"  
              stroke="${strokeColor}"  
              fill="${fillColor}"  
              stroke-width="${strokeWidth}"  
              fill-opacity="${fillOpacity}"  
              xmlns="http://www.w3.org/2000/svg"  
            >  
              ${clipPath}  
              <g clip-path="url(#icon-round)">  
                ${selectedSvgContent ?? ""}  
              </g>  
            </svg>  
          </g>  
        </g>    
  `;

        return `  
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${iconSize} ${iconSize}">  
      ${innerSvg}  
    </svg>  
  `;
    };

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleDownload = (fileType: "PNG" | "SVG") => {
        if (isFreeSubscription) {
            showUpgradePopup();
            return;
        }
        if (fileType === "SVG") {
            handleDownloadSvg();
        } else {
            handleDownloadPng();
        }
    };

    const handleDownloadSvg = () => {
        const svgString = generateSvg();
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "logo.svg";
        a.click();
        URL.revokeObjectURL(url);
    };

    const svgRef = useRef<HTMLSpanElement | null>(null);

    const handleDownloadPng = () => {
        if (svgRef.current) {
            html2canvas(svgRef.current, {
                backgroundColor: null,
                logging: false,
                scale: 3,
            }).then((canvas) => {
                const img = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.href = img;
                link.download = "logo.png";
                link.click();
            });
        }
    };

    const loadMoreIcons = () => {
        setVisibleIcons((prev) => prev + 200);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredIcons = fileData.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUndo = () => {
        setUndoStack((prev) => {
            if (prev.length === 0) return prev;
            const newUndo = [...prev];
            const lastState = newUndo.pop() as any;
            setRedoStack((r) => [lastState, ...r]);
            setIsUndoRedo(true);
            applyState(lastState);
            setIsUndoRedo(false);
            return newUndo;
        });
    };

    const handleRedo = () => {
        setRedoStack((prev) => {
            if (prev.length === 0) return prev;
            const [nextState, ...rest] = prev;
            setUndoStack((u) => [...u, nextState]);
            setIsUndoRedo(true);
            applyState(nextState);
            setIsUndoRedo(false);
            return rest;
        });
    };

    const [popup, setPopup] = useState(false);
    const showDeletePopUp = () => {
        setPopup(true);
    };

    const deleteLogo = async () => {
        if (!project) return;
        setLoading(true);
        updatedProject.current.logoUrl = null;
        project = await deleteProjectLogo(project.uuid);
        if (project) {
            formLogoCtx.setState({
                name: "choose",
            });
            dispatch(changeSelectedProject(project));
        }
        setLoading(false);
    };

    const handleSave = useCallback(async () => {
        setLoading(true);
        await saveProjectIcon(updatedProject.current, dispatch);
        // After successful save, mark current snapshot as saved
        lastSavedSnapshotRef.current = buildSnapshot();
        setUnsaved(false);
        setLoading(false);
    }, [dispatch, buildSnapshot]);

    // Keyboard shortcut: Cmd/Ctrl + S to save
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [handleSave]);

    return (
        <div className="h-full">
            <div className="flex flex-col lg:flex-row bg-white dark:bg-gray-900">
                {/* Sidebar Left */}
                <aside className="w-full xl:w-72 order-2 xl:order-1 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur">
                    <div className="p-4 sm:p-5">
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                                        Logo
                                    </h2>
                                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    <FiLayers /> Canvas
                  </span>
                                </div>
                                <div className="mt-3 space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                            <span>Size</span>
                                            <span>{size}px</span>
                                        </div>
                                        <Slider value={size} onChange={setSize} min={50} max={800} />
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                            <span>Rotation</span>
                                            <span>{rotation}°</span>
                                        </div>
                                        <Slider value={rotation} onChange={setRotation} min={-180} max={180} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                                    Background
                                </h2>
                                <div className="mt-3 space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                            <span>Rounded</span>
                                            <span>{rounded}px</span>
                                        </div>
                                        <Slider value={rounded} onChange={setRounded} min={0} max={12} step={0.1}/>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                            <span>Padding</span>
                                            <span>{padding}px</span>
                                        </div>
                                        <Slider value={padding} onChange={setPadding} min={0} max={20} step={0.1} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Canvas */}
                <main className="w-full order-1 xl:order-2 min-h-[calc(100vh-4rem)]">
                    <div
                        className="flex w-full h-full bg-repeat overflow-x-hidden"
                        style={{
                            backgroundImage: `url('data:image/svg+xml;base64,${btoa(svgBackGroundData)}')`,
                            backgroundSize: "auto",
                        }}
                    >
                        <div className="mx-auto w-full max-w-5xl px-4 py-6">
                            {/* Top toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="inline-flex items-center gap-2">
                                    <button
                                        title="Undo"
                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                                        onClick={handleUndo}
                                        disabled={undoStack.length === 0}
                                    >
                                        <FiRotateCcw />
                                        Undo
                                    </button>
                                    <button
                                        title="Redo"
                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                                        onClick={handleRedo}
                                        disabled={redoStack.length === 0}
                                    >
                                        <FiRotateCw />
                                        Redo
                                    </button>
                                </div>

                                <div className="inline-flex items-center gap-2">
                                    {/* Unsaved hint pill (visible when there are unsaved changes) */}
                                    {unsaved && (
                                        <div className="hidden sm:inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-900/40 dark:bg-amber-500/10 dark:text-amber-300">
                                            <span className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-300 animate-pulse" />
                                            You have unsaved changes
                                        </div>
                                    )}

                                    <div className="relative">
                                        <button
                                            title="Save logo changes"
                                            onClick={handleSave}
                                            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 active:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                                        >
                                            <FiSave />
                                            Save
                                        </button>
                                        {unsaved && (
                                            <span className="absolute -top-1 -right-1 inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-gray-900 animate-pulse" />
                                        )}
                                    </div>

                                    <div className="relative">
                                        <button
                                            title="Download logo"
                                            onClick={() => setDropdownOpen((s) => !s)}
                                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                                        >
                                            <FiDownload />
                                            Download
                                            <FiChevronDown />
                                        </button>

                                        {dropdownOpen && (
                                            <div className="absolute right-0 z-10 mt-2 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
                                                <button
                                                    onClick={() => {
                                                        handleDownload("PNG");
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="flex w-full items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                                                >
                                                    <FiImage />
                                                    PNG
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleDownload("SVG");
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="flex w-full items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                                                >
                          <span className="inline-flex items-center gap-2">
                            <FiLayers />
                            SVG
                          </span>

                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        title="Delete logo"
                                        onClick={showDeletePopUp}
                                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 active:bg-red-100 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-300"
                                    >
                                        <FiTrash2 />
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* Canvas */}
                            <div className="mt-8">
                                <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-4 shadow-sm ring-1 ring-black/0 transition hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900/60">
                                    <div className="flex items-center justify-between px-1 pb-3">
                                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                            Preview
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400"></div>
                                    </div>
                                    <div className="mx-auto grid place-items-center">
                                        <div
                                            className="relative overflow-hidden rounded-xl ring-1 ring-gray-200 dark:ring-gray-800 w-full max-w-[400px] aspect-square"
                                        >
                      <span ref={svgRef} className="block size-full">
                        {selectedSvgContent && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="100%"
                                height="100%"
                                viewBox={`0 0 ${iconSize} ${iconSize}`}
                                preserveAspectRatio="xMidYMid meet"
                            >
                                <rect
                                    x={(iconSize - (iconSize - padding)) / 2}
                                    y={(iconSize - (iconSize - padding)) / 2}
                                    width={iconSize - padding}
                                    height={iconSize - padding}
                                    fill={backgroundColor}
                                    rx={rounded}
                                />
                                <g transform={`translate(${iconSize / 2 - size / 2}, ${iconSize / 2 - size / 2})`}>
                                    <g transform={`rotate(${rotation}, ${size / 2}, ${size / 2})`}>
                                        <svg
                                            width={size}
                                            height={size}
                                            viewBox="0 0 24 24"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            stroke={strokeColor}
                                            fill={fillColor}
                                            strokeWidth={strokeWidth}
                                            style={{ fillOpacity: fillOpacity }}
                                        >
                                            <defs>
                                                <clipPath id="icon-round">
                                                    <rect
                                                        x={padding / 2}
                                                        y={padding / 2}
                                                        width={24 - padding}
                                                        height={24 - padding}
                                                        rx={rounded}
                                                    />
                                                </clipPath>
                                            </defs>
                                            <g clipPath="url(#icon-round)">
                                                {/* Inject your SVG content here */}
                                                <g dangerouslySetInnerHTML={{ __html: selectedSvgContent }} />
                                            </g>
                                        </svg>
                                    </g>
                                </g>
                            </svg>
                        )}
                      </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right floating panel (optional) */}
                    </div>
                </main>
            </div>

            {/* Icon selector modal */}
            {showIconSelector && (
                <div className="fixed inset-0 z-40">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowIconSelector(false)}
                    />
                    <div className="absolute inset-x-0 bottom-0 top-0 m-auto h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                <FiGrid />
                                <h3 className="text-base font-semibold">Choose an icon</h3>
                            </div>
                            <button
                                onClick={() => setShowIconSelector(false)}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <FiX />
                                Close
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="relative w-full">
                                    <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search icons..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text:white dark:placeholder:text-gray-500"
                                    />
                                </div>
                                <button
                                    onClick={() => setVisibleIcons(200)}
                                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Reset list
                                </button>
                            </div>

                            <div className="mt-4 h-[60vh] overflow-y-auto rounded-xl border border-gray-100 p-3 dark:border-gray-800">
                                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                                    {filteredIcons.slice(0, visibleIcons).map((file) => (
                                        <button
                                            key={file.name}
                                            onClick={() => {
                                                setSelectedSvgContent(file.content);
                                                setShowIconSelector(false);
                                            }}
                                            className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white p-2 text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                                            title={file.name}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                className="h-10 w-10"
                                                dangerouslySetInnerHTML={{ __html: file.content }}
                                            />
                                            <span className="pointer-events-none absolute inset-x-1 bottom-1 truncate rounded bg-white/80 px-1.5 text-[10px] text-gray-600 opacity-0 backdrop-blur transition group-hover:opacity-100 dark:bg-gray-900/70 dark:text-gray-300">
                        {file.name}
                      </span>
                                        </button>
                                    ))}
                                </div>
                                {filteredIcons.length > visibleIcons && (
                                    <div className="mt-4 flex justify-center">
                                        <button
                                            onClick={loadMoreIcons}
                                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                                        >
                                            Load more
                                        </button>
                                    </div>
                                )}
                                {filteredIcons.length === 0 && (
                                    <div className="flex h-40 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                                        No icons found
                                    </div>
                                )}
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

            {popup && (
                <div className="relative z-50">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
                                <div className="flex items-start justify-between border-b border-gray-200 p-4 dark:border-gray-800">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                        Delete logo
                                    </h3>
                                    <button
                                        onClick={() => setPopup(false)}
                                        className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                    >
                                        <FiX />
                                        <span className="sr-only">Close</span>
                                    </button>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                        Are you sure you want to delete the logo? You will need to create a
                                        new one from scratch.
                                    </p>
                                </div>
                                <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-800">
                                    <button
                                        onClick={() => setPopup(false)}
                                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPopup(false);
                                            deleteLogo();
                                        }}
                                        className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 active:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}