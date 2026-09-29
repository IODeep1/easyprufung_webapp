import { useState, type FormEvent } from "react";
import type {
    CefrLevel,
    ExamProvider,
    StartExamRequest
} from "./models/exam.ts";
import type { IUserAccount } from "../../../store/models/user/userAccount.interface.ts";
import { useSelector } from "react-redux";
import type { IStateType } from "../../../store/models/root.interface.ts";

const STRIPE_B1_PAYMENT_LINK =
    process.env.NODE_ENV === "production"? "https://buy.stripe.com/3cIeVc7Zw9xQ1vOdDw1wY00" : "https://buy.stripe.com/test_dRmeVcaaZ7RBcES0m433W00";

const providers: Array<{
    value: ExamProvider;
    label: string;
    available: boolean;
}> = [
    {
        value: "TELC",
        label: "TELC",
        available: true
    },
    {
        value: "GOETHE",
        label: "GOETHE",
        available: false
    }
];

const levels: Array<{
    value: CefrLevel;
    available: boolean;
}> = [
    { value: "A1", available: false },
    { value: "A2", available: false },
    { value: "B1", available: true },
    { value: "B2", available: false },
    { value: "C1", available: false },
    { value: "C2", available: false }
];

export function StartPage({
                              onStart
                          }: {
    onStart: (request: StartExamRequest) => void;
}) {
    const account: IUserAccount = useSelector(
        (state: IStateType) => state.userAccount
    );

    const userId = account.user?.uuid || "";
    const subscription = account.user.subscription;

    const currentPlan = subscription?.plan?.toLowerCase?.() || "free";
    const availableQuota = Number(subscription?.quota ?? 0);

    const isTester = currentPlan === "tester";
    const isB1 = currentPlan === "b1";
    const isFree = currentPlan === "free";

    const endDate = subscription?.endDate
        ? new Date(subscription.endDate)
        : null;

    const hasValidEndDate =
        !!endDate && !Number.isNaN(endDate.getTime());

    const isExpired =
        !isTester &&
        hasValidEndDate &&
        endDate!.getTime() <= Date.now();

    const hasQuota = isTester || availableQuota > 0;

    const canStartExam =
        Boolean(userId.trim()) &&
        hasQuota &&
        !isExpired;

    const [provider, setProvider] =
        useState<ExamProvider>("TELC");

    const [level, setLevel] =
        useState<CefrLevel>("B1");

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (!canStartExam) {
            return;
        }

        onStart({
            userId: userId.trim(),
            provider,
            level,
            examCode: "TELC_DEUTSCH_B1_WRITTEN"
        });
    };

    const openCheckout = () => {
        const params = new URLSearchParams();

        const email = account.user?.email;
        const uuid = account.user?.uuid;

        if (email) {
            params.set("prefilled_email", email);
        }

        if (uuid) {
            params.set("client_reference_id", uuid);
        }

        const checkoutUrl = params.toString()
            ? `${STRIPE_B1_PAYMENT_LINK}?${params.toString()}`
            : STRIPE_B1_PAYMENT_LINK;

        window.location.href = checkoutUrl;
    };

    const quotaLabel = isTester
        ? "Tester-Zugang"
        : `${availableQuota} ${availableQuota === 1 ? "Prüfung" : "Prüfungen"} verfügbar`;

    const accessLabel = isTester
        ? "Unbegrenzter Tester-Zugang"
        : isExpired
            ? "Ihr Zugang ist abgelaufen"
            : isB1
                ? "TELC B1 Exam Pass"
                : isFree
                    ? "Kostenloser Zugang"
                    : "Prüfungszugang";

    return (
        <main className="min-h-screen bg-white text-black">
            <div className="mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[1.15fr_0.85fr]">
                <section className="flex flex-col justify-between p-6 sm:p-10 lg:p-16">
                    <div className="my-20 max-w-3xl lg:my-12">
                        <p className="text-xs font-black uppercase tracking-[0.28em] text-black/50">
                            Deutsche Prüfungen
                        </p>

                        <h1 className="mt-5 font-display text-5xl leading-[0.93] tracking-[-0.06em] sm:text-7xl lg:text-[6.5rem]">
                            Bereit für die echte Prüfungssituation?
                        </h1>

                        <p className="mt-7 max-w-xl text-base leading-8 text-black/55 sm:text-lg">
                            Trainieren Sie Lesen, Sprachbausteine, Hören und
                            Schreiben unter realistischen Prüfungsbedingungen.
                        </p>

                        {/* Access / quota status */}
                        <div
                            className={`mt-8 max-w-xl rounded-2xl border p-4 ${
                                isExpired || !hasQuota
                                    ? "border-red-200 bg-red-50"
                                    : isTester
                                        ? "border-green-200 bg-green-50"
                                        : "border-blue-200 bg-blue-50"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-black/50">
                                        Ihr Zugang
                                    </p>

                                    <p className="mt-1 font-black">
                                        {accessLabel}
                                    </p>

                                    <p className="mt-1 text-sm text-black/60">
                                        {quotaLabel}
                                    </p>

                                    {!isTester && hasQuota && !isExpired && (
                                        <p className="mt-2 text-xs font-semibold text-black/50">
                                            Beim Start dieser Prüfung wird 1 Quote verwendet.
                                        </p>
                                    )}

                                    {isB1 && !isExpired && hasValidEndDate && (
                                        <p className="mt-2 text-xs text-black/50">
                                            Zugang gültig bis{" "}
                                            {endDate!.toLocaleDateString("de-DE")}
                                        </p>
                                    )}
                                </div>

                                {!isTester && (
                                    <div
                                        className={`flex h-12 min-w-12 items-center justify-center rounded-full px-3 text-lg font-black ${
                                            isExpired || !hasQuota
                                                ? "bg-red-100 text-red-700"
                                                : "bg-white text-black"
                                        }`}
                                        title="Verbleibende Prüfungsquoten"
                                    >
                                        {availableQuota}
                                    </div>
                                )}
                            </div>

                            {!isTester && (isExpired || !hasQuota) && (
                                <div className="mt-4 border-t border-black/10 pt-4">
                                    <p className="text-sm font-semibold text-black/70">
                                        Holen Sie sich 10 Prüfungsquoten für 60 Tage.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={openCheckout}
                                        className="mt-3 flex w-full items-center justify-between rounded-xl bg-black px-4 py-3 text-sm font-black text-white transition hover:bg-black/90"
                                    >
                                        TELC B1 freischalten — €19
                                        <span aria-hidden="true">→</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="flex items-center border-l border-black bg-white p-6 sm:p-10 lg:p-16">
                    <form
                        onSubmit={submit}
                        className="w-full rounded-[2rem] border border-black bg-white p-7 shadow-2xl sm:p-10"
                    >
                        <p className="eyebrow">
                            Prüfung starten
                        </p>

                        <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
                            Ihre Sitzung
                        </h2>


                        <fieldset className="mt-8">
                            <legend className="mb-3 text-xs font-black uppercase tracking-widest">
                                Prüfungsanbieter
                            </legend>

                            <div className="grid grid-cols-2 gap-3">
                                {providers.map((item) => {
                                    const selected =
                                        provider === item.value;

                                    return (
                                        <button
                                            key={item.value}
                                            type="button"
                                            disabled={!item.available}
                                            onClick={() => {
                                                if (item.available) {
                                                    setProvider(item.value);
                                                }
                                            }}
                                            className={`rounded-xl border px-4 py-4 text-left transition ${
                                                selected
                                                    ? "border-black bg-black text-white"
                                                    : item.available
                                                        ? "border-black bg-white text-black"
                                                        : "cursor-not-allowed border-gray-300 bg-gray-200 text-gray-500"
                                            }`}
                                        >
                                            <span className="block text-sm font-black">
                                                {item.label}
                                            </span>

                                            {!item.available && (
                                                <span className="mt-1 block text-[0.65rem] font-bold uppercase tracking-wider">
                                                    Coming soon
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </fieldset>

                        <fieldset className="mt-8">
                            <legend className="mb-3 text-xs font-black uppercase tracking-widest">
                                Sprachniveau
                            </legend>

                            <div className="grid grid-cols-3 gap-3">
                                {levels.map((item) => {
                                    const selected =
                                        level === item.value;

                                    return (
                                        <button
                                            key={item.value}
                                            type="button"
                                            disabled={!item.available}
                                            onClick={() => {
                                                if (item.available) {
                                                    setLevel(item.value);
                                                }
                                            }}
                                            className={`rounded-xl border px-3 py-3 text-center transition ${
                                                selected
                                                    ? "border-black bg-black text-white"
                                                    : item.available
                                                        ? "border-black bg-white text-black"
                                                        : "cursor-not-allowed border-gray-300 bg-gray-200 text-gray-500"
                                            }`}
                                        >
                                            <span className="block text-sm font-black">
                                                {item.value}
                                            </span>

                                            {!item.available && (
                                                <span className="mt-1 block text-[0.55rem] font-bold uppercase tracking-wide">
                                                    Coming soon
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </fieldset>

                        <button
                            type="submit"
                            className="mt-8 flex w-full items-center justify-between rounded-2xl bg-black px-6 py-5 text-sm font-black uppercase tracking-[0.15em] text-white transition disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
                            disabled={!canStartExam}
                        >
                            {isExpired
                                ? "Zugang abgelaufen"
                                : !hasQuota
                                    ? "Keine Quote verfügbar"
                                    : "Sitzung erstellen"}

                            <span aria-hidden="true">→</span>
                        </button>


                        {!userId.trim() && (
                            <p className="mt-3 text-center text-xs font-semibold text-red-600">
                                Benutzerkonto konnte nicht geladen werden.
                            </p>
                        )}
                    </form>
                </section>
            </div>
        </main>
    );
}
