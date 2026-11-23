import React from "react";
import DropdownUser from "./DropdownUser";

interface HeaderProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    setTheme?: (theme: string) => void;
}

const Header: React.FC<HeaderProps> = ({
                                           sidebarOpen,
                                           setSidebarOpen,
                                       }) => {
    return (
        <header className="sticky top-0 z-50 flex w-full border-b border-black/10 bg-white dark:border-white/10 dark:bg-gray-900">
            {/* Left: Sidebar toggle + Brand */}
            <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={sidebarOpen}
                data-sidebar-toggle="true"
                className="cursor-pointer flex items-center"
                onClick={(e) => {
                    e.stopPropagation();
                    setSidebarOpen(!sidebarOpen);
                }}
            >
                <span className="m-4 flex items-center justify-center text-2xl font-semibold text-gray-900 dark:text-white">
                    <span className="mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </span>

                    <span className="text-black dark:text-white">
                        SmartPrüfung
                    </span>
                </span>
            </button>

            {/* Right: Profile and navigation menu */}
            <div className="ml-auto mr-4 flex items-center gap-3">
                <DropdownUser variant="header" />

            </div>
        </header>
    );
};

export default Header;
