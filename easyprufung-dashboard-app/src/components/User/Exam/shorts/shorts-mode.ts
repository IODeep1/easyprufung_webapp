import { useSyncExternalStore } from "react";

const KEY = "smartpruefung.shorts-mode";
const EVENT = "smartpruefung:shorts-mode";
let fallback = false;
let useFallback = false;

function readShortsMode(): boolean {
    if (useFallback) return fallback;
    try { return window.localStorage.getItem(KEY) === "true"; }
    catch { return fallback; }
}

export function setShortsMode(enabled: boolean): void {
    fallback = enabled;
    try {
        window.localStorage.setItem(KEY, String(enabled));
        useFallback = false;
    } catch { useFallback = true; }
    window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void): () => void {
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
        window.removeEventListener(EVENT, onChange);
        window.removeEventListener("storage", onChange);
    };
}

export function useShortsMode(): boolean {
    return useSyncExternalStore(subscribe, readShortsMode, () => false);
}
