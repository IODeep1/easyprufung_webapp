import {useEffect, useState} from "react";
import {useTheme} from "../../hooks/useColorMode";

const DarkModeSwitcher = () => {
    const [mounted, setMounted] = useState(false);
    const { colorMode, setColorMode } = useTheme();

    const toggleTheme = () => {
        setColorMode(colorMode === 'light' ? 'dark' : 'light');
    };
    // When mounted on client, now we can show the UI
    useEffect(() => setMounted(true), []);


    if (!mounted) return null;


    return (
        <div className="flex w-full items-center gap-4 p-2  w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600">
            {colorMode === "dark" ? (
                <button
                    onClick={() => setColorMode("light")}
                    className="text-gray-300 rounded-full outline-none focus:outline-none">
                    <span className="sr-only">Light Mode</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                         >
                        <circle cx="12" cy="12" r="4"/>
                        <path d="M12 2v2"/>
                        <path d="M12 20v2"/>
                        <path d="m4.93 4.93 1.41 1.41"/>
                        <path d="m17.66 17.66 1.41 1.41"/>
                        <path d="M2 12h2"/>
                        <path d="M20 12h2"/>
                        <path d="m6.34 17.66-1.41 1.41"/>
                        <path d="m19.07 4.93-1.41 1.41"/>
                    </svg>
                </button>
            ) : (
                <button
                    onClick={() => setColorMode("dark")}
                    className="text-gray-500 rounded-full outline-none focus:outline-none focus-visible:ring focus-visible:ring-gray-100 focus:ring-opacity-20">
                    <span className="sr-only">Dark Mode</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        >
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                    </svg>
                </button>
            )}
        </div>    );
};

export default DarkModeSwitcher;
