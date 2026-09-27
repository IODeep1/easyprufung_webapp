import { useState, type FormEvent } from "react";
import type {CefrLevel, ExamProvider, StartExamRequest} from "./models/exam.ts";
import type {IUserAccount} from "../../../store/models/user/userAccount.interface.ts";
import {useSelector} from "react-redux";
import type {IStateType} from "../../../store/models/root.interface.ts";

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

    const  userId = account.user.uuid;
    const [provider, setProvider] =
        useState<ExamProvider>("TELC");
    const [level, setLevel] = useState<CefrLevel>("B1");

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (!userId.trim()) {
            return;
        }

        onStart({
            userId: userId.trim(),
            provider,
            level,
            examCode: "TELC_DEUTSCH_B1_WRITTEN"
        });
    };

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
                    </div>
                </section>

                <section className="flex items-center border-l border-black bg-white p-6 sm:p-10 lg:p-16">
                    <form
                        onSubmit={submit}
                        className="w-full rounded-[2rem] border border-black bg-white p-7 shadow-2xl sm:p-10"
                    >
                        <p className="eyebrow">Prüfung starten</p>

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
                            disabled={!userId.trim()}
                        >
                            Sitzung erstellen
                            <span aria-hidden="true">→</span>
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}