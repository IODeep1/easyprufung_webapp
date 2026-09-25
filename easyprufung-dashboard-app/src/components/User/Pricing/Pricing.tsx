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
                                Choose the plan that works best for you: a flexible monthly subscription or a one-time lifetime payment.
                            </p>
                        </div>
                        <div className="pt-2 lg:grid lg:grid-cols-2 lg:gap-6 xl:gap-10">
                            {/* Starter - Monthly */}
                            <div className={cardBase}>
                                <h3 className={headingBase}>Starter</h3>
                                <p className="text-neutral-600 sm:text-lg dark:text-neutral-400">
                                    Perfect for testing new ideas, launching small projects, or getting your startup off the ground.
                                </p>
                                <div className={priceRow}>
                                    <span className={price}>$9</span>
                                    <span className={priceSub}>/month</span>
                                </div>
                                <ul role="list" className={listBase}>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span className="font-semibold">Try 3 business ideas this month</span>
                                    </li>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span>Validate, brand, and launch 3 startups</span>
                                    </li>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span>3 AI-generated business names</span>
                                    </li>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span>3 AI-generated logos</span>
                                    </li>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span>3 AI-generated professional landing pages</span>
                                    </li>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span className="font-semibold">50 credits for refining and improving</span>
                                    </li>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span>Built-in waitlist & contact form</span>
                                    </li>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span>Connect your own custom domain</span>
                                    </li>
                                    <li className={listItem}>
                                        <CheckIcon />
                                        <span>Free SSL certificate for security</span>
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
                            {/* AutoPilot - Lifetime (Most Popular) */}
                            <div className="relative pt-4 md:scale-105 md:[transform:translateY(-0.5rem)]">
                                <div className="pointer-events-none absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                                    <div className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
                                        Most Popular
                                    </div>
                                </div>
                                <div className={`${cardBase} border-blue-100 ring-1 ring-blue-500/20 shadow-blue-200/40 dark:border-blue-900/40`}>
                                    <h3 className={headingBase}>
                                        AutoPilot{" "}
                                        <span className="text-xl font-normal text-neutral-500 dark:text-neutral-400">(Lifetime Access)</span>
                                    </h3>
                                    <p className="text-neutral-600 sm:text-lg dark:text-neutral-400">
                                        Unlock unlimited potential—build, launch, and validate as many ideas as you want, forever.
                                    </p>
                                    <div className={priceRow}>
                                        <span className={price}>$149</span>
                                        <span className={priceSub}>One-Time Payment</span>
                                    </div>
                                    <ul role="list" className={listBase}>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span className="font-semibold">Unlimited projects—launch as many businesses as you want</span>
                                        </li>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span>Unlimited business idea validations</span>
                                        </li>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span>Unlimited AI-generated business names</span>
                                        </li>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span>Unlimited AI-generated logos</span>
                                        </li>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span>Unlimited AI-generated professional landing pages</span>
                                        </li>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span className="font-semibold">Unlimited iterations for endless creativity</span>
                                        </li>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span>Built-in waitlist & contact form</span>
                                        </li>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span>Connect your own custom domain</span>
                                        </li>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span>Free SSL certificate for security</span>
                                        </li>
                                        <li className={listItem}>
                                            <CheckIcon />
                                            <span>Priority support & early access to new features</span>
                                        </li>
                                    </ul>
                                    <div className="mt-auto pt-2">
                                        <a
                                            href={lifetimeUrl}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-lg font-medium text-white shadow-sm ring-1 ring-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                                        >
                                            Start your lifetime access
                                            <ArrowRight />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                            Prices in USD. Cancel anytime.
                        </p>
                    </div>
                </Container>
            </section>
        </div>
    );
};

export default Pricing;