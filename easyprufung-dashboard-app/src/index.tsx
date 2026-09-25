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
import {ThemeProvider} from "./hooks/useColorMode";

let storedLng =localStorage.getItem('current_language');

i18n.use(initReactI18next)
    .init({
        resources: {
            en: {translation: translationEn},
            fr: {translation: translationFr}
        },
        lng: (storedLng === null || storedLng.length === 0) ?  navigator.language : storedLng,
        fallbackLng: "en",
        interpolation: {escapeValue: false}
    }).then()

ReactDOM.render(
    <GoogleOAuthProvider clientId='644152980776-52gsir30g036f5eutfhqd4mamd465da1.apps.googleusercontent.com'>
        <Provider store={store}>
            <ThemeProvider>
                <App />
            </ThemeProvider>,
        </Provider>
    </GoogleOAuthProvider>
    , document.getElementById('root'));