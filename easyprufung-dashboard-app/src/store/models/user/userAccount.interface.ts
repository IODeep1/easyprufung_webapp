import {ISubscription} from "../subscription.interface";
import {IUser} from "./user.interface";

export interface IUserAccount {
    user: IUser | null;
    subscription: ISubscription | null;
}