import {IUserAccount} from "./user/userAccount.interface";
import {ISubscription} from "./subscription.interface";

export interface IRootPageStateType {
    area: string;
    subArea: string;
}

export interface IRootStateType {
    page: IRootPageStateType;
}
export interface IStateType {
    root: IRootStateType;
    userAccount: IUserAccount;
}


export interface ISubscriptionState {
    subscriptions: ISubscription[];
    selectedSubscription: ISubscription | null;
}

export interface IActionBase {
    type: string;
    [prop: string]: any;
}
