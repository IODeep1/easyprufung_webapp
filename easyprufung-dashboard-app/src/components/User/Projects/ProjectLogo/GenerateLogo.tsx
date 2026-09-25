import React, {useState, useMemo, useCallback, useRef, useContext, Dispatch} from "react";
import {
    Paintbrush,
    Wand2,
    Palette,
    Sparkle,
    Building2,
    Minimize,
    CircleCheck,
    Loader2,
    Sparkles,
} from "lucide-react";
import { generateLogoRequest } from "../../../../api/logo/api-helper.ts";
import {FormLogoContext, FormLogoValues} from "./context/logo-context.tsx";
import {IProjectState, IStateType} from "../../../../store/models/root.interface.ts";
import {useDispatch, useSelector} from "react-redux";
import {IProject} from "../../../../store/models/user/project/project.interface.ts";
import {saveProjectIcon} from "../../../../api/project/api-helper.ts";
import {IProjectIconConfiguration} from "../../../../store/models/user/project/projectIconConfiguration.interface.ts";
import Loading from "../../../Shared/Loading.tsx";
import {IUserAccount} from "../../../../store/models/user/userAccount.interface.ts";
import {useNavigate} from "react-router-dom";
import {requestGetUser} from "../../../../api/user/api-helper.ts";
import {updateUser} from "../../../../store/actions/user/userAccount.actions.ts";

const STYLE_OPTIONS = [
    {
        id: "corporate",
        name: "Corporate",
        icon: Building2,
        details:
            "Modern, forward-thinking, flat design, geometric shapes, clean lines, natural colors with subtle accents, use strategic negative space to create visual interest.",
    },
    {
        id: "creative",
        name: "Creative",
        icon: Palette,
        details:
            "Playful, lighthearted, bright bold colors, rounded shapes, lively.",
    },
    {
        id: "minimal",
        name: "Minimal",
        icon: Minimize,
        details:
            "Flashy, attention grabbing, bold, futuristic, and eye-catching. Use vibrant neon colors with metallic, shiny, and glossy accents.",
    },
    {
        id: "tech",
        name: "Technology",
        icon: Wand2,
        details:
            "Highly detailed, sharp focus, cinematic, photorealistic, Minimalist, clean, sleek, neutral color pallete with subtle accents, clean lines, shadows, and flat.",
    },
    {
        id: "abstract",
        name: "Abstract",
        icon: Paintbrush,
        details:
            "Abstract, artistic, creative, unique shapes, patterns, and textures to create a visually interesting and wild logo.",
    },
    {
        id: "flashy",
        name: "Flashy",
        icon: Sparkle,
        details:
            "Flashy, attention grabbing, bold, futuristic, and eye-catching. Use vibrant neon colors with metallic, shiny, and glossy accents.",
    },
];
const COLOR_OPTIONS = [
    { id: "#2563EB", name: "Blue" },
    { id: "#DC2626", name: "Red" },
    { id: "#D97706", name: "Orange" },
    { id: "#16A34A", name: "Green" },
    { id: "#9333EA", name: "Purple" },
    { id: "#000000", name: "Black" },
    { id: "#F59E0B", name: "Yellow" },
    { id: "#00B0FF", name: "Cyan" },
    { id: "#FF0097", name: "Magenta" },
    { id: "#FFFFFF", name: "White" },
    { id: "#F472B6", name: "Pink" },
    { id: "#9CA3AF", name: "Gray" },
    { id: "#6B4226", name: "Brown" },
    { id: "#14B8A6", name: "Teal" },
    { id: "#EF4444", name: "Light Red" },
    { id: "#10B981", name: "Light Green" },
    { id: "#3B82F6", name: "Light Blue" },
    { id: "#D4D4D8", name: "Light Gray" },
    { id: "#F97316", name: "Light Orange" },
];

const BACKGROUND_OPTIONS = [
    { id: "#FFFFFF", name: "White" },
    { id: "#F8FAFC", name: "Light Gray" },
    { id: "#FEE2E2", name: "Light Red" },
    { id: "#000000", name: "Black" },
    { id: "#FEF2F2", name: "Light Red 2" },
    { id: "#EFF6FF", name: "Light Blue" },
    { id: "#F0FFF4", name: "Light Green" },
    { id: "#F3F4F6", name: "Light Background" },
    { id: "#F3E8FF", name: "Lavender" },
    { id: "#E5E7EB", name: "Soft Gray" },
    { id: "#F1F5F9", name: "Pale Gray" },
    { id: "#F9FAFB", name: "Soft White" },
    { id: "#D1FAE5", name: "Mint Green" },
    { id: "#FEF3C7", name: "Light Yellow" },
    { id: "#FCE7F3", name: "Light Pink" },
    { id: "#E0F2FE", name: "Soft Cyan" },
    { id: "#D1D5DB", name: "Light Silver" },
    { id: "#D1E7DD", name: "Pale Green" },
    { id: "#E0E7FF", name: "Pale Blue" },
    { id: "#F9A8D4", name: "Light Rose" },
];

function getBackGroundColorByName(name) {
    const option = BACKGROUND_OPTIONS.find(option => option.name === name);
    return option ? option.id : null;  // return null if no match found
}

// Custom Dropdown for color select
function ColorDropdown({ label, options, value, onChange }) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef();
    // For click outside
    const handleBlur = (e) => {
        setTimeout(() => {
            if (!btnRef.current.contains(document.activeElement)) {
                setOpen(false);
            }
        }, 0);
    };
    const current = options.find((o) => o.name === value);
    return (
        <div className="relative" tabIndex={0} onBlur={handleBlur}>
            <label className="text-sm font-semibold ml-1">{label}</label>
            <button
                ref={btnRef}
                type="button"
                className="mt-2 h-11 px-3 w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-800 flex items-center gap-3 focus:ring-2 focus:ring-blue-500 transition"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
            >
        <span
            className="inline-block w-5 h-5 rounded-full border mr-2"
            style={{
                backgroundColor: current?.id,
                borderColor: "#e5e7eb",
            }}
        />
                <span>{current?.name}</span>
                <svg
                    className={`ml-auto w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <ul
                    className="z-30 absolute left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-h-60 overflow-auto"
                    role="listbox"
                >
                    {options.map((opt) => (
                        <li
                            key={opt.id}
                            role="option"
                            aria-selected={value === opt.name}
                            tabIndex={0}
                            onMouseDown={() => {
                                onChange(opt.name);
                                setOpen(false);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    onChange(opt.name);
                                    setOpen(false);
                                }
                            }}
                            className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition  
                ${
                                value === opt.name
                                    ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            }`}
                        >
              <span
                  className="inline-block w-5 h-5 rounded-full border"
                  style={{
                      backgroundColor: opt.id,
                      borderColor: "#e5e7eb",
                  }}
              />
                            <span>{opt.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function GenerateLogo() {
    const formLogoCtx = useContext(FormLogoContext);
    const navigate = useNavigate();
    const account: IUserAccount = useSelector((state: IStateType) => state.userAccount);
    const iteration = account.subscription? account.subscription.iteration : 0;
    const projectState: IProjectState = useSelector((state: IStateType) => state.projects);
    let project: IProject | null = projectState.selectedProject;
    const dispatch: Dispatch<any> = useDispatch();
    const [companyName, setCompanyName] = useState(project?.name);
    const [selectedStyle, setSelectedStyle] = useState("corporate");
    const [primaryColor, setPrimaryColor] = useState("Blue");
    const [backgroundColor, setBackgroundColor] = useState("White");
    const [additionalInfo, setAdditionalInfo] = useState(project?.shortDescription);
    const [loadingMessage, setLoadingMessage] = useState("Loading...");
    const [loadingView, setLoadingView] = useState(false);
    const [loading, setLoading] = useState(false);
    const [generatedLogo, setGeneratedLogo] = useState("");
    let svgConfiguration : IProjectIconConfiguration;

    const isFormValid = useMemo(() => {
        return companyName?.trim().length > 0;
    }, [companyName]);

    const handleGenerate = useCallback(async () => {
        if (!isFormValid) return;

        if (iteration == 0) {
            navigate("/settings/#credits");
            return;
        }
        const values: FormLogoValues = {
            name: companyName,
            primaryColor: primaryColor,
            backgroundColor: backgroundColor,
            style: selectedStyle,
            description: additionalInfo
        };
        setLoading(true);
        const data = await generateLogoRequest(values);
        const user = await requestGetUser(dispatch);
        if (user) {
            dispatch(updateUser(user));
        }
        setGeneratedLogo(data);
        setLoading(false);
    }, [
        isFormValid,
        companyName,
        selectedStyle,
        primaryColor,
        backgroundColor,
        additionalInfo,
    ]);

    const handleSelect = useCallback(async () => {
        if (!generatedLogo || !project) return;
        setLoadingMessage("Preparing Editor...")
        setLoadingView(true);
        const newIconConfiguration = {
            ...svgConfiguration,
            size: 300,
            rotation: 0,
            backgroundRounded: 4,
            backgroundPadding: 2,
            backgroundColor: "rgba(255, 255, 255, 0)",
            isGradientBackground: false,
        }
        project.svgIcon = generateSvg();
        project.iconConfiguration = JSON.stringify(newIconConfiguration);;
        await saveProjectIcon(project, dispatch);
        formLogoCtx.setState({
            name: "editor",
        });
        setLoadingView(false);
        setLoadingMessage("Loading...")
    }, [generatedLogo]);


    const generateSvg = () => {

        // Return the full SVG string with the appropriate sections
        return ` <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 400">
            <image
            x="0"
            y="0"
            width="100%"
            height="100%"
            href="${generatedLogo}"
            />
        </svg>
    `;
    };
    return (
        <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
            <main className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left - Form */}
                    <div>
                        <div className="backdrop-blur-lg bg-white/80 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-700 rounded-3xl shadow-lg">
                            <div className="p-7 space-y-6">
                                {/* Brand Name */}
                                <div>
                                    <label className="text-sm font-semibold ml-1">Business Name</label>
                                    <input
                                        value={companyName}
                                        onChange={e => setCompanyName(e.target.value)}
                                        placeholder="Enter your brand name"
                                        className="w-full h-12 mt-2 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                                    />
                                </div>
                                {/* Styles */}
                                <div>
                                    <label className="text-sm font-semibold ml-1 mb-1 block">Style</label>
                                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                                        {STYLE_OPTIONS.map(style => {
                                            const Icon = style.icon;
                                            const selected = selectedStyle === style.id;
                                            return (
                                                <button
                                                    key={style.id}
                                                    type="button"
                                                    onClick={() => setSelectedStyle(style.id)}
                                                    className={`flex flex-col items-center justify-center rounded-xl px-2 py-3 border group transition-all duration-150  
                            ${
                                                        selected
                                                            ? "border-blue-600 bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-400"
                                                            : "border-gray-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                    }`}
                                                    title={style.details}
                                                >
                                                    <Icon className={`w-6 h-6 mb-1 ${selected ? "text-blue-600" : "text-neutral-600 dark:text-neutral-300"} group-hover:scale-110 transition`} />
                                                    <span className={`text-[11px] font-semibold ${selected ? "text-blue-700 dark:text-blue-400" : "text-neutral-700 dark:text-neutral-200"}`}>
                            {style.name}
                          </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                {/* Color/model row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Primary */}
                                    <ColorDropdown
                                        label="Primary Color"
                                        options={COLOR_OPTIONS}
                                        value={primaryColor}
                                        onChange={setPrimaryColor}
                                    />
                                    {/* Background */}
                                    <ColorDropdown
                                        label="Background"
                                        options={BACKGROUND_OPTIONS}
                                        value={backgroundColor}
                                        onChange={setBackgroundColor}
                                    />
                                </div>
                                {/* Additional Info */}
                                <div>
                                    <label className="text-sm font-semibold ml-1">Additional Details</label>
                                    <textarea
                                        value={additionalInfo}
                                        onChange={e => setAdditionalInfo(e.target.value)}
                                        placeholder="Describe your brand personality, target audience, or any specific preferences..."
                                        className="w-full mt-2 px-4 py-3 h-28 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                </div>
                                {/* Generate Button */}
                                <div>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={!isFormValid || loading}
                                        className={
                                            `w-full h-12 text-lg font-semibold rounded-xl flex items-center justify-center gap-2 border rounded-lg  
                                                ${!isFormValid || loading
                                                ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400 dark:border-gray-700'
                                                : 'bg-black text-white border-black hover:bg-gray-800 active:bg-gray-900 dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-300 dark:active:bg-gray-400'
                                            }`
                                        }
                                    >
                                    <>
                                            {loading ? (
                                                <>
                                                    <Loader2 className="animate-spin w-5 h-5" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5" />
                                                    {generatedLogo ? "Generate New" :"Generate Logo"}
                                                </>
                                            )}
                                        </>

                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Right - Output */}
                    <div>
                        <div className="h-full bg-white/80 dark:bg-neutral-900/60 backdrop-blur-lg rounded-3xl shadow-lg border border-neutral-100 dark:border-neutral-800 flex flex-col">
                            <div className="p-7 flex-1 flex flex-col justify-center h-full">
                                {generatedLogo ? (
                                    <div className="space-y-7 animate-fade-in">
                                        <div
                                            className="aspect-square w-full rounded-2xl flex items-center justify-center border border-neutral-200 dark:border-neutral-700 shadow-inner"
                                        >
                                            <img
                                                src={generatedLogo}
                                                alt="Generated logo"
                                                className="w-2/3 h-2/3 object-contain mx-auto"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleSelect}
                                                className="flex-1 border bg-black text-white border border-black rounded-lg hover:bg-gray-800 active:bg-gray-900
                                   dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-300 dark:active:bg-gray-400 px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition font-semibold"
                                            >
                                                <CircleCheck className="w-5 h-5" />
                                                Select
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full rounded-2xl flex flex-col items-center justify-center border-2 border-blue-600/40 dark:border-blue-400/40 border-dashed text-center px-8 py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <Sparkle className="w-8 h-8 text-blue-600/90 mb-2 animate-pulse" />
                                            <h3 className="text-xl font-bold">
                                                Your Logo will be displayed here
                                            </h3>
                                            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                                                For optimal results, provide more details and let our AI craft a custom, professional logo tailored to your brand.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {loadingView && <Loading text={loadingMessage} /> }
        </div>
    );
}