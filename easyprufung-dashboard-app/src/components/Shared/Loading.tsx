import React, { useEffect, useState } from "react";

// Progress steps
const PROGRESS_STEPS = [
    { threshold: 0, text: "Analyzing your input..." },
    { threshold: 5, text: "Designing the layout..." },
    { threshold: 40, text: "Generating content..." },
    { threshold: 60, text: "Applying branding..." },
    { threshold: 80, text: "Finalizing..." },
    { threshold: 100, text: "Preparing view..." },
];

const getProgressText = (progress) => {
    for (let i = PROGRESS_STEPS.length - 1; i >= 0; i--) {
        if (progress >= PROGRESS_STEPS[i].threshold) {
            return PROGRESS_STEPS[i].text;
        }
    }
    return PROGRESS_STEPS[0].text;
};

const Loading = ({
                     text = "Loading...",
                     showProgressBar = false,
                     indeterminate = false,
                 }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!showProgressBar || indeterminate) return;
        setProgress(0);
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 98) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 100 / (3 * 60);
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [showProgressBar, indeterminate]);

    // Progress/Accent bar uses blue
    const progressAccent =
        "bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 dark:from-blue-700 dark:via-blue-600 dark:to-blue-800";

    const dynamicText = showProgressBar
        ? getProgressText(progress)
        : text;

    return (
        <div className="fixed -inset-8 z-[9999] flex items-center justify-center">
            {/* Glassy backdrop */}
            <div
                className={`  
          absolute inset-0   
          bg-gradient-to-br   
          from-white via-gray-100 to-white   
          opacity-80   
          backdrop-blur-2xl  
          dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:opacity-90  
        `}
            />
            {/* Card */}
            <div
                className={`  
          relative z-10 p-8 rounded-2xl shadow-2xl  
          shadow-gray-600/20   
          bg-white/90 border-black/10 border   
          backdrop-blur-lg flex flex-col items-center gap-6 max-w-sm w-full  
          dark:bg-gray-900/90 dark:shadow-black/30 dark:border-white/10  
        `}
            >
                {/* Spinner */}
                {!showProgressBar && (
                    <div className="flex items-center justify-center mb-2">
                        <svg
                            aria-hidden="true"
                            className="w-12 h-12 text-gray-200 animate-spin dark:text-gray-700 fill-blue-600 dark:fill-blue-500"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"
                            />
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"
                            />
                        </svg>
                    </div>
                )}

                {/* Loading Text */}
                <div className="flex flex-col items-center">
                  <span
                      className={` text-center  
                      text-3xl font-bold mb-2 drop-shadow  
                      text-black dark:text-white  
                    `}  >
                    {dynamicText}
                  </span>
                </div>

                {/* Progress Bar */}
                {showProgressBar && (
                    <div className="w-full mt-2">
                        {!indeterminate ? (
                            <>
                <span className="block text-center font-semibold mb-1 text-blue-400 dark:text-blue-300">
                  {Math.round(progress)}%
                </span>
                                <div className="relative h-3 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                    <div
                                        className={`  
                      absolute top-0 left-0 h-full rounded-full  
                      ${progressAccent}  
                      transition-all duration-700  
                    `}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                {/* "Do not close this view" message */}
                                <span className="block text-center mt-3 text-[12px] text-gray-500 dark:text-gray-400">
                                  Please do not close or refresh this page while it is loading.
                                </span>
                            </>
                        ) : (
                            <div className="relative h-3 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                {/* Indeterminate bar */}
                                <div
                                    className={`  
                    absolute h-full w-1/3 rounded-full  
                    ${progressAccent}  
                    animate-loading-indeterminate  
                  `}
                                    style={{ left: "-33%" }}
                                ></div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Loading;