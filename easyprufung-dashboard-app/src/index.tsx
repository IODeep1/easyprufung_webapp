import ReactDOM from 'react-dom';
import './index.css';
import 'flowbite';
import App from './App';
import {Provider} from "react-redux";
import store from "./store/store";
import i18n from "i18next";
import { GoogleOAuthProvider } from '@react-oauth/google';
import {initReactI18next} from "react-i18next";
import translationEn from "./locales/en/translation.json";
import translationFr from "./locales/fr/translation.json";
import translationDe from "./locales/de/translation.json";
import translationAr from "./locales/ar/translation.json";
import translationUk from "./locales/uk/translation.json";
import translationTr from "./locales/tr/translation.json";
import { supportedLanguages, normalizeLanguage } from "./localization/languages";
import {ThemeProvider} from "./hooks/useColorMode";

// Account preferences take priority for a restored authenticated session.
let accountLanguage: ReturnType<typeof normalizeLanguage>;
try {
    const cachedUser = JSON.parse(localStorage.getItem("user-data") || "null");
    if (localStorage.getItem("access-token")) accountLanguage = normalizeLanguage(cachedUser?.preferredLanguage);
} catch { /* Anonymous visitors use URL, local preference or browser language. */ }
const incomingLng = normalizeLanguage(new URLSearchParams(window.location.search).get("lang"));
const storedLng = normalizeLanguage(localStorage.getItem("current_language"));
const browserLng = normalizeLanguage(navigator.language);
const initialLng = accountLanguage || incomingLng || storedLng || browserLng || "en";

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: translationEn },
        de: { translation: translationDe },
        fr: { translation: translationFr },
        ar: { translation: translationAr },
        uk: { translation: translationUk },
        tr: { translation: translationTr },
    },
    lng: initialLng,
    supportedLngs: [...supportedLanguages],
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
});
// A website language handoff should survive navigation and future visits.
if (incomingLng && !accountLanguage) localStorage.setItem("current_language", incomingLng);
document.documentElement.lang = initialLng;
document.documentElement.dir = initialLng === "ar" ? "rtl" : "ltr";
i18n.on("languageChanged", (language) => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    localStorage.setItem("current_language", language);
});

ReactDOM.render(
    <GoogleOAuthProvider clientId='1043535428900-78a6e5fcg3gvcj6rvlu52pfrebhmff41.apps.googleusercontent.com'>
        <Provider store={store}>
            <ThemeProvider>
                <App />
            </ThemeProvider>,
        </Provider>
    </GoogleOAuthProvider>
    , document.getElementById('root'));