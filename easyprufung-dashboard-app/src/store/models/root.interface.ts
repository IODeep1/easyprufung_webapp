import {IProject} from "./user/project/project.interface";
import {IUserAccount} from "./user/userAccount.interface";
import {IAdminAccount} from "./admin/adminAccount.interface";
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
    projects:IProjectState;
    subscriptions:ISubscriptionState;
    userAccount: IUserAccount;
    adminAccount: IAdminAccount;
}

export interface IProjectState {
    projects: IProject[];
    selectedProject: IProject | null;
    currentStep: String;
}

export interface ISubscriptionState {
    subscriptions: ISubscription[];
    selectedSubscription: ISubscription | null;
}

export interface IActionBase {
    type: string;
    [prop: string]: any;
}
