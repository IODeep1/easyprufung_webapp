import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { ExamResultView } from "./models/exam";

type CertificateResult = Pick<ExamResultView, "evaluatedAt" | "sections" | "score" | "maximumScore" | "percentage">;
type PublicCertificate = CertificateResult & { level: string; name: string };
const formatScore = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });

export function ExamCertificate({ name, level, result }: { name: string; level: string; result: CertificateResult }) {
    return (
        <article lang="de" dir="ltr" data-no-translate className="mt-6 border border-stone-400 bg-[#fffdf7] p-2 text-stone-900 sm:p-3">
            <div className="border border-stone-300 px-5 py-8 sm:px-12 sm:py-12">
                <header className="text-center">
                    <a href="https://smartpruefung.com/" target="_blank" rel="noopener noreferrer"
                        className="inline-block text-xs font-bold tracking-[0.24em] text-emerald-900 underline decoration-emerald-900/40 underline-offset-4">
                        SMARTPRÜFUNG
                    </a>
                    <h1 className="mt-6 font-serif text-3xl font-normal tracking-tight sm:text-5xl">Übungsnachweis</h1>
                    <p className="mt-3 text-sm font-semibold tracking-widest">Deutsch · Niveau {level}</p>
                    <div className="mx-auto mt-6 w-16 border-t border-emerald-900" aria-hidden="true" />
                    {name && <p className="mt-6 break-words font-serif text-2xl sm:text-3xl">{name}</p>}
                    <p className="mt-3 text-sm font-semibold text-emerald-900">Übungsprüfung bestanden</p>
                    <p className="mt-1 text-sm text-stone-600">
                        Ausgewertet am {new Date(result.evaluatedAt).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })}
                    </p>
                </header>
                <table className="mt-8 w-full border-collapse text-sm">
                    <caption className="mb-3 text-start font-serif text-xl">Prüfungsergebnis</caption>
                    <thead className="border-y border-stone-400 text-stone-700">
                        <tr>
                            <th scope="col" className="py-2 text-start">Prüfungsteil</th>
                            <th scope="col" className="py-2 text-end">Punkte</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result.sections.map(section => (
                            <tr key={section.sectionKey} className="border-b border-stone-200">
                                <th scope="row" className="py-2 pe-3 text-start font-normal">{section.title}</th>
                                <td className="py-2 text-end tabular-nums">{formatScore.format(section.score)} / {formatScore.format(section.maximumScore)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="border-b border-stone-400 font-semibold">
                        <tr>
                            <th scope="row" className="py-3 pe-3 text-start">Gesamtergebnis</th>
                            <td className="py-3 text-end tabular-nums">
                                {formatScore.format(result.score)} / {formatScore.format(result.maximumScore)}
                                <span className="block text-stone-600">{formatScore.format(result.percentage)} %</span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
                <footer className="mt-8 text-center text-xs leading-relaxed text-stone-700">
                    <strong className="block text-sm text-stone-900">Kein offizielles Sprachzertifikat.</strong>
                    Dieser Nachweis dokumentiert eine Übungsprüfung auf SmartPrüfung.
                </footer>
            </div>
        </article>
    );
}

export function ExamCertificatePage() {
    const { token } = useParams();
    const { t, i18n } = useTranslation();
    const [certificate, setCertificate] = useState<PublicCertificate | null>(null);
    const [error, setError] = useState<"unavailable" | "loadError" | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setCertificate(null);
        setError(null);
        fetch(`/api/exams/certificates/${encodeURIComponent(token ?? "")}`, {
            headers: { Accept: "application/json" },
            cache: "no-store",
            credentials: "omit",
            signal: controller.signal
        })
            .then(async response => {
                if (controller.signal.aborted) return;
                if (!response.ok) {
                    setError(response.status === 404 ? "unavailable" : "loadError");
                    return;
                }
                const data: PublicCertificate = await response.json();
                if (!controller.signal.aborted) setCertificate(data);
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setError("loadError");
                }
            });
        return () => controller.abort();
    }, [token]);

    return (
        <main lang={i18n.resolvedLanguage} dir={i18n.dir()} data-no-translate className="min-h-screen bg-stone-100 px-4 py-8 text-stone-900 sm:px-8">
            <div className="mx-auto max-w-3xl">
                {certificate ? (
                    <ExamCertificate name={certificate.name} level={certificate.level} result={certificate} />
                ) : (
                    <p role="status">
                        {t(`certificateShare.${error ?? "loading"}`)}
                    </p>
                )}
            </div>
        </main>
    );
}
