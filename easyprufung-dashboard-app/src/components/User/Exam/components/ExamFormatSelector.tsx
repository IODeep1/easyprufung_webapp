import type { ExamFormat } from "../models/exam";

export function ExamFormatSelector({ value, onChange }: {
    value: ExamFormat;
    onChange: (format: ExamFormat) => void;
}) {
    return <fieldset className="mt-8" lang="de" dir="ltr">
        <legend className="mb-3 text-xs font-black uppercase tracking-widest">Prüfungsformat</legend>
        <div className="grid grid-cols-2 gap-3">
            {([
                ["DIGITAL", "Digital", "Aufgaben direkt am Bildschirm bearbeiten."],
                ["PAPER", "Papierbasiert", "Aufgabenheft und separater Antwortbogen."]
            ] as const).map(([format, title, description]) => <label key={format}
                className={`cursor-pointer rounded-xl border p-4 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 ${value === format ? "border-black bg-black text-white" : "border-black bg-white text-black"}`}>
                <span className="flex items-center gap-2">
                    <input type="radio" name="exam-format" value={format} checked={value === format}
                        onChange={() => onChange(format)} className="accent-indigo-600" />
                    <strong className="text-sm">{title}</strong>
                </span>
                <span className="mt-2 block text-xs leading-5">{description}</span>
            </label>)}
        </div>
        <p className="mt-3 text-xs leading-5 text-black/60">Wählen Sie das Format vor dem Start. Die Auswahl gilt für diese Prüfung.</p>
    </fieldset>;
}
