import React, { Dispatch, useEffect, useRef, useState } from "react";
import {
    getProjectDomainCheck,
    getProjectName,
    getProjectSocialCheck,
    saveProjectName,
} from "../../../../api/project/api-helper";
import { useParams } from "react-router-dom";
import { Card } from "../../../../common/components/Card";
import {
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaGithub,
    FaTwitterSquare,
} from "react-icons/fa";
import { SiYoutube, SiTiktok } from "react-icons/si";
import {
    FiCheck,
    FiX,
    FiRefreshCcw,
    FiCopy,
    FiPlus,
    FiSearch,
} from "react-icons/fi";
import Loading from "../../../Shared/Loading";
import { IProject } from "../../../../store/models/user/project/project.interface";
import { changeProjectCurrentStep } from "../../../../store/actions/user/project.actions";
import { useDispatch } from "react-redux";

type DomainAvailability = {
    name: string;
    status: boolean; // false => Available, true => Registered (Taken)
};

type SocialAvailability = {
    platform: keyof typeof platformIcons;
    status: boolean; // false => Available, true => Taken
};

const platformIcons = {
    Facebook: <FaFacebook />,
    TwitterX: <FaTwitterSquare />,
    Instagram: <FaInstagram />,
    LinkedIn: <FaLinkedin />,
    Github: <FaGithub />,
    YouTube: <SiYoutube />,
    TikTok: <SiTiktok />,
};

const platformRing: Record<string, string> = {
    Facebook: "ring-blue-500/30 text-blue-600 dark:text-blue-400",
    TwitterX: "ring-sky-500/30 text-sky-600 dark:text-sky-400",
    Instagram: "ring-pink-500/30 text-pink-600 dark:text-pink-400",
    LinkedIn: "ring-blue-700/30 text-blue-700 dark:text-blue-500",
    Github: "ring-gray-500/30 text-gray-700 dark:text-gray-300",
    YouTube: "ring-red-500/30 text-red-600 dark:text-red-400",
    TikTok: "ring-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400",
};

export function StatusBadge({ available }) {
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                available
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30"
                    : "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30"
            }`}
        >
      {available ? (
          <FiCheck className="h-3.5 w-3.5" />
      ) : (
          <FiX className="h-3.5 w-3.5" />
      )}
            {available ? "Available" : "Taken"}
    </span>
    );
}

function SplitDomain({ domain }: { domain: string }) {
    const parts = domain.split(".");
    const tld = parts.pop();
    const base = parts.join(".");
    return (
        <span className="text-gray-900 dark:text-gray-100">
{base}
            <span className="font-semibold text-gray-900 dark:text-white">.{tld}</span>
</span>
    );
}

export default function ProjectName({ projectState }: { projectState: any }) {
    const dispatch: Dispatch<any> = useDispatch();
    let project: IProject = projectState.selectedProject;

    const [selectedName, setSelectedName] = useState<string>("");
    const [businessNames, setBusinessNames] = useState<string[]>([]);
    const [newBusinessName, setNewBusinessName] = useState<string>("");

    const [domains, setDomains] = useState<DomainAvailability[]>([]);
    const [socials, setSocials] = useState<SocialAvailability[]>([]);

    const { id } = useParams();
    const [checkingDomains, setCheckingDomains] = useState(false);
    const [checkingSocialMedia, setCheckingSocialMedia] = useState(false);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (id) {
            const processApi = async () => {
                let projectName = "";
                setLoading(true);
                project = await getProjectName(id);
                if (project != null) {
                    if (project.name) {
                        if (!project.nameData.includes(project.name)) {
                            project.nameData.unshift(project.name);
                        }
                        projectName = project.name;
                    } else projectName = project.nameData[0];

                    setBusinessNames(project.nameData);
                    setSelectedName(projectName);
                    await checkAvailabilities(projectName);
                    dispatch(changeProjectCurrentStep(project, "project_name"));
                }
                setLoading(false);
            };
            processApi();
        }
    }, [projectState?.selectedProject?.updatedDate]);


    useEffect(() => {
        if(project && project.name && selectedName && selectedName !==  project.name){
            project.name = selectedName;
            saveProjectName(project, null);
        }
    }, [selectedName]);


    const checkAvailabilities = async (name: string) => {
        if (!name) return;
        setCheckingDomains(true);
        setCheckingSocialMedia(true);
        setSelectedName(name);
        const domainList = await getProjectDomainCheck(name);
        if (domainList) setDomains(domainList);
        setCheckingDomains(false);

        const socialList = await getProjectSocialCheck(name);
        if (socialList) setSocials(socialList);
        setCheckingSocialMedia(false);
    };

    const selectName = (name: string) => {
        checkAvailabilities(name);
    };

    const addBusinessName = async () => {
        const candidate = newBusinessName.trim();
        if (candidate !== "" && !businessNames.includes(candidate)) {
            setBusinessNames((prev) => [...prev, candidate]);
        }
        setNewBusinessName("");
        await checkAvailabilities(candidate);
    };


    const openRegistrar = (domain: string) => {
        const url = `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <Card>
                <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white/60 backdrop-blur dark:border-gray-800 dark:bg-black/40">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-cyan-500/10" />
                    <div className="relative p-6 sm:p-8">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="mt-3 truncate bg-gradient-to-r from-gray-900 via-indigo-700 to-gray-900 bg-clip-text text-3xl font-semibold text-transparent dark:from-white dark:via-indigo-300 dark:to-white">
                                    {selectedName || "—"}
                                </p>
                            </div>

                        </div>

                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Select a Business Name
                            </h2>

                            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                                {businessNames.map((name) => {
                                    const isActive = selectedName === name;
                                    return (
                                        <button
                                            key={name}
                                            aria-pressed={isActive}
                                            onClick={() => selectName(name)}
                                            className={`group flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                                isActive
                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200 dark:border-emerald-900/40 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-700/40"
                                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                                            }`}
                                        >
                                            <span className="truncate">{name}</span>
                                            {isActive ? (
                                                <FiCheck className="h-4 w-4 shrink-0" />
                                            ) : (
                                                <span className="h-2 w-2 shrink-0 rounded-full bg-gray-300 group-hover:bg-gray-400 dark:bg-gray-600" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Add another name..."
                                        value={newBusinessName}
                                        onChange={(e) => setNewBusinessName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addBusinessName();
                                            }
                                        }}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
                                    />
                                    <FiPlus className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                                <button
                                    onClick={addBusinessName}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 active:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                                >
                                    <FiPlus className="h-4 w-4" />
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Domain Availability
                    </h2>
                    <button
                        onClick={() => checkAvailabilities(selectedName)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-60 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                        disabled={checkingDomains}
                    >
                        <FiRefreshCcw
                            className={`h-4 w-4 ${checkingDomains ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </button>
                </div>

                {!checkingDomains ? (
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {domains.map((domain) => {
                            const available = !domain.status;
                            return (
                                <div
                                    key={domain.name}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white/70 p-4 shadow-sm ring-1 ring-black/0 transition hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/60 dark:hover:border-gray-700"
                                >
                                    <div className="min-w-0">
                                        <SplitDomain domain={domain.name} />
                                        <div className="mt-1">
                                            <StatusBadge available={available} />
                                        </div>
                                    </div>

                                    <div className="ml-3 flex items-center gap-2">
                                        <button
                                            onClick={() => openRegistrar(domain.name)}
                                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ring-1 transition ${
                                                available
                                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30 dark:hover:bg-emerald-500/20"
                                                    : "bg-gray-50 text-gray-600 ring-gray-200 hover:bg-gray-100 dark:bg-gray-800/60 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-800"
                                            }`}
                                        >
                                            <FiSearch className="h-4 w-4" />
                                            {available ? "Find" : "Whois"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse rounded-lg border border-gray-200 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-900/60"
                            >
                                <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                                <div className="mt-3 h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Card>
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Social Media Availability
                    </h2>
                    <button
                        onClick={() => checkAvailabilities(selectedName)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-60 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                        disabled={checkingSocialMedia}
                    >
                        <FiRefreshCcw
                            className={`h-4 w-4 ${checkingSocialMedia ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </button>
                </div>

                {!checkingSocialMedia ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {socials.map((social) => {
                            const available = !social.status;
                            const ring = platformRing[social.platform] || "ring-gray-300";
                            return (
                                <div
                                    key={social.platform}
                                    className="group flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white/70 p-3 shadow-sm transition hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/60 dark:hover:border-gray-700"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                        >
                                            <span className="text-lg">{platformIcons[social.platform]}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {social.platform}
                                            </p>
                                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                                {selectedName}
                                            </p>
                                        </div>
                                    </div>
                                    <StatusBadge available={available} />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse rounded-lg border border-gray-200 bg-white/70 p-3 dark:border-gray-800 dark:bg-gray-900/60"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                                        <div className="mt-2 h-2.5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                                    </div>
                                </div>
                                <div className="mt-3 h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {loading && <Loading />}
        </div>
    );
}