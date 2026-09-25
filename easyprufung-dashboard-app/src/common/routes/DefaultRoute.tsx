import {  RouteProps } from "react-router";
import React from "react";
import Root from "../../components/User/Root/Root";
import {IUserAccount} from "../../store/models/user/userAccount.interface";
import {useSelector} from "react-redux";
import {IStateType} from "../../store/models/root.interface";
import Login from "../../components/User/Login/Login";

export function DefaultRoute({ children, ...rest }: RouteProps): JSX.Element {
    const account: IUserAccount = useSelector((state: IStateType) => state.userAccount);
    return (
        account.user?.email ? (
            <Root />
        ) : (
            <Login />
        )
    );
}