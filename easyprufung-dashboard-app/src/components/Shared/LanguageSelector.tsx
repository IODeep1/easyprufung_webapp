import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { IStateType } from "../../store/models/root.interface";
import { updateUser } from "../../store/actions/user/userAccount.actions";
import { requestUpdateUserPreferences } from "../../api/user/api-helper";
import { normalizeLanguage } from "../../localization/languages";

/** Anonymous choices are used during signup; account changes are saved on the server. */
export default function LanguageSelector({ registration = false }: { registration?: boolean }) {
  const { i18n, t } = useTranslation();
  const user = useSelector((state: IStateType) => state.userAccount.user);
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"saved" | "error" | null>(null);

  async function changeLanguage(value: string) {
    const language = normalizeLanguage(value);
    if (!language || saving) return;
    setStatus(null);
    if (!user?.email) {
      await i18n.changeLanguage(language);
      return;
    }
    setSaving(true);
    try {
      const updated = await requestUpdateUserPreferences({ email: user.email, preferredLanguage: language });
      await i18n.changeLanguage(updated.preferredLanguage || language);
      dispatch(updateUser(updated));
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div data-no-translate className={registration ? "mb-6" : "rounded-2xl border border-black/10 bg-white/70 p-6 shadow-xl dark:border-white/10 dark:bg-black/60"}>
      <label htmlFor="app-language" className="block text-lg font-bold text-black dark:text-white">
        {t("settings_language_title")}
      </label>
      <p id="language-hint" className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        {t(registration ? "registration_language_hint" : "settings_language_hint")}
      </p>
      <select id="app-language" value={normalizeLanguage(i18n.resolvedLanguage || i18n.language) || "en"}
        onChange={(event) => { void changeLanguage(event.target.value); }} disabled={saving}
        aria-describedby="language-hint language-status"
        className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900 dark:text-white">
        <option value="en">English</option>
        <option value="de">Deutsch</option>
        <option value="fr">Français</option>
        <option value="ar">العربية</option>
        <option value="uk">Українська</option>
        <option value="tr">Türkçe</option>
      </select>
      <p id="language-status" role={status === "error" ? "alert" : "status"} className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        {saving ? t("preferences_saving") : status === "saved" ? t("preferences_saved") : status === "error" ? t("preferences_error") : ""}
      </p>
    </div>
  );
}
