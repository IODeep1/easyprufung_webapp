import { ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { IStateType } from "../../../store/models/root.interface";
import { trackPaymentClick } from "../../../api/activity/activity";
import { buildPaymentUrl, PaidExamPlan } from "./payment-links";

const copies = {
 en: { label: "Detailed analysis", title: "Get more from your B1 preparation", intro: "Understand your mistakes and keep practising with the tools to improve your next result.", benefits: ["More mock exams", "Detailed results and explanations", "AI-powered writing evaluation", "Review incorrect answers and previous exams", "No automatic renewal"], limited: "10 exams", unlimited: "Unlimited", access: "60 days of access", once: "One-time payment", save: "Save", value: "Best value" },
 de: { label: "Detaillierte Auswertung", title: "Hol mehr aus deiner B1-Vorbereitung heraus", intro: "Verstehe deine Fehler und übe weiter, um dein nächstes Ergebnis zu verbessern.", benefits: ["Mehr Übungsprüfungen", "Detaillierte Ergebnisse und Erklärungen", "KI-gestützte Bewertung deiner Schreibaufgaben", "Falsche Antworten und frühere Prüfungen überprüfen", "Keine automatische Verlängerung"], limited: "10 Prüfungen", unlimited: "Unbegrenzt", access: "60 Tage Zugang", once: "Einmalige Zahlung", save: "Spare", value: "Bestes Preis-Leistungs-Verhältnis" },
 fr: { label: "Analyse détaillée", title: "Va plus loin dans ta préparation au B1", intro: "Comprends tes erreurs et continue à t’entraîner pour améliorer ton prochain résultat.", benefits: ["Plus d’examens blancs", "Résultats détaillés et explications", "Évaluation de l’expression écrite par l’IA", "Revoir les réponses incorrectes et les examens précédents", "Aucun renouvellement automatique"], limited: "10 examens", unlimited: "Illimité", access: "60 jours d’accès", once: "Paiement unique", save: "Économise", value: "Meilleur rapport qualité-prix" },
 ar: { label: "تحليل مفصّل", title: "استفد أكثر من تحضيرك لامتحان B1", intro: "افهم أخطاءك وواصل التدريب لتحسين نتيجتك في المرة القادمة.", benefits: ["المزيد من الامتحانات التجريبية", "نتائج مفصّلة مع الشروحات", "تقييم الكتابة بالذكاء الاصطناعي", "مراجعة الإجابات الخاطئة والامتحانات السابقة", "دون تجديد تلقائي"], limited: "10 امتحانات", unlimited: "غير محدود", access: "60 يومًا من الوصول", once: "دفعة واحدة", save: "وفّر", value: "أفضل قيمة" },
 uk: { label: "Детальний аналіз", title: "Отримай більше від підготовки до B1", intro: "Розберися у своїх помилках і продовжуй практикуватися, щоб покращити наступний результат.", benefits: ["Більше пробних іспитів", "Детальні результати та пояснення", "Оцінювання письмових робіт за допомогою ШІ", "Перегляд неправильних відповідей і попередніх іспитів", "Без автоматичного продовження"], limited: "10 іспитів", unlimited: "Безліміт", access: "60 днів доступу", once: "Одноразова оплата", save: "Економія", value: "Найвигідніше" },
 tr: { label: "Ayrıntılı analiz", title: "B1 hazırlığından daha fazlasını elde et", intro: "Hatalarını anla ve bir sonraki sonucunu iyileştirmek için çalışmaya devam et.", benefits: ["Daha fazla deneme sınavı", "Ayrıntılı sonuçlar ve açıklamalar", "Yapay zekâ destekli yazma değerlendirmesi", "Yanlış yanıtları ve önceki sınavları inceleme", "Otomatik yenileme yok"], limited: "10 sınav", unlimited: "Sınırsız", access: "60 gün erişim", once: "Tek seferlik ödeme", save: "Tasarruf", value: "En avantajlı" }
};

export default function ExamUpgradeOffer({ source, compact = false }: { source: string; compact?: boolean }) {
 const user = useSelector((state: IStateType) => state.userAccount.user);
 const { i18n } = useTranslation();
 const language = (i18n.resolvedLanguage || i18n.language).split(/[-_]/)[0];
 const copy = copies[language as keyof typeof copies] || copies.en;
 const plans: {plan: PaidExamPlan; label: string; price: string; original: string; saving: string}[] = [
  {plan:"b1",label:copy.limited,price:"€19.99",original:"",saving:""},
  {plan:"b1_unlimited",label:copy.unlimited,price:"€39.99",original:"",saving:""}
 ];
 return <section data-upgrade-offer className={`relative isolate w-full overflow-hidden rounded-2xl border border-blue-100 bg-white text-gray-900 shadow-lg dark:border-blue-900/50 dark:bg-gray-950 dark:text-white ${compact ? "p-5" : "p-6 sm:p-8"}`} lang={language} dir={i18n.dir(language)}>
  <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" aria-hidden="true" />
  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200"><Sparkles size={14} aria-hidden="true" />{copy.label}</div>
  <h2 className={`${compact ? "text-xl" : "text-2xl sm:text-3xl"} font-bold tracking-tight`}>{copy.title}</h2>
  <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{copy.intro}</p>
  <ul className={`mt-5 grid gap-3 text-sm ${compact ? "" : "sm:grid-cols-2"}`}>
   {copy.benefits.map(benefit => <li key={benefit} className="flex items-start gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" /><span>{benefit}</span></li>)}
  </ul>
  <div className="mt-6 grid gap-3 sm:grid-cols-2">
   {plans.map(plan => <a key={plan.plan} href={buildPaymentUrl(plan.plan,user?.email,user?.uuid)}
    data-checkout-plan={plan.plan}
    aria-label={`${plan.label} — ${plan.price}`}
    onClick={() => trackPaymentClick(plan.plan,source)}
    onAuxClick={event => {if(event.button===1) trackPaymentClick(plan.plan,source);}}
    className={`group relative flex min-w-0 items-center justify-between gap-3 rounded-xl px-4 py-4 text-white shadow-sm transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${plan.plan === "b1" ? "bg-black hover:bg-gray-800" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"}`}>
    <span className="min-w-0"><span className="block text-base font-bold">{plan.label}</span><span className="mt-1 block text-xs text-white/80">{copy.once}</span></span>
    <span className="shrink-0 text-end"><span className="inline-flex items-center gap-1.5 text-xl font-bold">{plan.price}<ArrowRight size={16} aria-hidden="true" /></span></span>
   </a>)}
  </div>
  <p className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400"><ShieldCheck size={14} aria-hidden="true" />{copy.access} · {copy.benefits[4]}</p>
 </section>;
}
