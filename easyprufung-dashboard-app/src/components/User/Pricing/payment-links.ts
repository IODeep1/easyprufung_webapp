export type PaidExamPlan = "b1" | "b1_unlimited";
// The authenticated backend validates configured Stripe prices against the agreed EUR amounts.
export const getPaymentLinkBase = (plan:PaidExamPlan):string => `/purchase?plan=${plan}`;
export const buildPaymentUrl = (plan:PaidExamPlan,_email?:string,_userUuid?:string):string => getPaymentLinkBase(plan);
