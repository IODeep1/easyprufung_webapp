import {
  tr,
  useFeatureLocale,
  featureLocale,
} from "../../localization/feature-i18n";
import { FormEvent, ReactNode, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Check,
  CheckCircle2,
  Globe2,
  Instagram,
  LockKeyhole,
  Mail,
  MapPin,
  MessageSquare,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { button, secondary, input } from "../Teacher/api";
import { countries } from "./countries";
import CountryPicker from "./CountryPicker";
export type PartnerApplicationData = {
  displayName: string;
  contactEmail: string;
  country: string;
  website: string;
  approach: string;
  socials: {
    platform: string;
    profile: string;
    audienceSize?: number;
  }[];
};
export function IconField({
  label,
  icon: Icon,
  children,
  hint,
}: {
  label: string;
  icon: LucideIcon;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
      <span className="mb-2 flex items-center gap-2">
        <Icon size={16} aria-hidden="true" className="text-gray-400" />
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-2 block text-xs font-normal leading-5 text-gray-500">
          {hint}
        </span>
      )}
    </label>
  );
}
export default function PartnerApplication({
  value,
  onChange,
  editing,
  busy,
  onSubmit,
  onCancel,
  payout,
  terms,
  consent,
  onConsent,
  payoutValid,
}: {
  value: PartnerApplicationData;
  onChange: (v: PartnerApplicationData) => void;
  editing: boolean;
  busy: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  onCancel: () => void;
  payout: ReactNode;
  terms: ReactNode;
  consent: boolean;
  onConsent: (checked: boolean) => void;
  payoutValid: () => string | null;
}) {
  useFeatureLocale();
  const lastStep = editing ? 1 : 2;
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const steps = [
    {
      label: tr("Your details"),
      icon: UserRound,
      description: tr("Let\u2019s get to know you"),
    },
    {
      label: tr("Your audience"),
      icon: UsersRound,
      description: tr("Tell us who you reach"),
    },
    {
      label: editing ? tr("Review") : tr("Payout & review"),
      icon: ShieldCheck,
      description: editing
        ? tr("Check your information")
        : tr("Choose how you get paid"),
    },
  ];
  const update = (
    key: keyof Omit<PartnerApplicationData, "socials">,
    text: string
  ) => onChange({ ...value, [key]: text });
  function validate(index: number): string | null {
    if (index === 0) {
      if (value.displayName.trim().length < 2)
        return "Enter your display or business name (at least 2 characters).";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.contactEmail.trim()))
        return "Enter a valid contact email.";
      if (!countries.some((c) => c.code === value.country))
        return "Select your country.";
      if (value.website) {
        try {
          const url = new URL(value.website);
          if (
            !["https:", "http:"].includes(url.protocol) ||
            !url.hostname ||
            url.username ||
            url.password
          )
            throw new Error();
        } catch {
          return "Enter a valid website URL starting with https:// or http://.";
        }
      }
    }
    if (index === 1) {
      if (
        value.socials.some(
          (s) => s.platform.trim().length < 2 || s.profile.trim().length < 2
        )
      )
        return "Add a platform and public profile for each social account.";
      if (value.approach.trim().length < 20)
        return "Tell us a little more about your audience (at least 20 characters).";
    }
    if (index === 2 && !editing) {
      const issue = payoutValid();
      if (issue) return issue;
      if (!consent)
        return "Accept the partner terms and acknowledge the privacy notice to apply.";
    }
    return null;
  }
  function move(next: number) {
    setError("");
    setStep(next);
    requestAnimationFrame(() => heading.current?.focus());
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const problem = validate(step);
    if (problem) {
      setError(problem);
      return;
    }
    if (!e.currentTarget.reportValidity()) return;
    if (step < lastStep) {
      move(step + 1);
      return;
    }
    for (let i = 0; i < 2; i++) {
      const previous = validate(i);
      if (previous) {
        move(i);
        setError(previous);
        return;
      }
    }
    setError("");
    await onSubmit(e);
  }
  const field = (
    key: "displayName" | "contactEmail" | "website",
    label: string,
    Icon: LucideIcon,
    type = "text",
    required = true,
    hint?: string
  ) => (
    <IconField label={label} icon={Icon} hint={hint}>
      <input
        className={`${input} w-full`}
        name={key}
        type={type}
        required={required}
        maxLength={key === "website" ? 500 : key === "contactEmail" ? 254 : 160}
        value={value[key]}
        autoComplete={
          key === "contactEmail"
            ? "email"
            : key === "displayName"
            ? "organization"
            : "url"
        }
        placeholder={
          key === "displayName"
            ? tr("Your name or business")
            : key === "contactEmail"
            ? "you@example.com"
            : "https://your-website.com"
        }
        onChange={(e) => update(key, e.target.value)}
      />
    </IconField>
  );
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="rounded-t-2xl border-b border-gray-100 bg-gray-50/70 px-5 py-6 dark:border-gray-800 dark:bg-gray-800/30 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">
              {editing
                ? tr("Edit your partner profile")
                : tr("Apply to become a partner")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {editing
                ? tr(
                    "Keep your contact details and audience information up to date."
                  )
                : tr(
                    "Three short steps. Your details stay here as you move between them."
                  )}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            <CheckCircle2 size={14} aria-hidden="true" />
            {tr("Free to join")}
          </span>
        </div>
      </div>
      <form onSubmit={submit} className="px-5 py-6 sm:p-8" aria-busy={busy}>
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            {tr("Step {{step}} of {{total}}", {
              step: step + 1,
              total: lastStep + 1,
            })}
          </p>
          <h3
            ref={heading}
            tabIndex={-1}
            className="mt-2 text-2xl font-semibold tracking-tight outline-none"
          >
            {steps[step].description}
          </h3>
        </div>
        <div className="space-y-6">
          {step === 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                {field(
                  "displayName",
                  tr("Display or business name"),
                  UserRound
                )}
                {field(
                  "contactEmail",
                  tr("Contact email"),
                  Mail,
                  "email",
                  true,
                  tr(
                    "Prefilled from your account. You can use a different contact email."
                  )
                )}
                <IconField label={tr("Country")} icon={MapPin}>
                  <CountryPicker
                    value={value.country}
                    onChange={(code) => update("country", code)}
                  />
                </IconField>
                {field(
                  "website",
                  tr("Website (optional)"),
                  Globe2,
                  "url",
                  false
                )}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <fieldset className="space-y-4">
                <legend className="mb-1 flex items-center gap-2 text-sm font-semibold">
                  <Instagram size={17} aria-hidden="true" />
                  {tr("Public social profiles")}
                </legend>
                <p className="text-sm text-gray-500">
                  {tr(
                    "Add at least one place where you connect with German learners."
                  )}
                </p>
                {value.socials.map((social, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-700 dark:bg-gray-800/30"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {tr("Social account {{number}}", { number: i + 1 })}
                      </span>
                      {value.socials.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            onChange({
                              ...value,
                              socials: value.socials.filter((_, j) => j !== i),
                            })
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-600"
                          aria-label={tr("Remove social account {{number}}", {
                            number: i + 1,
                          })}
                        >
                          <Trash2 size={14} aria-hidden="true" />
                          {tr("Remove")}
                        </button>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <IconField label={tr("Platform")} icon={Instagram}>
                        <select
                          className={`${input} w-full`}
                          required
                          value={social.platform}
                          onChange={(e) =>
                            onChange({
                              ...value,
                              socials: value.socials.map((s, j) =>
                                j === i ? { ...s, platform: e.target.value } : s
                              ),
                            })
                          }
                        >
                          {Array.from(
                            new Set(
                              [
                                "Instagram",
                                "YouTube",
                                "Facebook",
                                "TikTok",
                                "LinkedIn",
                                "Telegram",
                                "WhatsApp",
                                "Discord",
                                "Reddit",
                                "X / Twitter",
                                "Twitch",
                                "Podcast",
                                "Blog",
                                "Website",
                                "Other",
                                social.platform,
                              ].filter(Boolean)
                            )
                          ).map((platform) => (
                            <option key={platform} value={platform}>
                              {tr(platform)}
                            </option>
                          ))}
                        </select>
                      </IconField>
                      <IconField
                        label={tr("Profile URL or handle")}
                        icon={AtSign}
                      >
                        <input
                          className={`${input} w-full`}
                          required
                          maxLength={500}
                          placeholder="@yourprofile"
                          value={social.profile}
                          onChange={(e) =>
                            onChange({
                              ...value,
                              socials: value.socials.map((s, j) =>
                                j === i ? { ...s, profile: e.target.value } : s
                              ),
                            })
                          }
                        />
                      </IconField>
                      <IconField
                        label={tr("Audience (optional)")}
                        icon={UsersRound}
                      >
                        <input
                          className={`${input} w-full`}
                          type="number"
                          min={0}
                          max={1000000000}
                          step={1}
                          placeholder={tr("e.g. {{count}}", {
                            count: (2500).toLocaleString(featureLocale()),
                          })}
                          value={social.audienceSize ?? ""}
                          onChange={(e) =>
                            onChange({
                              ...value,
                              socials: value.socials.map((s, j) =>
                                j === i
                                  ? {
                                      ...s,
                                      audienceSize:
                                        e.target.value === ""
                                          ? undefined
                                          : Number(e.target.value),
                                    }
                                  : s
                              ),
                            })
                          }
                        />
                      </IconField>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className={secondary}
                  disabled={value.socials.length >= 10}
                  onClick={() =>
                    onChange({
                      ...value,
                      socials: [
                        ...value.socials,
                        { platform: "Instagram", profile: "" },
                      ],
                    })
                  }
                >
                  <Plus size={16} aria-hidden="true" />
                  {tr("Add social profile")}
                </button>
              </fieldset>
              <IconField
                label={tr("How would you share SmartPr\u00FCfung?")}
                icon={MessageSquare}
                hint={tr(
                  "Tell us who you reach and how you help them prepare for German exams. At least 20 characters."
                )}
              >
                <textarea
                  className={`${input} w-full`}
                  required
                  minLength={20}
                  maxLength={2000}
                  rows={4}
                  placeholder={tr("I help German learners through…")}
                  value={value.approach}
                  onChange={(e) => update("approach", e.target.value)}
                />
              </IconField>
            </>
          )}
          {step === 2 && (
            <>
              {!editing && (
                <>
                  <div className="flex items-start gap-3">
                    <LockKeyhole
                      size={20}
                      className="mt-0.5 shrink-0 text-blue-600"
                      aria-hidden="true"
                    />
                    <p className="text-sm leading-6 text-gray-500">
                      {tr(
                        "Your payout details are encrypted and shared only with authorised administrators for verification and manual payment."
                      )}
                    </p>
                  </div>
                  {payout}
                  {terms}
                  <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 text-sm leading-6 dark:border-gray-700">
                    <input
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(e) => onConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
                    />
                    {tr(
                      "I accept the partner terms and acknowledge the privacy notice above."
                    )}
                  </label>
                </>
              )}
            </>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {tr(error)}
            </p>
          )}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                className={secondary}
                disabled={busy}
                onClick={() => move(step - 1)}
              >
                <ArrowLeft
                  className="rtl:rotate-180"
                  size={16}
                  aria-hidden="true"
                />
                {tr("Back")}
              </button>
            )}
            {editing && (
              <button
                type="button"
                className="text-sm font-semibold text-gray-500"
                disabled={busy}
                onClick={onCancel}
              >
                {tr("Cancel")}
              </button>
            )}
          </div>
          <button
            type="submit"
            className={`${button} min-w-[150px]`}
            disabled={busy}
          >
            {busy
              ? "Saving…"
              : step < lastStep
              ? tr("Continue")
              : editing
              ? tr("Save profile")
              : tr("Submit application")}
            {step < lastStep ? (
              <ArrowRight
                className="rtl:rotate-180"
                size={16}
                aria-hidden="true"
              />
            ) : (
              <Check size={16} aria-hidden="true" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
