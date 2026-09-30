import { Check } from "lucide-react";
import type { OptionDto } from "../models/exam.ts";

export function AnswerSelect(props: {
    id: string;
    value?: string;
    options: OptionDto[];
    onChange: (value: string) => void;
    label?: string;
    disabledOptionKeys?: ReadonlySet<string>;
    readOnly?: boolean;
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
                disabled={props.readOnly}
                onChange={(event) => props.onChange(event.target.value)}
                className={`w-full appearance-none rounded-lg border-0 px-2 pr-10 text-sm text-black outline-none disabled:cursor-default disabled:opacity-100 ${
                    props.readOnly ? "cursor-default" : "cursor-pointer"
                } ${
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
  readOnly?: boolean;
}) {
  return (
      <div className={`grid gap-2 ${props.compact ? "sm:grid-cols-2" : ""}`}>
        {props.options.map((option) => {
          const selected = props.value === option.key;
          return (
              <label
                  key={option.key}
                  className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
                      props.readOnly ? "cursor-default" : "cursor-pointer"
                  } ${
                      selected ? "border-black bg-yellow-200 text-black" : "border-black bg-white"
                  }`}
              >
                <input
                    type="radio"
                    name={props.name}
                    value={option.key}
                    checked={selected}
                    disabled={props.readOnly}
                    onChange={() => props.onChange(option.key)}
                    className="sr-only"
                />
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-black ${
                    selected ? "border-black bg-black text-white" : "border-black bg-white"
                }`}>
              {selected ? <Check size={14} strokeWidth={3} /> : option.key.toUpperCase()}
            </span>
                <span className="text-sm leading-5">{option.text}</span>
              </label>
          );
        })}
      </div>
  );
}

export function TrueFalseAnswers(props: {
    name: string;
    value?: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
}) {
    return (
        <div className="grid grid-cols-2">
            {["+", "-"].map((key) => {
                const selected = props.value === key;
                const label = key === "+" ? "Richtig" : "Falsch";

                return (
                    <label
                        key={key}
                        className={`flex justify-center ${
                            props.readOnly
                                ? "cursor-default"
                                : "cursor-pointer"
                        }`}
                        aria-label={label}
                    >
                        <input
                            type="radio"
                            name={props.name}
                            value={key}
                            checked={selected}
                            disabled={props.readOnly}
                            onChange={() => props.onChange(key)}
                            className="sr-only"
                        />

                        <span
                            className={`grid h-7 w-7 place-items-center rounded-full border-2 border-black transition ${
                                selected
                                    ? "bg-white"
                                    : "bg-white"
                            }`}
                        >
                            {selected && (
                                <span className="h-3 w-3 rounded-full bg-black" />
                            )}
                        </span>
                    </label>
                );
            })}
        </div>
    );
}
