import i18n from "i18next";
import { useTranslation } from "react-i18next";
import catalog from "../locales/feature-phrases.json";
import legacy from "../locales/ui-phrases.json";
import { normalizeLanguage, SupportedLanguage } from "./languages";
type Values = Record<string, unknown>;
const dictionary = catalog as Record<
  string,
  Partial<Record<SupportedLanguage, string>>
>;
const legacyDictionary = legacy as typeof dictionary;
export function translateFeature(
  source: unknown,
  locale: SupportedLanguage,
  values: Values = {}
): string {
  const text = String(source ?? "");
  const key = text.replace(/\s+/g, " ").trim();
  const requestError = key.match(/^Request failed \((\d+)\)\.$/);
  if (requestError)
    return translateFeature("Request failed ({{status}}).", locale, {
      status: requestError[1],
    });
  const result =
    locale === "en"
      ? text
      : dictionary[key]?.[locale] || legacyDictionary[key]?.[locale] || text;
  return result.replace(/\{\{(\w+)\}\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(values, name)
      ? String(values[name])
      : match
  );
}
export const featureLocale = () =>
  normalizeLanguage(i18n.resolvedLanguage || i18n.language) || "en";
export const tr = (source: unknown, values?: Values) =>
  translateFeature(source, featureLocale(), values);
export function useFeatureLocale() {
  const { i18n: current } = useTranslation();
  const locale =
    normalizeLanguage(current.resolvedLanguage || current.language) || "en";
  return { locale, dir: locale === "ar" ? ("rtl" as const) : ("ltr" as const) };
}
