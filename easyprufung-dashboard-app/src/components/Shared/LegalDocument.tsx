import en from "../../legal/content.en.json";
import de from "../../legal/content.de.json";
import operator from "../../legal/operator.json";
export default function LegalDocument({kind,language}:{kind:'privacy'|'terms';language:string}) {
 const german=language.split('-')[0]==='de',copy=german?de:en;
 return <article lang={german?'de':'en'} dir="ltr" className="mx-auto max-w-4xl px-6 py-12 text-gray-800 dark:text-gray-200" data-legal-document={kind}>
  <p className="text-sm font-semibold text-blue-600">SmartPrüfung</p>
  <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{kind==='privacy'?copy.privacyTitle:copy.termsTitle}</h1>
  <p className="mt-3 text-sm text-gray-500">{german?'Stand':'Last updated'}: {copy.updated}</p>
  {!['en','de'].includes(language.split('-')[0]) && <p className="mt-4 text-sm">This document is available in English and German. The English version is shown here.</p>}
  <section className="mt-8 rounded-xl border border-gray-200 p-5 dark:border-gray-700">
   <h2 className="text-lg font-semibold">{german?'Kontakt':'Contact'}</h2>
   <a className="mt-2 inline-block text-blue-600 underline" href={'mailto:'+operator.email}>{operator.email}</a>
  </section>
  {kind==='privacy' && <section className="mt-6 text-sm leading-6"><h2 className="font-semibold">{german?'Datenschutzhinweise der Anbieter':'Provider privacy information'}</h2><ul className="mt-2 flex flex-wrap gap-4"><li><a className="text-blue-600 underline" href="https://stripe.com/privacy">Stripe</a></li><li><a className="text-blue-600 underline" href="https://policies.google.com/privacy">Google / YouTube</a></li><li><a className="text-blue-600 underline" href="https://openai.com/policies/data-processing-addendum/">OpenAI API — DPA</a></li></ul></section>}
  <nav aria-label={german?'Inhalt':'Contents'} className="my-8 rounded-xl bg-gray-50 p-5 dark:bg-gray-800"><ol className="list-decimal space-y-2 pl-5">{copy[kind].map((s,i)=><li key={s.title}><a className="text-blue-600 underline" href={'#legal-section-'+i}>{s.title}</a></li>)}</ol></nav>
  {copy[kind].map((section,i)=><section className="mt-8 scroll-mt-24" id={'legal-section-'+i} key={section.title}><h2 className="text-xl font-bold">{i+1}. {section.title}</h2>{section.paragraphs.map(p=><p className="mt-3 whitespace-pre-line text-base leading-7" key={p}>{p}</p>)}</section>)}
 </article>;
}
