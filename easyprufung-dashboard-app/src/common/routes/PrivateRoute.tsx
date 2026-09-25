import { RouteProps } from "react-router";
import React, {useEffect} from "react";
import { useSelector} from "react-redux";
import { IStateType } from "../../store/models/root.interface";
import { IUserAccount } from "../../store/models/user/userAccount.interface";
import Root from "../../components/User/Root/Root";
import Login from "../../components/User/Login/Login";
import {useLocation} from "react-router-dom";


export function PrivateRoute({ children, ...rest }: RouteProps): JSX.Element {
    const location = useLocation();
    const account: IUserAccount = useSelector((state: IStateType) => state.userAccount);
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const prompt = queryParams.get('prompt');
        if (prompt){
            localStorage.setItem('user_prompt', prompt);
        }
    }, [location]);

    return (
        account.user?.email ? (
            <Root />
        ) : (
            <Login />
        )
    );
}