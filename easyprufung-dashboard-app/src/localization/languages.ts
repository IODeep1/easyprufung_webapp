export const supportedLanguages = ["en", "de", "fr", "ar", "uk", "tr"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];
export function normalizeLanguage(value?: string | null): SupportedLanguage | undefined {
    const language = value?.toLowerCase().split(/[-_]/)[0];
    return supportedLanguages.includes(language as SupportedLanguage) ? language as SupportedLanguage : undefined;
}
