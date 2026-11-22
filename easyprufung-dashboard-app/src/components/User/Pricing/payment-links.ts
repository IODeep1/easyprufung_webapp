export type PaidExamPlan = "b1" | "b1_unlimited";

const LIMITED_DEV_PAYMENT_LINK =
    "https://buy.stripe.com/test_eVq14m96V7RB8oCecU33W01";
const LIMITED_PROD_PAYMENT_LINK =
    "https://buy.stripe.com/4gM00i3JgcK24I0czs1wY02";

const UNLIMITED_DEV_PAYMENT_LINK =
    "https://buy.stripe.com/test_dRmeVcaaZ7RBcES0m433W00";
const UNLIMITED_PROD_PAYMENT_LINK =
    "https://buy.stripe.com/5kQ3cu1B87pIgqI8jc1wY01";

export const getPaymentLinkBase = (plan: PaidExamPlan): string => {
    const isProduction = process.env.NODE_ENV === "production";

    if (plan === "b1_unlimited") {
        return isProduction
            ? UNLIMITED_PROD_PAYMENT_LINK
            : UNLIMITED_DEV_PAYMENT_LINK;
    }

    return isProduction
        ? LIMITED_PROD_PAYMENT_LINK
        : LIMITED_DEV_PAYMENT_LINK;
};

export const buildPaymentUrl = (
    plan: PaidExamPlan,
    email?: string,
    userUuid?: string
): string => {
    const base = getPaymentLinkBase(plan);
    const params = new URLSearchParams();

    if (email) {
        params.set("prefilled_email", email);
    }

    if (userUuid) {
        params.set("client_reference_id", userUuid);
    }

    return params.toString() ? `${base}?${params.toString()}` : base;
};
