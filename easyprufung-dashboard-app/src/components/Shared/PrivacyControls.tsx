import {useState,useEffect} from "react";
import {readPrivacyChoice,savePrivacyChoice,privacyEvent,privacyKey,privacyOpenEvent} from "../../legal/privacy-choice";
const labels:Record<string,string[]>={
 en:['Privacy settings','Your privacy choices','We use necessary storage for sign-in and saved exams. Optional analytics helps us understand visits and clicks. It stays off unless you allow it.','Necessary only','Accept All','Close','Privacy Policy','Terms of Use'],
 de:['Datenschutzeinstellungen','Ihre Datenschutzentscheidung','Notwendiger Speicher ermöglicht Anmeldung und gespeicherte Prüfungen. Optionale Analyse hilft uns, Besuche und Klicks zu verstehen. Sie bleibt ohne Ihre Einwilligung aus.','Nur notwendige','Alle akzeptieren','Schließen','Datenschutzerklärung','Nutzungsbedingungen'],
 fr:['Paramètres de confidentialité','Vos choix de confidentialité','Le stockage nécessaire permet la connexion et la sauvegarde des examens. Les analyses facultatives des visites et clics restent désactivées sans votre accord.','Nécessaires uniquement','Tout accepter','Fermer','Politique de confidentialité','Conditions d’utilisation'],
 ar:['إعدادات الخصوصية','خيارات الخصوصية','التخزين الضروري يتيح تسجيل الدخول وحفظ الامتحانات. تحليلات الزيارات والنقرات الاختيارية تبقى معطلة ما لم تسمح بها.','الضروري فقط','قبول الكل','إغلاق','سياسة الخصوصية','شروط الاستخدام'],
 tr:['Gizlilik ayarları','Gizlilik tercihleriniz','Gerekli depolama giriş ve sınav kaydı içindir. İsteğe bağlı ziyaret ve tıklama analizi siz izin vermedikçe kapalıdır.','Yalnızca gerekli','Tümünü kabul et','Kapat','Gizlilik Politikası','Kullanım Koşulları'],
 uk:['Налаштування приватності','Ваш вибір приватності','Необхідне сховище забезпечує вхід і збереження іспитів. Додаткова аналітика відвідувань і натискань вимкнена без вашої згоди.','Лише необхідне','Прийняти все','Закрити','Політика приватності','Умови користування']};
export function PrivacySettingsButton({language,className="underline"}:{language:string;className?:string}) {
 const l=labels[language.split('-')[0]]||labels.en;
 return <button type="button" data-activity-ignore className={className} onClick={()=>window.dispatchEvent(new Event(privacyOpenEvent))}>{l[0]}</button>;
}
export default function PrivacyControls({language,privacyHref,termsHref,showFooter=true}:{language:string;privacyHref:string;termsHref:string;showFooter?:boolean}) {
 const l=labels[language.split('-')[0]]||labels.en;
 const [open,setOpen]=useState(false),[chosen,setChosen]=useState(false);
 useEffect(()=>{let previous:string|undefined;const update=()=>{const choice=readPrivacyChoice();const next=JSON.stringify(choice);if(next!==previous){previous=next;setChosen(!!choice);setOpen(!choice);}};update();const storage=(e:StorageEvent)=>{if(e.key===privacyKey)update();};const reopen=()=>setOpen(true);const timer=window.setInterval(update,5000);window.addEventListener('focus',update);window.addEventListener(privacyOpenEvent,reopen);window.addEventListener('storage',storage);window.addEventListener(privacyEvent,update);return()=>{window.clearInterval(timer);window.removeEventListener('focus',update);window.removeEventListener(privacyOpenEvent,reopen);window.removeEventListener('storage',storage);window.removeEventListener(privacyEvent,update);};},[]);
 const save=(yes:boolean)=>{savePrivacyChoice(yes);setChosen(true);setOpen(false);};
 return <div data-activity-ignore>
  {showFooter && <footer data-legal-footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-gray-200 bg-white px-4 py-4 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
   <a className="underline" href={privacyHref}>{l[6]}</a><a className="underline" href={termsHref}>{l[7]}</a><PrivacySettingsButton language={language}/>
  </footer>}
  {open && <section role="dialog" aria-modal="false" aria-labelledby="privacy-choice-title" lang={language} dir={language==='ar'?'rtl':'ltr'} className="fixed inset-x-3 bottom-3 z-[9999] mx-auto max-w-xl rounded-2xl border border-gray-300 bg-white p-5 text-gray-900 shadow-xl dark:border-gray-600 dark:bg-gray-900 dark:text-white">
   <h2 id="privacy-choice-title" className="text-lg font-bold">{l[1]}</h2><p className="mt-2 text-sm leading-6">{l[2]}</p>
   <a href={privacyHref} className="mt-2 inline-block text-sm text-blue-600 underline">{l[6]}</a>
   <div className="mt-4 grid grid-cols-2 gap-3"><button type="button" className="rounded-xl border border-gray-500 px-4 py-3 text-sm font-semibold" onClick={()=>save(false)}>{l[3]}</button><button type="button" className="rounded-xl border border-blue-600 bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-blue-700 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300" onClick={()=>save(true)}>{l[4]}</button></div>
   {chosen && <button className="mt-3 text-sm underline" type="button" onClick={()=>setOpen(false)}>{l[5]}</button>}
  </section>}
 </div>;
}
