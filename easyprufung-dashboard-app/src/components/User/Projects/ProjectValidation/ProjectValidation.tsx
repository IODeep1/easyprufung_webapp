import React, { Dispatch, useEffect, useMemo, useState } from "react";
import {
    getProjectValidation,
    saveProjectDescription,
} from "../../../../api/project/api-helper";
import { useParams } from "react-router-dom";
import { Card } from "../../../../common/components/Card";
import Loading from "../../../Shared/Loading";
import {
    changeProjectCurrentStep,
} from "../../../../store/actions/user/project.actions";
import { useDispatch } from "react-redux";
import { IProject } from "../../../../store/models/user/project/project.interface";

type ScoreEntry = {
    value: number;
    feedback: string;
};
type Analysis = {
    description: {
        shortDescription: string;
        longDescription: string;
    };
    scores: Record<string, ScoreEntry>;
    competitorAnalysis: {
        name: string;
        url: string;
        overview: string;
        strengths: string;
        weaknesses: string;
    }[];
};

function classNames(...classes: (string | false | null | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

function getScoreColor(percentage: number) {
    if (percentage >= 75) return { base: "emerald", text: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", ring: "ring-emerald-500/30" };
    if (percentage >= 60) return { base: "amber", text: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", ring: "ring-amber-500/30" };
    return { base: "rose", text: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10", ring: "ring-rose-500/30" };
}

function toTitleCaseFromKey(key: string) {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^./, (s) => s.toUpperCase());
}

function CircularProgress({ percentage, size = 100 }: { percentage: number; size?: number }) {
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (circumference * Math.min(Math.max(percentage, 0), 100)) / 100;
    const { base } = getScoreColor(percentage);

// Tailwind cannot detect template-generated classes like `stroke-${base}-500`.
// Use a static map so classes are present at build time.
    const strokeMap: Record<string, string> = {
        emerald: "stroke-emerald-500",
        amber: "stroke-amber-500",
        rose: "stroke-rose-500",
    };

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-sm">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <circle
                    className="text-gray-200 dark:text-gray-700 stroke-current"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                />
                <circle
                    className={classNames(strokeMap[base])}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    style={{ transition: "stroke-dashoffset 800ms ease" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">{percentage}%</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Score</span>
            </div>
        </div>
    );
}

function GaugeCard({
                       label,
                       value,
                       feedback,
                   }: {
    label: string;
    value: number;
    feedback: string;
}) {
    const color = getScoreColor(value);

// Same reason as above: map gradient classes so Tailwind keeps them
    const gradientMap: Record<string, string> = {
        emerald: "from-emerald-500 to-emerald-400",
        amber: "from-amber-500 to-amber-400",
        rose: "from-rose-500 to-rose-400",
    };

    return (
        <div
            className={classNames(
                "group relative overflow-hidden rounded-2xl border bg-white/60 dark:bg-white/[0.03] backdrop-blur",
                "border-gray-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            )}
        >
            <div className="absolute inset-0 pointer-events-none">
                <div className={classNames("absolute -top-16 -right-16 w-40 h-40 rounded-full blur-2xl opacity-40", color.bg)} />
            </div>

            <div className="p-5">
                <div className="flex items-center gap-4">
                    <div className={classNames("rounded-xl p-2.5 ring-1", color.bg, color.ring)}>
                        <div className="scale-90">
                            <CircularProgress percentage={value} size={84} />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Validation Metric</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                    </div>
                </div>

                <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                    {feedback}
                </div>
            </div>
        </div>
    );
}

function TextSkeleton({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, idx) => (
                <div key={idx} className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-white/10" />
            ))}
        </div>
    );
}

function GaugeSkeleton() {
    return (
        <div className="rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-5">
            <div className="flex items-center gap-4">
                <div className="w-[84px] h-[84px] rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse" />
                <div className="flex-1">
                    <div className="h-3 w-28 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    <div className="mt-2 h-4 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                </div>
            </div>
            <div className="mt-4">
                <div className="h-2 w-full rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
            </div>
        </div>
    );
}

function Chip({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "emerald" | "rose" | "amber" | "indigo" }) {
    const tones: Record<string, string> = {
        slate: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
        emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
        rose: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
        amber: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
        indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
    };
    return (
        <span className={classNames("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", tones[tone])}>
{children}
</span>
    );
}

export default function ProjectValidation({ projectState }: { projectState: { selectedProject: IProject } }) {
    let project: IProject = projectState.selectedProject;
    const { id } = useParams();
    const dispatch: Dispatch<any> = useDispatch();
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [expandedDesc, setExpandedDesc] = useState<boolean>(false);

    useEffect(() => {
        if (id) {
            const processApi = async () => {
                setLoading(true);
                try {
                    const resProject = await getProjectValidation(id);
                    if (resProject != null && resProject.validationData && resProject.validationData.description) {
                        const nextAnalysis: Analysis = resProject.validationData;
                        setAnalysis(nextAnalysis);

                        if (resProject.description !== nextAnalysis.description.longDescription) {
                            resProject.description = nextAnalysis.description.longDescription;
                            saveProjectDescription(resProject);
                        }

                        dispatch(changeProjectCurrentStep(resProject, "project_validation"));
                    }
                } catch (e) {
                    // Optionally handle or log error
                    // console.error(e);
                } finally {
                    setLoading(false);
                }
            };
            processApi();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectState?.selectedProject?.updatedDate, id]);

    const scores = useMemo(() => {
        const raw = (analysis?.scores ?? {}) as Record<string, ScoreEntry>;
        return Object.entries(raw).map(([key, val]) => ({ key, label: toTitleCaseFromKey(key), ...val }));
    }, [analysis]);

    const strengthsList = (text: string) =>
        text.split(/[,•|-]/).map((s) => s.trim()).filter(Boolean).slice(0, 6);

    return (
        <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
            {/* Page header card */}
            <Card>
                <div className="relative overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-cyan-500/10" />
                    <div className="relative p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Project Validation
                                </h1>
                                <p className="mt-1 text-gray-600 dark:text-gray-300">
                                    Data-driven insights, competitor landscape, and quality scores.
                                </p>
                            </div>
                            {analysis && (
                                <div className="flex items-center gap-2">
                                    <Chip tone="indigo">Analysis Ready</Chip>
                                    <Chip tone="emerald">
                                        {Object.keys(analysis?.scores ?? {}).length} Metrics
                                    </Chip>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Description */}
            <Card>
                <div className="space-y-4">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                        Description
                    </h2>

                    {!analysis && loading && (
                        <div className="rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] p-5">
                            <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                            <div className="mt-3">
                                <TextSkeleton lines={2} />
                            </div>
                            <div className="mt-3">
                                <TextSkeleton lines={4} />
                            </div>
                        </div>
                    )}

                    {analysis && (
                        <div className="rounded-xl border border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-5">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-start gap-2">
                                <span className="mt-0.5 text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                                    Short
                                </span>
                                    <p className="text-gray-800 dark:text-gray-200">{analysis.description.shortDescription}</p>
                                </div>

                                <div className="flex items-start gap-2">
                                <span className="mt-0.5 text-xs font-semibold px-2 py-1 rounded bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300">
                                    Long
                                </span>
                                    <div className="text-gray-800 dark:text-gray-200">
                                        <p className={classNames(!expandedDesc && "line-clamp-4")}>
                                            {analysis.description.longDescription}
                                        </p>
                                        <button
                                            onClick={() => setExpandedDesc((v) => !v)}
                                            className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                            {expandedDesc ? "Show less" : "Show more"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Scores */}
            <Card>
                <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                        Analysis Results
                    </h2>

                    <div className="mt-4 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Validation</h3>
                        </div>

                        {/* Skeleton while loading */}
                        {!analysis && loading && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <GaugeSkeleton key={i} />
                                ))}
                            </div>
                        )}

                        {analysis && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                                {scores.map(({ key, label, value, feedback }) => (
                                    <GaugeCard key={key} label={label} value={value} feedback={feedback} />
                                ))}
                            </div>
                        )}

                        {/* Competitor Analysis */}
                        <h3 className="mt-10 text-lg font-semibold text-gray-900 dark:text-white">Competitor Analysis</h3>

                        {!analysis && loading && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <div key={i} className="rounded-xl border border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
                                            <div className="flex-1">
                                                <div className="h-4 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                                                <div className="mt-2 h-3 w-28 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <TextSkeleton lines={3} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {analysis && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                {analysis?.competitorAnalysis?.map((competitor, index) => (
                                    <div
                                        key={index}
                                        className="relative rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-5 hover:shadow-md transition-all hover:-translate-y-0.5"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/10 overflow-hidden ring-1 ring-gray-200/60 dark:ring-white/10">
                                                <img
                                                    src={`https://www.google.com/s2/favicons?sz=64&domain=${competitor.url}`}
                                                    alt={`${competitor.name} favicon`}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                                    {competitor.name}
                                                </h4>
                                                <a
                                                    href={competitor.url}
                                                    target="_blank"
                                                    rel="noreferrer noopener"
                                                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 break-all"
                                                    title={competitor.url}
                                                >
                                                    {competitor.url}
                                                </a>
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-3 text-sm">
                                            <div>
                                            <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                                                Overview
                                            </span>
                                                <p className="text-gray-700 dark:text-gray-300">{competitor.overview}</p>
                                            </div>

                                            <div>
                                            <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                                                Strengths
                                            </span>
                                                <div className="flex flex-wrap gap-2">
                                                    {strengthsList(competitor.strengths).map((s, i) => (
                                                        <Chip key={i} tone="emerald">{s}</Chip>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                            <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                                                Weaknesses
                                            </span>
                                                <div className="flex flex-wrap gap-2">
                                                    {strengthsList(competitor.weaknesses).map((w, i) => (
                                                        <Chip key={i} tone="rose">{w}</Chip>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {loading && <Loading />}
        </div>
    );
}