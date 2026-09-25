import {  RouteProps } from "react-router";
import React from "react";
import {useSelector} from "react-redux";
import {IStateType} from "../../store/models/root.interface";
import AdminRoot from "../../components/Admin/Root/AdminRoot";
import AdminLogin from "../../components/Admin/Login/AdminLogin";
import {IAdminAccount} from "../../store/models/admin/adminAccount.interface";

export function DefaultAdminRoute({ children, ...rest }: RouteProps): JSX.Element {
    const account: IAdminAccount = useSelector((state: IStateType) => state.adminAccount);
    return (
        account.email ? (
            <AdminRoot/>
        ) : <AdminLogin />
    );
}