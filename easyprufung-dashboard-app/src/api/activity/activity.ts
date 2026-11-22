import {analyticsAllowed} from "../../legal/privacy-choice";
export type BrowserAction = "PRICING_VIEWED" | "STRIPE_LINK_CLICKED";

// Keep payloads small and never include email, URLs/query strings, tokens or exam answers.
// The server derives account identity from the JWT and timestamps events on receipt.
export function trackActivity(type: BrowserAction, source: string, plan?: "b1" | "b1_unlimited"): void {
    try {
        if (!analyticsAllowed()) return;
        const token = localStorage.getItem("access-token");
        if (!token) return;
        const body = JSON.stringify({ eventId: crypto.randomUUID(), type, source, plan });
        const send = () => fetch("/api/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body,
            keepalive: true,
        });
        // Retry once with the SAME id: a lost response must not count twice.
        const deliver = async () => {
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    if (!analyticsAllowed() || localStorage.getItem("access-token") !== token) return;
                    const response = await send();
                    if (response.status < 500) return;
                } catch { /* Network failure: one best-effort retry. */ }
            }
        };
        void deliver();
    } catch { /* Analytics must never interrupt pricing, checkout or an exam. */ }
}

export function trackPaymentClick(plan: "b1" | "b1_unlimited", source: string): void {
    trackActivity("STRIPE_LINK_CLICKED", source, plan);
}
