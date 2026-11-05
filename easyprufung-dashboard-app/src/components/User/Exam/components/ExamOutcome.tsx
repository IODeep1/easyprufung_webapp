import appI18n from "i18next";
import { useTranslation } from "react-i18next";
import { Check, Minus } from "lucide-react";

export function ExamOutcome({ passed, compact = false }: { passed: boolean; compact?: boolean }) {
    const { t, i18n } = useTranslation(undefined, { i18n: appI18n });
    const outcome = t(passed ? "examOutcome.passed" : "examOutcome.failed");
    const language = { lang: i18n.resolvedLanguage, dir: i18n.dir() };

    if (compact) {
        const Icon = passed ? Check : Minus;
        return (
            <span {...language} data-no-translate className={`inline-flex max-w-full items-center gap-1.5 text-sm font-semibold ${
                passed ? "text-emerald-800" : "text-stone-700"
            }`}>
                <Icon size={16} strokeWidth={2.5} className="shrink-0" aria-hidden="true" />
                {outcome}
            </span>
        );
    }

    return (
        <div {...language} data-no-translate>
            <p className="text-xs font-semibold uppercase tracking-widest text-black/55">{t("examOutcome.label")}</p>
            <h1 className={`mt-3 break-words font-display text-5xl leading-none tracking-[-0.045em] sm:text-7xl ${
                passed ? "text-emerald-900" : "text-stone-900"
            }`}>
                {outcome}
            </h1>
        </div>
    );
}
