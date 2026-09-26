import { ArrowRight, BookOpen, Clock3, Headphones, PenLine } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import type { StartExamRequest } from "../../../store/models/user/exam/exam.ts";

const examParts: Array<[LucideIcon, string, string]> = [
    [BookOpen, "Lesen", "3 Teile"],
    [PenLine, "Sprache", "2 Teile"],
    [Headphones, "Hören", "3 Teile"],
    [Clock3, "Schreiben", "1 Aufgabe"]
];

export function StartPage({ onStart }: { onStart: (request: StartExamRequest) => void }) {
    const [userId, setUserId] = useState("user-123");

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!userId.trim()) return;
        onStart({
            userId: userId.trim(),
            provider: "TELC",
            level: "B1",
            examCode: "TELC_DEUTSCH_B1_WRITTEN"
        });
    };

    return (
        <main className="min-h-screen bg-white text-black">
            <div className="mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[1.15fr_0.85fr]">
                <section className="flex flex-col justify-between p-6 sm:p-10 lg:p-16">
                    <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-full border border-black bg-white font-black text-black">E</span>
                        <span className="text-sm font-black uppercase tracking-[0.18em]">EasyPrüfung</span>
                    </div>

                    <div className="my-20 max-w-3xl lg:my-12">
                        <p className="text-xs font-black uppercase tracking-[0.28em] text-black/50">telc Deutsch B1</p>
                        <h1 className="mt-5 font-display text-5xl leading-[0.93] tracking-[-0.06em] sm:text-7xl lg:text-[6.5rem]">
                            Bereit für die echte Prüfungssituation?
                        </h1>
                        <p className="mt-7 max-w-xl text-base leading-8 text-black/55 sm:text-lg">
                            Eine vollständige schriftliche Prüfung mit Lesen, Sprachbausteinen, Hören und Schreiben.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-black sm:grid-cols-4">
                        {examParts.map(([Icon, title, value]) => (
                            <div key={title} className="border-black bg-white p-4 [&:not(:last-child)]:border-r sm:p-5">
                                <Icon size={18} className="text-black" />
                                <p className="mt-3 text-xs font-black uppercase tracking-wider">{title}</p>
                                <p className="mt-1 text-xs text-black/40">{value}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="flex items-center border-l border-black bg-white p-6 text-black sm:p-10 lg:p-16">
                    <form onSubmit={submit} className="w-full rounded-[2rem] border border-black bg-white p-7 shadow-2xl sm:p-10">
                        <p className="eyebrow">Prüfung starten</p>
                        <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">Ihre Sitzung</h2>
                        <p className="mt-3 text-sm leading-6 text-black/50">
                            Die Aufgaben werden vorbereitet. Das kann einen Moment dauern.
                        </p>

                        <label className="mt-8 block">
                            <span className="mb-2 block text-xs font-black uppercase tracking-widest">Benutzer-ID</span>
                            <input
                                value={userId}
                                onChange={(event) => setUserId(event.target.value)}
                                className="control w-full"
                                placeholder="user-123"
                                autoComplete="username"
                                required
                            />
                        </label>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-black p-4">
                                <p className="eyebrow">Anbieter</p>
                                <p className="mt-1 font-black">TELC</p>
                            </div>
                            <div className="rounded-xl border border-black p-4">
                                <p className="eyebrow">Niveau</p>
                                <p className="mt-1 font-black">B1</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="mt-8 flex w-full items-center justify-between rounded-2xl bg-black px-6 py-5 text-sm font-black uppercase tracking-[0.15em] text-white transition hover:-translate-y-0.5"
                        >
                            Sitzung erstellen
                            <ArrowRight size={19} />
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}