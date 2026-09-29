import {ISubscription} from "../subscription.interface";

export interface IUser {
    id: number;
    uuid: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    source: string;
    createdDate: string;
    token: string;
    subscription: ISubscription
}