import { Check } from "lucide-react";
import type { OptionDto } from "../../../../store/models/user/exam/exam.ts";

export function AnswerSelect(props: {
    id: string;
    value?: string;
    options: OptionDto[];
    onChange: (value: string) => void;
    label?: string;
    disabledOptionKeys?: ReadonlySet<string>;
}) {
    return (
        <label className="block">
            {props.label && (
                <span className="mb-2 block text-xs font-black uppercase tracking-widest">
          {props.label}
        </span>
            )}

            <select
                id={props.id}
                value={props.value ?? ""}
                onChange={(event) => props.onChange(event.target.value)}
                className={`w-full cursor-pointer appearance-none rounded-lg border-0 px-2 pr-10 text-sm font-black text-black outline-none ${
                    props.value ? "bg-yellow-200" : "bg-white"
                }`}
            >
                <option value="" disabled>
                    Antwort auswählen
                </option>

                {props.options.map((option) => {
                    const usedByAnotherQuestion =
                        props.disabledOptionKeys?.has(option.key) &&
                        option.key !== props.value;

                    return (
                        <option
                            key={option.key}
                            value={option.key}
                            disabled={usedByAnotherQuestion}
                            className={
                                usedByAnotherQuestion
                                    ? "bg-gray-100 text-gray-400"
                                    : "bg-white text-black"
                            }
                        >
                            {usedByAnotherQuestion
                                ? `${option.text} — bereits verwendet`
                                : option.text}
                        </option>
                    );
                })}
            </select>
        </label>
    );
}

export function RadioAnswers(props: {
  name: string;
  value?: string;
  options: OptionDto[];
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  return (
      <div className={`grid gap-2 ${props.compact ? "sm:grid-cols-2" : ""}`}>
        {props.options.map((option) => {
          const selected = props.value === option.key;
          return (
              <label
                  key={option.key}
                  className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                      selected ? "border-black bg-yellow-200 text-black" : "border-black bg-white"
                  }`}
              >
                <input
                    type="radio"
                    name={props.name}
                    value={option.key}
                    checked={selected}
                    onChange={() => props.onChange(option.key)}
                    className="sr-only"
                />
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-black ${
                    selected ? "border-black bg-black text-white" : "border-black bg-white"
                }`}>
              {selected ? <Check size={14} strokeWidth={3} /> : option.key.toUpperCase()}
            </span>
                <span className="text-sm font-bold leading-5">{option.text}</span>
              </label>
          );
        })}
      </div>
  );
}

export function TrueFalseAnswers(props: {
  name: string;
  value?: string;
  options: OptionDto[];
  onChange: (value: string) => void;
}) {
  const find = (key: string) => props.options.find((option) => option.key === key);
  return (
      <div className="grid w-full max-w-xs grid-cols-2 gap-2">
        {["+", "-"].map((key) => {
          const option = find(key);
          const selected = props.value === key;
          return (
              <label
                  key={key}
                  className={`cursor-pointer rounded-xl border px-3 py-3 text-center transition ${
                      selected ? "border-black bg-yellow-200" : "border-black bg-white"
                  }`}
              >
                <input
                    className="sr-only"
                    type="radio"
                    name={props.name}
                    checked={selected}
                    onChange={() => props.onChange(key)}
                />
                <span className="block text-xl font-black">{key}</span>
                <span className="mt-0.5 block text-[0.65rem] font-black uppercase tracking-wider">
              {option?.text || (key === "+" ? "Richtig" : "Falsch")}
            </span>
              </label>
          );
        })}
      </div>
  );
}