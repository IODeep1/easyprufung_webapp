import { useMemo } from "react";
import type { ReactNode } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";

/** Restrict German translations and LTR direction to the exam subtree only.
 * The app-wide i18next language, sidebar and saved preference are untouched.
 */
export default function ExamLanguageLock({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const examI18n = useMemo(
    () => i18n.cloneInstance({ lng: "de", fallbackLng: "de", initImmediate: false }),
    [i18n]
  );

  return (
    <I18nextProvider i18n={examI18n}>
      <div lang="de" dir="ltr" data-exam-language style={{ direction: "ltr", textAlign: "left" }}>
        {children}
      </div>
    </I18nextProvider>
  );
}
