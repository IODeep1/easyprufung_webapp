import React, {Dispatch, useContext, useEffect, useMemo, useState} from "react";
import { ILandingPage } from "../../../../store/models/user/project/landingPage.interface";
import { createProjectLandingPage } from "../../../../api/project/api-helper";
import { IProjectState, IStateType } from "../../../../store/models/root.interface";
import { useDispatch, useSelector } from "react-redux";
import { IProject } from "../../../../store/models/user/project/project.interface";
import { Preview } from "./Preview";
import Loading from "../../../Shared/Loading";
import { Card } from "../../../../common/components/Card";
import {changeProjectCurrentStep} from "../../../../store/actions/user/project.actions";
import LandingPagePreview from "./LandingPagePreview.tsx";
import {ProjectContext} from "../context/ProjectContext.tsx";
import {IUserAccount} from "../../../../store/models/user/userAccount.interface.ts";
import {useNavigate} from "react-router-dom";

const FEATURES = [
    {
        key: "navbar",
        label: "Navigation Bar",
        description: "Top site navigation for main links and branding.",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M14 9h1" />
                <path d="M19 9h2" />
                <path d="M3 9h2" />
                <path d="M9 9h1" />
            </svg>
        ),
    },
    {
        key: "hero",
        label: "Hero Section",
        description: "Eye-catching section with headline and main call-to-action.",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <rect x="4" y="16" width="16" height="4" rx="2" />
            </svg>
        ),
    },
    {
        key: "benefits",
        label: "Benefits",
        description: "Highlight the main advantages of your product.",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" />
            </svg>
        ),
    },
    {
        key: "features",
        label: "Features",
        description: "Showcase product features with descriptions.",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="m9 14 2 2 4-4" />
            </svg>
        ),
    },
    {
        key: "stats",
        label: "Stats & Charts",
        description: "Display key stats and visual data representations.",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect x="3" y="12" width="4" height="8" />
                <rect x="9" y="8" width="4" height="12" />
                <rect x="15" y="4" width="4" height="16" />
            </svg>
        ),
    },
    {
        key: "pricing",
        label: "Pricing",
        description: "Present pricing tiers and plans.",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                <path d="M12 18V6" />
            </svg>
        ),
    },
    {
        key: "testimonials",
        label: "Testimonials",
        description: "Social proof from real customers.",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <path d="M16 3.128a4 4 0 0 1 0 7.744" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <circle cx="9" cy="7" r="4" />
            </svg>
        ),
    },
    {
        key: "faq",
        label: "FAQ",
        description: "Answers to frequently asked questions.",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
            </svg>
        ),
    },
    {
        key: "waitlist",
        label: "Waitlist",
        description: "Allow users to join the waitlist for updates or early access.",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M8 12h8M12 8v8" />
            </svg>
        ),
    },
    {
        key: "contact",
        label: "Contact Form",
        description: "Allow visitors to reach out easily.",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M4 8l8 6l8-6" />
            </svg>
        ),
    },
    {
        key: "cta",
        label: "Call-to-Action (CTA)",
        description: "Prompt users to take the next step.",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
        ),
    },
    {
        key: "footer",
        label: "Footer",
        description: "Bottom section with links and copyright.",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M12 13V7" />
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                <path d="m9 10 3 3 3-3" />
            </svg>
        ),
    },
];

const items = [
    {
        id: 0,
        title: "AI-Powered Website from Scratch",
        template: "landing-page-empty",
        description: "Easily create a custom website with the help of advanced AI. Tailor it to your exact needs and stand out with a design that fits your vision perfectly.",
        previewUrl: "#",
        image: "#",
    },
    {
        id: 30,
        title: "MusicArtist",
        template: "landing-page-musicartist",
        description: "Artist and band page with latest release, tour dates, merch, and streaming links.",
        previewUrl: "https://musicartist.easyprufung.com",
        image: "https://musicartist.easyprufung.com/preview.png",
    },
    {
        id: 28,
        title: "FinanceConsult",
        template: "landing-page-financeconsult",
        description: "Fintech or advisory landing with services, calculators, compliance, and lead capture.",
        previewUrl: "https://financeconsult.easyprufung.com",
        image: "https://financeconsult.easyprufung.com/preview.png",
    },
    {
        id: 4,
        title: "AppLaunch",
        template: "landing-page-applaunch",
        description: "A focused template tailored for promoting mobile apps, featuring a clear call-to-action and smooth animations. Ideal for app developers and tech startups looking to drive downloads and engagement.",
        previewUrl: "https://applaunch.easyprufung.com",
        image: "https://applaunch.easyprufung.com/preview.png",
    },
    {
        id: 32,
        title: "ComingSoon",
        template: "landing-page-comingsoon",
        description: "Waitlist and pre-launch page with countdown, teaser, and email capture.",
        previewUrl: "https://comingsoon.easyprufung.com",
        image: "https://comingsoon.easyprufung.com/preview.png",
    },
    {
        id: 34,
        title: "CommunityHub",
        template: "landing-page-communityhub",
        description: "Community or forum hub with categories, events, Discord/Slack links, and guidelines.",
        previewUrl: "https://communityhub.easyprufung.com",
        image: "https://communityhub.easyprufung.com/preview.png",
    },
    {
        id: 21,
        title: "CryptoLaunch",
        template: "landing-page-cryptolaunch",
        description: "Web3 project page with tokenomics, roadmap, whitepaper links, and audit badges.",
        previewUrl: "https://cryptolaunch.easyprufung.com",
        image: "https://cryptolaunch.easyprufung.com/preview.png",
    },
    {
        id: 31,
        title: "DocsPress",
        template: "landing-page-docspress",
        description: "Product docs and knowledge base with search, categories, and versioning notes.",
        previewUrl: "https://docspress.easyprufung.com",
        image: "https://docspress.easyprufung.com/preview.png",
    },
    {
        id: 18,
        title: "PodcastWave",
        template: "landing-page-podcastwave",
        description: "Podcast landing with latest episodes, show notes, guest bios, and subscribe buttons.",
        previewUrl: "https://podcastwave.easyprufung.com",
        image: "https://podcastwave.easyprufung.com/preview.png",
    },
    {
        id: 8,
        title: "GameVerse",
        template: "landing-page-gameverse",
        description: "Cinematic landing for games and studios with trailers, screenshots, platforms, and community links.",
        previewUrl: "https://gameverse.easyprufung.com",
        image: "https://gameverse.easyprufung.com/preview.png",
    },
    {
        id: 2,
        title: "GradientWave",
        template: "landing-page-gradientwave",
        description: "A vibrant and modern template designed to engage users with dynamic visuals and interactive elements. Perfect for tech products, digital services, and community-driven initiatives.",
        previewUrl: "https://gradientwave.easyprufung.com",
        image: "https://gradientwave.easyprufung.com/preview.png",
    },
    {
        id: 11,
        title: "HealthClinic",
        template: "landing-page-healthclinic",
        description: "Clinic and telemedicine template with services, doctor profiles, insurance info, and booking.",
        previewUrl: "https://healthclinic.easyprufung.com",
        image: "https://healthclinic.easyprufung.com/preview.png",
    },
    {
        id: 30,
        title: "MusicArtist",
        template: "landing-page-musicartist",
        description: "Artist and band page with latest release, tour dates, merch, and streaming links.",
        previewUrl: "https://musicartist.easyprufung.com",
        image: "https://musicartist.easyprufung.com/preview.png",
    },
    {
        id: 16,
        title: "PortfolioSolo",
        template: "landing-page-portfoliosolo",
        description: "Minimal portfolio for designers and developers with projects, skills, and hire-me CTA.",
        previewUrl: "https://portfoliosolo.easyprufung.com",
        image: "https://portfoliosolo.easyprufung.com/preview.png",
    },
    {
        id: 1,
        title: "ProStart",
        template: "landing-page-prostart",
        description: "A comprehensive template offering a range of features and pricing options, designed to cater to professionals, startups, and businesses looking to establish a robust online presence.",
        previewUrl: "https://prostart.easyprufung.com",
        image: "https://prostart.easyprufung.com/preview.png",
    },
    {
        id: 12,
        title: "RealEstatePro",
        template: "landing-page-realestatepro",
        description: "Property listings with map highlights, agent bios, mortgage info, and lead capture.",
        previewUrl: "https://realestatepro.easyprufung.com",
        image: "https://realestatepro.easyprufung.com/preview.png",
    },
    {
        id: 13,
        title: "RestaurantGo",
        template: "landing-page-restaurantgo",
        description: "Restaurant and delivery page with menus, online ordering links, reservations, and reviews.",
        previewUrl: "https://restaurantgo.easyprufung.com",
        image: "https://restaurantgo.easyprufung.com/preview.png",
    },
    {
        id: 7,
        title: "SaaSFlow",
        template: "landing-page-saasflow",
        description: "High-converting SaaS landing with feature sections, integrations, pricing tables, and customer logos.",
        previewUrl: "https://saasflow.easyprufung.com",
        image: "https://saasflow.easyprufung.com/preview.png",
    },
    {
        id: 5,
        title: "SmartLaunch",
        template: "landing-page-smartlaunch",
        description: "A versatile template designed for easy and efficient creation of professional landing pages, suitable for startups, entrepreneurs, and digital marketers.",
        previewUrl: "https://smartlaunch.easyprufung.com",
        image: "https://smartlaunch.easyprufung.com/preview.png",
    },
    {
        id: 15,
        title: "AgencyPrime",
        template: "landing-page-agencyprime",
        description: "Digital agency showcase with services, case studies, process, and contact form.",
        previewUrl: "https://agencyprime.easyprufung.com",
        image: "https://agencyprime.easyprufung.com/preview.png",
    }
];

export default function LandingPage() {
    const dispatch: Dispatch<any> = useDispatch();
    const navigate = useNavigate();

    const projectState: IProjectState = useSelector((state: IStateType) => state.projects);
    let project: IProject | null = projectState.selectedProject;
    const account: IUserAccount = useSelector((state: IStateType) => state.userAccount);
    let isFreeSubscription = account.subscription?.plan === "free";

    // Upgrade modal state
    const [upgradePopup, setUpgradePopup] = useState(false);
    const showUpgradePopup = () => setUpgradePopup(true);

    const [search, setSearch] = useState("");
    const [onlyWithPreview, setOnlyWithPreview] = useState(false);

    const [generatingLandingPage, setGeneratingLandingPage] = useState(false);
    const { generatingHtml, setGeneratingHtml } = useContext(ProjectContext);
    const [loading, setLoading] = useState(false);
    const [showProgress, setShowProgress] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState("Loading...");

    const [popup, setPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");

    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");

    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [showFeaturePopup, setShowFeaturePopup] = useState(false);
    const [selectedFeatures, setSelectedFeatures] = useState(
        FEATURES.filter(f => f.key !== 'features' && f.key !== 'stats' && f.key !== 'pricing').map(f => f.key)
    );
    const handleFeatureToggle = (key: string) => {
        setSelectedFeatures((prev) => (prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]));
    };

    const selectAllFeatures = () => setSelectedFeatures(FEATURES.map((f) => f.key));
    const clearAllFeatures = () => setSelectedFeatures([]);

    const previewTemplate = (url: string) => {
        setShowPreview(true);
        setPreviewUrl(url);
    };

    const uniqueItems = useMemo(() => (
        Array.from(new Map(items.map(item => [item.template, item])).values())
    ), []);

// Filtering logic
    const filteredItems = useMemo(() => {
        const query = search.trim().toLowerCase();
        let list = uniqueItems.filter(
            (i) =>
                i.title.toLowerCase().includes(query) ||
                i.description.toLowerCase().includes(query) ||
                i.template.toLowerCase().includes(query)
        );
        return onlyWithPreview ? list.filter((i) => i.previewUrl && i.previewUrl !== "#") : list;
    }, [search, onlyWithPreview, uniqueItems]);

    useEffect(() => {
        setGeneratingHtml(false);
        const timer = setTimeout(() => {
            setGeneratingHtml(project?.isBuilding);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setGeneratingLandingPage(generatingHtml);
    }, [generatingHtml]);

    const selectTemplate = async (item: any) => {
        if (!item) return;
        if (project == null) return;

        if (isFreeSubscription) {
            showUpgradePopup();
            return;
        }

        if (!project.name || !project.logoUrl) {
            setPopupMessage("To achieve better results, it's important to choose both a name and a logo.");
            setPopup(true);
            return;
        }

        //setShowProgress(true);
        //setLoading(true);
        //setLoadingMessage("Generating your landing page...");
        setGeneratingHtml(true);
        setGeneratingLandingPage(true);
        const newLandingPage: ILandingPage = {
            templateName: item.template,
            features: selectedFeatures,
            projectUuid: project.uuid,
        } as any;

        project = await createProjectLandingPage(newLandingPage);
        setGeneratingHtml(false);
        setGeneratingLandingPage(false);
        if (project) {
            dispatch(changeProjectCurrentStep(project, projectState.currentStep));
        }
        setLoading(false);
    };

    return (
        <div>
            {(project?.isBuilding || generatingLandingPage)?  (
                <LandingPagePreview
                    projectUuid={project?.uuid}
                    token={localStorage.getItem('access-token')}
                />
                ):
            <Card>
                {project?.tempUrl ? (
                    <Preview currentUrl={project.tempUrl} setShowProgress={setShowProgress} />
                ) : (
                    <div className="mx-auto max-w-6xl p-6">
                        <div className="mb-6">
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Select a template</h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Pick a starting point. You can customize sections later.
                            </p>
                        </div>

                        <div className="mb-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
                                <svg
                                    className="h-5 w-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="m21 21-4.3-4.3" />
                                    <circle cx="11" cy="11" r="8" />
                                </svg>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search templates..."
                                    className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100 dark:placeholder:text-gray-500"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                                        title="Clear"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M18 6 6 18" />
                                            <path d="m6 6 12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800">
                                    <input
                                        type="checkbox"
                                        className="accent-blue-600"
                                        checked={onlyWithPreview}
                                        onChange={(e) => setOnlyWithPreview(e.target.checked)}
                                    />
                                    Only with preview
                                </label>
                                <span className="hidden text-xs text-gray-500 sm:inline dark:text-gray-400">
                  {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""}
                </span>
                            </div>
                        </div>

                        {filteredItems.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                                {filteredItems.map((item) => {
                                    const hasPreview = item.previewUrl && item.previewUrl !== "#";
                                    return (
                                        <div
                                            key={item.template}
                                            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                                        >
                                            <div className="relative flex h-56 items-center justify-center bg-gray-50 dark:bg-gray-800/60">
                                                {hasPreview ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        className="h-48 w-11/12 rounded-lg object-cover shadow-md transition duration-300"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-blue-200 p-6 shadow-lg dark:from-blue-900/30 dark:to-blue-800/20">
                                                        <div className="relative rounded-full bg-white p-4 shadow-md transition-all duration-300 dark:bg-gray-900">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg font-semibold text-gray-900 dark:text-white">AI</span>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="22"
                                                                    height="22"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                                                                    <path d="M20 3v4" />
                                                                    <path d="M22 5h-4" />
                                                                    <path d="M4 17v2" />
                                                                    <path d="M5 18H3" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gray-900/0 transition group-hover:bg-gray-900/50" />

                                                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition group-hover:opacity-100">
                                                    <button
                                                        onClick={() => {
                                                            setShowFeaturePopup(true);
                                                            setSelectedTemplate(item);
                                                        }}
                                                        className="pointer-events-auto rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 shadow hover:bg-white dark:bg-gray-800/90 dark:text-gray-100"
                                                    >
                                                        Select
                                                    </button>

                                                    {hasPreview && (
                                                        <button
                                                            onClick={() => previewTemplate(item.previewUrl)}
                                                            className="pointer-events-auto rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 shadow hover:bg-white dark:bg-gray-800/90 dark:text-gray-100"
                                                        >
                                                            Preview
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-5">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                                                        {item.title}
                                                    </h3>
                                                    {!hasPreview && (
                                                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30">
                                                      AI
                                                    </span>
                                                    )}
                                                </div>
                                                <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                                                    {item.description}
                                                </p>
                                                <div className="mt-4 flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setShowFeaturePopup(true);
                                                            setSelectedTemplate(item);
                                                        }}
                                                        className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 active:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                                                    >
                                                        Select
                                                    </button>
                                                    {hasPreview && (
                                                        <button
                                                            onClick={() => previewTemplate(item.previewUrl)}
                                                            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                                                        >
                                                            Preview
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-10 text-center">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No templates found</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try a different search.</p>
                            </div>
                        )}
                    </div>
                )}

                {showFeaturePopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-colors">
                        <div
                            className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900 sm:p-8"
                            role="dialog"
                            aria-modal="true"
                            tabIndex={-1}
                        >
                            <button
                                className="absolute right-3 top-3 rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-800"
                                onClick={() => setShowFeaturePopup(false)}
                                aria-label="Close popup"
                                tabIndex={0}
                            >
                                <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                Choose Features to Include
                            </h2>
                            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                                Selected {selectedFeatures.length} of {FEATURES.length}
                            </p>

                            <div className="mb-3 flex gap-2">
                                <button
                                    onClick={selectAllFeatures}
                                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Select all
                                </button>
                                <button
                                    onClick={clearAllFeatures}
                                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Clear
                                </button>
                            </div>

                            <div className="custom-scrollbar max-h-72 space-y-2 overflow-y-auto pr-1">
                                {FEATURES.map((feature) => (
                                    <label
                                        key={feature.key}
                                        className={`group flex cursor-pointer items-start gap-3 rounded-xl px-3 py-3 transition-colors ${
                                            selectedFeatures.includes(feature.key)
                                                ? "border border-blue-600/20 bg-blue-50 dark:bg-blue-900/30"
                                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="mt-1 h-5 w-5 rounded-md border-gray-300 accent-blue-600 transition focus:ring-2 focus:ring-blue-500 dark:border-gray-600"
                                            checked={selectedFeatures.includes(feature.key)}
                                            onChange={() => handleFeatureToggle(feature.key)}
                                            aria-label={`Select ${feature.label}`}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-700 dark:text-blue-400">{feature.icon}</span>
                                                <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                          {feature.label}
                        </span>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{feature.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    className="rounded-lg border border-gray-400 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                    onClick={() => setShowFeaturePopup(false)}
                                    disabled={loading}
                                    tabIndex={0}
                                    type="button"
                                >
                                    Cancel
                                </button>
                                <button
                                    className={`rounded-lg border px-5 py-2 text-sm transition ${
                                        selectedTemplate
                                            ? "border-black bg-black text-white hover:bg-gray-800 active:bg-gray-900 dark:border-white dark:bg-white dark:text-black dark:hover:bg-gray-300"
                                            : "cursor-not-allowed border-gray-300 bg-gray-200 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                                    }`}
                                    onClick={() => {
                                        if (!selectedTemplate) return;
                                        selectTemplate(selectedTemplate);
                                        setShowFeaturePopup(false);
                                    }}
                                    tabIndex={0}
                                    type="button"
                                    disabled={!selectedTemplate}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>

                        <style jsx>{`
              .custom-scrollbar {
                scrollbar-color: #3b82f6 #e5e7eb;
                scrollbar-width: thin;
              }
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #3b82f6;
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #e5e7eb;
              }
              @media (prefers-color-scheme: dark) {
                .custom-scrollbar {
                  scrollbar-color: #3b82f6 #1e293b;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #3b82f6;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: #1e293b;
                }
              }
            `}</style>
                    </div>
                )}

                {loading && <Loading text={loadingMessage} showProgressBar={showProgress} />}
            </Card>
            }
            {showPreview && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3"
                    onClick={() => setShowPreview(false)}
                >
                    <div
                        className="relative flex h-[85vh] w-full max-w-7xl flex-col gap-2 overflow-hidden rounded-2xl bg-white p-4 text-left shadow-xl transition-all dark:bg-black sm:p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex flex-1 items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-800 dark:text-white">
                                <input
                                    disabled
                                    title="URL"
                                    className="w-full bg-transparent outline-none"
                                    type="text"
                                    value={previewUrl}
                                />
                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-md px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700"
                                >
                                    Open
                                </a>
                            </div>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="ml-3 rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                title="Close"
                            >
                                <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </button>
                        </div>

                        <section className="flex h-full justify-start overflow-y-auto">
                            <Card className="h-full w-full pb-12">
                                <iframe
                                    title="preview"
                                    className="mt-2 h-full w-full rounded-xl bg-white"
                                    src={previewUrl}
                                    sandbox="allow-scripts allow-forms allow-popups allow-modals allow-storage-access-by-user-activation allow-same-origin"
                                    allow="cross-origin-isolated"
                                />
                            </Card>
                        </section>
                    </div>
                </div>
            )}

            {popup && (
                <div className="relative z-50">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-6">
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
                                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{popupMessage}</p>
                                </div>
                                <div className="flex justify-end border-t border-gray-200 p-3 dark:border-gray-800">
                                    <button
                                        type="button"
                                        onClick={() => setPopup(false)}
                                        className="rounded-lg border border-black bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 active:bg-gray-900 dark:border-white dark:bg-white dark:text-black dark:hover:bg-gray-300 dark:active:bg-gray-400"
                                    >
                                        Ok
                                    </button>
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
        </div>
    );
}