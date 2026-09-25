import React, { useEffect, useState } from "react";
import { IUserAccount } from "../../../store/models/user/userAccount.interface";
import { useSelector } from "react-redux";
import { IStateType } from "../../../store/models/root.interface";
import { useNavigate } from "react-router-dom";

interface IconProps {
    className?: string;
}

const CoinIcon: React.FC<IconProps> = ({ className = "h-4 w-4" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
    </svg>
);

const GearIcon: React.FC<IconProps> = ({ className = "h-4 w-4" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15.4a1.65 1.65 0 0 0-1.51-1H3.4a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.6 4.6 1.65 1.65 0 0 0 10.11 3.6H10.2a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V10.2a1.65 1.65 0 0 0 1.51 1h.09a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
);

const PlusIcon: React.FC<IconProps> = ({ className = "h-4 w-4" }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
    </svg>
);

const ArrowUpRight: React.FC<IconProps> = ({ className = "h-4 w-4" }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M7 17 17 7" />
        <path d="M7 7h10v10" />
    </svg>
);

interface HeaderProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    setTheme?: (theme: string) => void;
}

const Header: React.FC<HeaderProps> = ({
                                           sidebarOpen,
                                           setSidebarOpen,
                                           setTheme,
                                       }) => {
    const navigate = useNavigate();
    const account: IUserAccount = useSelector(
        (state: IStateType) => state.userAccount
    );

    // Plans: free, starter, autopilot
    const currentPlan = account.subscription?.plan?.toLowerCase?.() || "free";
    const isAutopilotSubscription = currentPlan === "autopilot";
    const isStarterSubscription = currentPlan === "starter";
    const isPaidSubscription = isAutopilotSubscription || isStarterSubscription;
    const planLabel = isAutopilotSubscription
        ? "AutoPilot"
        : isStarterSubscription
            ? "Starter"
            : "Free";

    // Derive credits with safe fallbacks
    const [availableCredits, setAvailableCredits] = useState(
        account.subscription?.iteration
    );

    const showUpgradeBtn = !isPaidSubscription; // only Free shows upgrade
    const showAddCreditsBtn =
        isPaidSubscription && Number(availableCredits) === 0;

    useEffect(() => {
        setAvailableCredits(account.subscription?.iteration);
    }, [account.subscription?.iteration]);

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 flex w-full border-b border-black/10 dark:border-white/10">
            {/* Left: Sidebar toggle + Brand */}
            <div
                className="cursor-pointer flex items-center"
                onClick={(e) => {
                    e.stopPropagation();
                    setSidebarOpen(!sidebarOpen);
                }}
            >
                <div className="m-4 flex items-center justify-center text-2xl font-semibold text-gray-900 dark:text-white">
                    {/* Sidebar open/close icon */}
                    <div className="mr-2">
                        {sidebarOpen ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect width="18" height="18" x="3" y="3" rx="2" />
                                <path d="M9 3v18" />
                                <path d="M15 8h2" />
                                <path d="M15 12h2" />
                                <path d="M15 16h2" />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect width="18" height="18" x="3" y="3" rx="2" />
                                <path d="M9 3v18" />
                            </svg>
                        )}
                    </div>
                    <span className="text-black dark:text-white">EasyPrufung</span>
                </div>
            </div>
            {/* Right: Plan + Credits + CTAs + Settings */}
            { !showUpgradeBtn && <div className="ml-auto mr-4 flex items-center gap-3">
                {/* Plan badge */}
                <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset  
          ${
                        isPaidSubscription
                            ? "bg-green-100 text-green-700 ring-green-200 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-900/40"
                            : "bg-neutral-100 text-neutral-700 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-800"
                    }`}
                    title="Current plan"
                >
          {planLabel}
        </span>
                {/* Credits chip (shown for all; Starter matches AutoPilot behavior) */}
                <span
                    className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800"
                    title="Available credits"
                >
          <CoinIcon className="h-3.5 w-3.5" />
                    {availableCredits} credits
        </span>
                {/* Upgrade button (Free -> Pricing) */}
                {showUpgradeBtn && (
                    <button
                        type="button"
                        onClick={() => navigate("/pricing")}
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition
          border border-black text-black hover:bg-black/5 active:bg-black/10
          dark:border-white dark:text-white dark:hover:bg-white/10 dark:active:bg-white/20"
                        title="Upgrade plan"
                    >
                        Upgrade
                        <ArrowUpRight />
                    </button>
                )}
                {/* Add credits button (Paid with 0 credits -> Settings credits section) */}
                {showAddCreditsBtn && (
                    <button
                        type="button"
                        onClick={() => navigate("/settings/#credits")}
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-1 text-xs font-semibold transition
          border border-black bg-black text-white hover:bg-black/90 active:bg-black
          dark:border-white dark:bg-white dark:text-black dark:hover:bg-white/90"
                        title="Buy credit packs"
                    >
                        Add credits
                        <PlusIcon />
                    </button>
                )}
                {/* Settings icon -> Settings */}
                <button
                    type="button"
                    onClick={() => navigate("/settings")}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-black/5
        dark:text-gray-300 dark:hover:bg-white/10"
                    title="Settings"
                >
                    <GearIcon className="h-5 w-5" />
                </button>
            </div>
            }
        </header>
    );
};

export default Header;  