import {ISubscription} from "../subscription.interface";
import {IProject} from "./project/project.interface";

export interface IUser {
    id: number;
    uuid: string;
    githubUsername: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    source: string;
    userRole: string;
    codingKnowledgeLevel: string;
    createdDate: string;
    token: string;
    subscriptions: ISubscription[]
}