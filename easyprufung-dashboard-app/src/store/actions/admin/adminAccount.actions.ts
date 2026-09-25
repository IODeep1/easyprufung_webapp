import {IAdmin} from "../../models/admin/admin.interface";

export const ADMIN_LOG_IN: string = "ADMIN_LOG_IN";
export const ADMIN_LOG_OUT: string = "ADMIN_LOG_OUT";

export function adminLogin(admin: IAdmin): IAdminLogInActionType {
    return { type: ADMIN_LOG_IN, admin: admin};
}

export function adminLogout(): IAdminLogOutActionType {
    return { type: ADMIN_LOG_OUT};
}

interface IAdminLogInActionType { type: string, admin: IAdmin};
interface IAdminLogOutActionType { type: string };
