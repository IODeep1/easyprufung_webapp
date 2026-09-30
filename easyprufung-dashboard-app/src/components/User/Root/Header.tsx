import React from "react";
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
                                       }) => {
    const navigate = useNavigate();

    const account: IUserAccount = useSelector(
        (state: IStateType) => state.userAccount
    );

    const subscription = account.user?.subscription;
    const currentPlan = subscription?.plan?.toLowerCase?.() || "free";
    const availableQuota = Number(subscription?.quota ?? 0);

    const isTester = currentPlan === "tester";
    const isB1 = currentPlan === "b1";
    const isUnlimited = currentPlan === "b1_unlimited";
    const isFree = !subscription || currentPlan === "free";

    const endDate = subscription?.endDate
        ? new Date(subscription.endDate)
        : null;

    const isExpired =
        !isTester &&
        !!endDate &&
        !Number.isNaN(endDate.getTime()) &&
        endDate.getTime() <= Date.now();

    const isActiveB1 = (isB1 || isUnlimited) && !isExpired;
    const hasNoQuota = !isTester && !isUnlimited && availableQuota <= 0;

    const planLabel = isTester
        ? "Tester"
        : isExpired
            ? "Expired"
            : isUnlimited
                ? "B1 Unlimited"
                : isB1
                    ? "B1 · 10 Exams"
                    : "Free";

    const showBuyButton = !isTester && (isFree || isExpired || hasNoQuota || isB1);

    const planBadgeClass =
        isTester || isActiveB1
            ? "bg-green-100 text-green-700 ring-green-200 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-900/40"
            : isExpired
                ? "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-900/40"
                : "bg-neutral-100 text-neutral-700 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-800";

    return (
        <header className="sticky top-0 z-50 flex w-full border-b border-black/10 bg-white dark:border-white/10 dark:bg-gray-900">
            {/* Left: Sidebar toggle + Brand */}
            <div
                className="cursor-pointer flex items-center"
                onClick={(e) => {
                    e.stopPropagation();
                    setSidebarOpen(!sidebarOpen);
                }}
            >
                <div className="m-4 flex items-center justify-center text-2xl font-semibold text-gray-900 dark:text-white">
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

                    <span className="text-black dark:text-white">
                        EasyPrüfung
                    </span>
                </div>
            </div>

            {/* Right: Access status + quota + payment CTA + settings */}
            <div className="ml-auto mr-4 flex items-center gap-3">
                <span
                    className={`hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${planBadgeClass}`}
                    title="Current exam access"
                >
                    {planLabel}
                </span>

                <button
                    type="button"
                    onClick={() => navigate("/settings#access")}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200 transition hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800 dark:hover:bg-blue-900/50"
                    title="Available exams"
                >
                    <CoinIcon className="h-3.5 w-3.5" />
                    <span>
                        {isTester
                            ? "Tester access"
                            : isUnlimited
                                ? "Unlimited exams"
                                : `${availableQuota} exam${availableQuota === 1 ? "" : "s"}`}
                    </span>
                </button>

                {showBuyButton && (
                    <button
                        type="button"
                        onClick={() => navigate("/pricing")}
                        className="inline-flex items-center gap-2 rounded-full border border-black bg-black px-3 py-1 text-xs font-semibold text-white transition hover:bg-black/90 active:bg-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-white/90"
                        title="View TELC B1 plans"
                    >
                        <span className="hidden sm:inline">
                            {isB1 && !isExpired && !hasNoQuota ? "Upgrade" : "View plans"}
                        </span>
                        <span className="sm:hidden">Plans</span>
                        <ArrowUpRight />
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => navigate("/settings")}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10"
                    title="Settings"
                >
                    <GearIcon className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
};

export default Header;
