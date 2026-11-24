import { useEffect, useId, useState } from "react";
import { Search, Check } from "lucide-react";
import { input } from "../Teacher/api";
import { countries } from "./countries";
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export default function CountryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const id = useId();
  const selected = countries.find((c) => c.code === value);
  const label = selected ? `${selected.flag} ${selected.name}` : "";
  const [query, setQuery] = useState(label);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (value) setQuery(label);
  }, [value, label]);
  const filtered =
    query === label && value
      ? countries
      : countries.filter((c) =>
          normalize(`${c.name} ${c.code}`).includes(normalize(query))
        );
  function choose(index: number) {
    const country = filtered[index];
    if (!country) return;
    onChange(country.code);
    setQuery(`${country.flag} ${country.name}`);
    setOpen(false);
  }
  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          name="countrySearch"
          aria-label="Country"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-countries`}
          aria-activedescendant={
            open && filtered[active] ? `${id}-country-${active}` : undefined
          }
          autoComplete="off"
          required
          className={`${input} w-full !pl-10`}
          placeholder="Search for a country"
          value={query}
          onFocus={(e) => {
            setOpen(true);
            setActive(0);
            e.currentTarget.select();
          }}
          onBlur={() => setOpen(false)}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange("");
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setOpen(true);
              const next =
                e.key === "ArrowDown"
                  ? Math.min(filtered.length - 1, active + 1)
                  : Math.max(0, active - 1);
              setActive(Math.max(0, next));
              requestAnimationFrame(() =>
                document
                  .getElementById(`${id}-country-${next}`)
                  ?.scrollIntoView?.({ block: "nearest" })
              );
            } else if (e.key === "Enter" && open) {
              e.preventDefault();
              choose(active);
            } else if (e.key === "Escape") {
              e.preventDefault();
              setOpen(false);
            }
          }}
        />
        <input type="hidden" name="country" value={value} />
      </div>
      {open && (
        <ul
          id={`${id}-countries`}
          role="listbox"
          aria-label="Countries"
          className="absolute z-40 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {filtered.length ? (
            filtered.map((country, i) => (
              <li
                key={country.code}
                role="option"
                id={`${id}-country-${i}`}
                aria-selected={country.code === value}
                onMouseEnter={() => setActive(i)}
                className={active === i ? "bg-blue-50 dark:bg-blue-900/30" : ""}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(i)}
                >
                  <span aria-hidden="true">{country.flag}</span>
                  <span className="flex-1">{country.name}</span>
                  {country.code === value && (
                    <Check
                      size={15}
                      className="text-blue-600"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-4 text-sm text-gray-500">
              No countries found. Try a name or country code.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
