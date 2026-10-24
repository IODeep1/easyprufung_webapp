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
import {ThemeProvider} from "./hooks/useColorMode";

const supportedLanguages = ["en", "de", "fr", "ar", "uk", "tr"];
const incomingLng = new URLSearchParams(window.location.search).get("lang")?.toLowerCase().split("-")[0];
const storedLng = localStorage.getItem("current_language")?.toLowerCase().split("-")[0];
const browserLng = navigator.language.toLowerCase().split("-")[0];
const initialLng = supportedLanguages.includes(incomingLng || "")
    ? incomingLng!
    : supportedLanguages.includes(storedLng || "")
    ? storedLng!
    : supportedLanguages.includes(browserLng) ? browserLng : "en";

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
    supportedLngs: supportedLanguages,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
});
// A website language handoff should survive navigation and future visits.
if (incomingLng && supportedLanguages.includes(incomingLng)) localStorage.setItem("current_language", incomingLng);
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