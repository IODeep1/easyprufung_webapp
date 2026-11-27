import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { setShortsMode, useShortsMode } from "./shorts-mode";
import "./shorts.css";

/** Presentation only: the same tasks, answers, timer and submission remain in use. */
export function ShortsFrame({ children, resetKey }: { children: ReactNode; resetKey?: string | number }) {
    const enabled = useShortsMode();
    const content = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (content.current) content.current.scrollTop = 0;
    }, [resetKey, enabled]);

    useEffect(() => {
        if (!enabled) return;
        const previous = document.body.style.overflow;
        const app = document.getElementById("root");
        const wasInert = app?.hasAttribute("inert");
        app?.setAttribute("inert", "");
        document.body.style.overflow = "hidden";
        const exit = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !document.querySelector('.shorts-stage [role="dialog"]')) setShortsMode(false);
        };
        window.addEventListener("keydown", exit);
        return () => {
            document.body.style.overflow = previous;
            if (!wasInert) app?.removeAttribute("inert");
            window.removeEventListener("keydown", exit);
        };
    }, [enabled]);

    if (!enabled) return <>{children}</>;

    return createPortal(
        <div className="shorts-backdrop" data-shorts-mode>
            <button type="button" className="shorts-exit" title="Exit Shorts mode (Escape)" onClick={() => setShortsMode(false)}>
                Exit Shorts mode
            </button>
            <div className="shorts-stage" lang="de" dir="ltr" aria-label="Shorts recording frame">
                <div className="shorts-caption-space" aria-hidden="true" />
                <div className="shorts-content" ref={content} tabIndex={0} aria-label="Prüfungsaufgaben">
                    {children}
                </div>
                <div className="shorts-brand" dir="ltr">SmartPrüfung</div>
            </div>
        </div>, document.body
    );
}
