import {useTranslation} from 'react-i18next';
import PrivacyControls from './PrivacyControls';
export default function AppPrivacy(){const {i18n}=useTranslation();return <PrivacyControls language={i18n.resolvedLanguage || i18n.language} privacyHref="/privacy" termsHref="/terms"/>;}
