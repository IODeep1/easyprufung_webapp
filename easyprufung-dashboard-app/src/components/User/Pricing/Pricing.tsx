import React from "react";
import Container from "../../Shared/Container";
import { useSelector } from "react-redux";
import { IStateType } from "../../../store/models/root.interface";
import { IUserAccount } from "../../../store/models/user/userAccount.interface";
import DiscountModal from "./DiscountModal.tsx";

const CheckIcon = () => (
    <svg
        className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
    >
        <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
        />
    </svg>
);

const ArrowRight = ({ className = "h-4 w-4" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M18 8L22 12L18 16" />
        <path d="M2 12H22" />
    </svg>
);

const Pricing = () => {
    const account: IUserAccount = useSelector((state: IStateType) => state.userAccount);
    const email = encodeURIComponent(account?.user?.email || "");
    const refId = encodeURIComponent(account?.user?.uuid || "");

    const monthlyUrl =
        process.env.NODE_ENV === "development"
            ? `https://buy.stripe.com/test_fZecOO7nW5wo5G0bII?prefilled_email=${email}&client_reference_id=${refId}`
            : `https://buy.stripe.com/4gw8Ao6tJ6F929q4gi?prefilled_email=${email}&client_reference_id=${refId}`;

    const lifetimeUrl =
        process.env.NODE_ENV === "development"
            ? `https://buy.stripe.com/test_3cs3ee0ZycYQ4BWfYZ?prefilled_email=${email}&client_reference_id=${refId}`
            : `https://buy.stripe.com/bIY5oc6tJfbF9BS4gl?prefilled_email=${email}&client_reference_id=${refId}`;

    const cardBase =
        "relative flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-sm transition hover:-translate-y-1 hover:shadow-xl xl:p-8 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white";
    const headingBase = "mb-4 text-4xl font-semibold tracking-tight";
    const priceRow = "my-8 flex items-baseline justify-center";
    const price = "mr-2 text-5xl font-extrabold tracking-tight text-black dark:text-white";
    const priceSub = "text-neutral-500 dark:text-neutral-400";
    const listBase = "mb-8 space-y-4 text-left";
    const listItem = "flex items-start gap-3";

    return (
        <div className="relative">
            <DiscountModal />
            <section id="pricing" className="relative py-16 sm:py-20">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_55%)]" />
                <div className="relative mb-8 flex w-full flex-col items-center text-center sm:mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl md:text-5xl dark:text-white">
                        Pricing
                    </h2>
                    <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-blue-500/80" />
                </div>
                <Container className="!p-0">
                    <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
                        <div className="mx-auto mb-10 max-w-2xl text-center lg:mb-12">
                            <p className="text-base text-neutral-600 sm:text-lg dark:text-neutral-400">
                                Choose how you want to prepare: a flexible monthly plan or one-time lifetime access.
                            </p>
                        </div>
                        <div className="pt-2 lg:grid lg:grid-cols-2 lg:gap-6 xl:gap-10">
                            {/* Starter - Monthly */}
                            <div className={cardBase}>
                                <h3 className={headingBase}>Starter</h3>
                                <p className="text-neutral-600 sm:text-lg dark:text-neutral-400">
                                    A focused plan for regular TELC Deutsch B1 practice and exam-day preparation.
                                </p>
                                <div className={priceRow}>
                                    <span className={price}>$9</span>
                                    <span className={priceSub}>/month</span>
                                </div>
                                <ul role="list" className={listBase}>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span className="font-semibold">Complete up to 3 full mock exams each month</span>
                                    </li>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span>Practice in a realistic digital TELC-style exam interface</span>
                                    </li>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span>AI-generated, level-appropriate practice tasks</span>
                                    </li>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span>Practice Leseverstehen, Sprachbausteine and Hörverstehen</span>
                                    </li>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span>Practice Schriftlicher Ausdruck with AI evaluation</span>
                                    </li>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span className="font-semibold">50 AI practice credits for extra exercises and feedback</span>
                                    </li>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span>Automatic scoring with explanations</span>
                                    </li>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span>Review mistakes and previous results</span>
                                    </li>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span>Timed practice to build exam confidence</span>
                                    </li>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span>Priority support</span>
                                    </li>
                                </ul>
                                <div className="mt-auto pt-2">
                                    <a
                                        href={monthlyUrl}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-lg font-medium text-white shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/30 dark:bg-white dark:text-black dark:ring-white/10"
                                    >
                                        Start 7-day free trial
                                        <ArrowRight />
                                    </a>
                                </div>
                            </div>
                            {/* Lifetime - Most Popular */}
                            <div className="relative pt-4 md:scale-105 md:[transform:translateY(-0.5rem)]">
                                <div className="pointer-events-none absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                                    <div className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
                                        Most Popular
                                    </div>
                                </div>
                                <div className={`${cardBase} border-blue-100 ring-1 ring-blue-500/20 shadow-blue-200/40 dark:border-blue-900/40`}>
                                    <h3 className={headingBase}>
                                        Lifetime{" "}
                                        <span className="text-xl font-normal text-neutral-500 dark:text-neutral-400">(One-Time Access)</span>
                                    </h3>
                                    <p className="text-neutral-600 sm:text-lg dark:text-neutral-400">
                                        Prepare without monthly limits and keep lifetime access to EasyPrufung practice.
                                    </p>
                                    <div className={priceRow}>
                                        <span className={price}>$149</span>
                                        <span className={priceSub}>One-Time Payment</span>
                                    </div>
                                    <ul role="list" className={listBase}>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span className="font-semibold">Unlimited mock exam sessions</span>
                                        </li>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span>Unlimited TELC Deutsch B1 practice</span>
                                        </li>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span>Unlimited AI-generated practice tasks</span>
                                        </li>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span>AI evaluation for written answers</span>
                                        </li>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span>Scores, explanations, and personalized feedback</span>
                                        </li>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span className="font-semibold">Unlimited practice credits for continued preparation</span>
                                        </li>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span>Review mistakes and revisit previous results</span>
                                        </li>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span>Realistic timed digital exam experience</span>
                                        </li>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span>Access to additional TELC and Goethe levels as they are released</span>
                                        </li>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span>Priority support & early access to new exam support</span>
                                        </li>
                                    </ul>
                                    <div className="mt-auto pt-2">
                                        <a
                                            href={lifetimeUrl}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-lg font-medium text-white shadow-sm ring-1 ring-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                                        >
                                            Get lifetime access
                                            <ArrowRight />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                            Prices in USD. Monthly plans can be cancelled anytime.
                        </p>
                        <p className="mt-3 text-center text-xs text-neutral-500 dark:text-neutral-500">
                            EasyPrufung is an independent preparation platform and is not affiliated with or endorsed by telc gGmbH or the Goethe-Institut.
                        </p>
                    </div>
                </Container>
            </section>
        </div>
    );
};

export default Pricing;