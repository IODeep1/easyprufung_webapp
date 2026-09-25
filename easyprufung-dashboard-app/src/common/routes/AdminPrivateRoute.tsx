import { RouteProps } from "react-router";
import {useSelector} from "react-redux";
import { IStateType } from "../../store/models/root.interface";
import { IAdminAccount } from "../../store/models/admin/adminAccount.interface";
import AdminRoot from "../../components/Admin/Root/AdminRoot";
import AdminLogin from "../../components/Admin/Login/AdminLogin";


export function AdminPrivateRoute({ children, ...rest }: RouteProps): JSX.Element {
    const account: IAdminAccount = useSelector((state: IStateType) => state.adminAccount);
    return (
        account.email ? (
            <AdminRoot/>
        ) : <AdminLogin/>
    );
}