import {ISubscription} from "../../models/subscription.interface";
export const LIST_SUBSCRIPTIONS: string = "LIST_SUBSCRIPTIONS";

export function loadSubscriptionsList (subscriptions: ISubscription[]): IGetSubscriptionListActionType {
    return { type: LIST_SUBSCRIPTIONS, subscriptions: subscriptions };
}


interface IGetSubscriptionListActionType{ type: string, subscriptions: ISubscription[] };

