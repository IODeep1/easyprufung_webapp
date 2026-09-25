import { IActionBase } from "../../models/root.interface";
import { IAdminAccount } from "../../models/admin/adminAccount.interface";
import { ADMIN_LOG_IN, ADMIN_LOG_OUT } from "../../actions/admin/adminAccount.actions";
import {
    getCurrentAdminFullName,
    getCurrentAdminEmail,
    getCurrentAdminFirstName, getCurrentAdminLastName
} from "../../helper/admin-helper"

const firstName = getCurrentAdminFirstName();
const lastName = getCurrentAdminLastName();
const fullName = getCurrentAdminFullName();
const adminEmail = getCurrentAdminEmail();

const initialState: IAdminAccount = {
    firstName: firstName,
    lastName: lastName,
    fullName: fullName,
    email: adminEmail ? adminEmail : "",
};

function adminAccountReducer(state: IAdminAccount = initialState, action: IActionBase): IAdminAccount {
    switch (action.type) {
        case ADMIN_LOG_IN: {
            return { ...state, email: (action.admin.email)};
        }
        case ADMIN_LOG_OUT: {
            localStorage.setItem('access-token', "");
            localStorage.setItem('admin-data', "");
            return { ...state, email: ""};
        }
        default:
            return state;
    }
}


export default adminAccountReducer;