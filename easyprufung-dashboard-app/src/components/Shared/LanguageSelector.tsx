import React from "react";
import { useTranslation } from "react-i18next";

/** Language is shared by all routes and persisted in current_language. */
export default function LanguageSelector() {
  const { i18n, t } = useTranslation();
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-xl dark:border-white/10 dark:bg-black/60">
      <label htmlFor="app-language" className="block text-xl font-bold text-black dark:text-white">
        {t("settings_language_title")}
      </label>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        {t("settings_language_hint")}
      </p>
      <select id="app-language" value={i18n.resolvedLanguage || i18n.language}
        onChange={(event) => { const language = event.target.value; void i18n.changeLanguage(language); }}
        className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black dark:border-gray-600 dark:bg-gray-900 dark:text-white">
        <option value="en">English</option>
        <option value="de">Deutsch</option>
        <option value="fr">Français</option>
        <option value="ar">العربية</option>
        <option value="uk">Українська</option>
      </select>
    </div>
  );
}
