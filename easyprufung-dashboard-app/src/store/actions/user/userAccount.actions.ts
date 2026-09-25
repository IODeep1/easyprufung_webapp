import {IUser} from "../../models/user/user.interface";

export const LOG_IN: string = "LOG_IN";
export const LOG_OUT: string = "LOG_OUT";
export const UPDATE_USER: string = "UPDATE_USER";

export function login(user: IUser): ILogInActionType {
    return { type: LOG_IN, user: user};
}

export function updateUser(user: IUser): IUpdateUserActionType {
    return { type: UPDATE_USER, user: user};
}

export function logout(): ILogOutActionType {
    return { type: LOG_OUT};
}

interface ILogInActionType { type: string, user: IUser};
interface ILogOutActionType { type: string };
interface IUpdateUserActionType { type: string, user: IUser};
