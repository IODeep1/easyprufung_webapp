import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { IStateType } from "../../store/models/root.interface";
import { normalizeLanguage } from "../../localization/languages";

/** Restore the account preference at sign-in and when server profile data refreshes. */
export default function UserLanguagePreference() {
    const user = useSelector((state: IStateType) => state.userAccount.user);
    const { i18n } = useTranslation();
    useEffect(() => {
        const language = normalizeLanguage(user?.preferredLanguage);
        if (language) void i18n.changeLanguage(language);
    }, [user?.email, user?.preferredLanguage, i18n]);
    return null;
}
