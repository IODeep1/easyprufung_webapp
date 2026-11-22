import {useTranslation} from 'react-i18next';
import {Link,useSearchParams} from 'react-router-dom';
import LegalDocument from './LegalDocument';
export default function LegalPage({kind}:{kind:'privacy'|'terms'}){
 const {i18n}=useTranslation();const [params]=useSearchParams();const language=params.get('lang') || i18n.resolvedLanguage || i18n.language;
 return <main className="min-h-screen bg-white pt-6 text-black dark:bg-gray-900 dark:text-white"><nav className="mx-auto flex max-w-4xl flex-wrap gap-5 px-6 text-sm" aria-label="Legal navigation"><Link to="/" className="font-bold text-blue-600">SmartPrüfung</Link><Link to={'/'+kind+'?lang=en'} className="underline">English</Link><Link to={'/'+kind+'?lang=de'} className="underline">Deutsch</Link><Link to={kind==='privacy'?'/terms':'/privacy'} className="underline">{kind==='privacy'?'Terms of Use':'Privacy Policy'}</Link></nav><LegalDocument kind={kind} language={language}/></main>;
}
