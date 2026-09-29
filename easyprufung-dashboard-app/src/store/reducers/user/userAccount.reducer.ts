import { IActionBase } from "../../models/root.interface";
import { IUserAccount } from "../../models/user/userAccount.interface";
import {LOG_IN, LOG_OUT, UPDATE_USER} from "../../actions/user/userAccount.actions";
import {
    getUser,
    getCurrentUserSubscription
} from "../../helper/user-helper"

const user  = getUser();

const initialState: IUserAccount = {
    user: user,
};

function userAccountReducer(state: IUserAccount = initialState, action: IActionBase): IUserAccount {
    switch (action.type) {
        case LOG_IN: {
            return { ...state, user: (action.user)};
        }
        case UPDATE_USER: {
            return { ...state, user: (action.user)};
        }
        case LOG_OUT: {
            localStorage.setItem('access-token', "");
            localStorage.setItem('user-data', "");
            return { ...state ,user : null};
        }
        default:
            return state;
    }
}


export default userAccountReducer;