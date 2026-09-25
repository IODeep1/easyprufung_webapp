export interface ISubscription {
    id: number;
    plan: string;
    status: string;
    type: string;
    isActive: boolean;
    quota : number;
    iteration: number;
}