import React, { useEffect, useState, useRef } from "react";
const DISCOUNT_CODE = "GOPILOT25";

export default function DiscountModal() {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const modalRef = useRef(null);

    useEffect(() => {
        setOpen(true);
    }, []);

    // Trap focus inside modal for accessibility
    useEffect(() => {
        if (open && modalRef.current) {
            const focusable = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            focusable[0]?.focus();
        }
    }, [open]);

    // Close on ESC
    useEffect(() => {
        function handleEsc(e) {
            if (e.key === "Escape") setOpen(false);
        }
        if (open) document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [open]);

    const handleCopy = () => {
        navigator.clipboard.writeText(DISCOUNT_CODE);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };

    // Handler for clicking overlay
    const handleOverlayClick = (e) => {
        // Only close if click is directly on the overlay, not on modal content
        if (e.target === e.currentTarget) {
            setOpen(false);
        }
    };

    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            aria-modal="true"
            tabIndex={-1}
            role="dialog"
            onClick={handleOverlayClick}
        >
            <div
                ref={modalRef}
                className="relative max-w-sm w-full bg-gradient-to-br from-white/80 to-blue-100/90 dark:from-gray-900/80 dark:to-gray-800/90 rounded-2xl shadow-xl border border-white/20 px-8 py-7 animate-in fade-in-30 scale-in-60"
                onClick={e => e.stopPropagation()} // Prevent click bubbling to overlay
            >
                {/* Close Button */}
                <button
                    onClick={() => setOpen(false)}
                    aria-label="Close modal"
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus-visible:ring ring-blue-400 p-1 transition"
                >
                    {/* Heroicon XMark */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex flex-col items-center text-center gap-2">
                    {/* Confetti Icon */}
                    <span className="text-4xl -mb-1 select-none">🎉</span>
                    <h2 className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 drop-shadow mb-1 tracking-tight">
                        25% Off Limited Offer!
                    </h2>
                    <p className="mb-3 text-gray-600 dark:text-gray-300 text-base">
                        Use this code at checkout to get <span className="font-semibold text-blue-600 dark:text-blue-300">25% off</span>
                    </p>
                    {/* Code + Copy Button */}
                    <div className="flex items-center gap-2 bg-blue-50/60 dark:bg-blue-900/30 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-700 mb-2">
                        <span className="font-bold text-lg text-blue-800 dark:text-blue-200">{DISCOUNT_CODE}</span>
                        <button
                            onClick={handleCopy}
                            className={`relative inline-flex items-center text-xs font-medium px-3 py-1 rounded-md transition  
               focus:outline-none focus:ring-2 focus:ring-blue-300  
               ${copied ? "bg-emerald-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                            aria-label={`Copy discount code: ${DISCOUNT_CODE}`}
                        >
                            {copied ? (
                                // Heroicon Check
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 ml-[-4px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                // Heroicon Clipboard
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 ml-[-4px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <rect x="9" y="4" width="6" height="2" rx="1" fill="currentColor" className="opacity-40" />
                                    <rect x="5" y="7" width="14" height="13" rx="2" stroke="currentColor" strokeWidth={2} fill="none" />
                                </svg>
                            )}
                            <span>{copied ? "Copied" : "Copy"}</span>
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
                        Expires soon. One use per customer.
                    </p>
                </div>
            </div>
            {/* Animate.css style slide-in, using Tailwind's animate-in for fade/scale pop */}
            <style jsx>{`
                @media (max-width: 480px) {
                    div[role="dialog"] {
                        padding-left: 0.5rem;
                        padding-right: 0.5rem;
                    }
                }
            `}</style>
        </div>
    );
}