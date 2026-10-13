import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import phrases from "../../locales/ui-phrases.json";
import examPhrases from "../../locales/exam-ui.json";

type Language = "en" | "de" | "fr" | "ar" | "uk";
const dictionary = phrases as Record<string, Partial<Record<Language, string>>>;
type TextRecord = { source: string; displayed: string };
const texts = new WeakMap<Text, TextRecord>();
const attributes = new WeakMap<Element, Record<string, TextRecord>>();
const attrNames = ["placeholder", "title", "aria-label", "alt"] as const;

function translate(source: string, lang: Language): string {
  const trimmed = source.trim();
  const normalized = trimmed.replace(/\s+/g, " ");
  const examDictionary = examPhrases as Record<string, Partial<Record<Language, string>>>;
  const mapped = examDictionary[normalized]?.[lang] || (lang === "en" ? undefined : (dictionary[trimmed]?.[lang] || dictionary[normalized]?.[lang]));
  return mapped ? source.replace(trimmed, mapped) : source;
}
function excluded(element: Element | null): boolean {
  return !!element?.closest('script,style,textarea,code,pre,[contenteditable="true"],[data-no-translate],[data-exam-language]');
}

/** Compatibility translator for legacy JSX literals; keyed translations use react-i18next directly.
 * Preserve the *source* across language switches, rather than making the last translation
 * the new source. Detect React updates by comparing with the last text we actually wrote.
 */
export default function AppLanguage() {
  const { i18n } = useTranslation();
  useEffect(() => {
    const lang = (i18n.resolvedLanguage || i18n.language).slice(0, 2) as Language;
    const update = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) {
        const node = root as Text;
        if (excluded(node.parentElement) || !node.textContent?.trim()) return;
        const current = node.textContent || "";
        const previous = texts.get(node);
        // Changes made by React (not us) become the new original string.
        const source = !previous || (current !== previous.displayed && current !== previous.source)
          ? current : previous.source;
        const next = translate(source, lang);
        texts.set(node, { source, displayed: next });
        if (current !== next) node.textContent = next;
        return;
      }
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      const element = root as Element;
      if (excluded(element)) return;
      const records = attributes.get(element) || {};
      for (const name of attrNames) {
        const current = element.getAttribute(name);
        if (current === null) continue;
        const previous = records[name];
        const source = !previous || (current !== previous.displayed && current !== previous.source)
          ? current : previous.source;
        const next = translate(source, lang);
        records[name] = { source, displayed: next };
        if (current !== next) element.setAttribute(name, next);
      }
      attributes.set(element, records);
      Array.from(element.childNodes).forEach(update);
    };
    let queued = false;
    const flush = () => {
      queued = false;
      update(document.getElementById("root") || document.body);
    };
    // Update immediately on language changes, not only when the DOM subsequently mutates.
    flush();
    const observer = new MutationObserver(() => {
      if (!queued) {
        queued = true;
        queueMicrotask(flush);
      }
    });
    observer.observe(document.getElementById("root") || document.body, {
      subtree: true, childList: true, characterData: true,
      attributes: true, attributeFilter: [...attrNames],
    });
    return () => observer.disconnect();
  }, [i18n.language, i18n.resolvedLanguage]);
  return null;
}
