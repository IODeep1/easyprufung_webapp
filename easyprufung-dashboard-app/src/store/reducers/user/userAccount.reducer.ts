import { IActionBase } from "../../models/root.interface";
import { IUserAccount } from "../../models/user/userAccount.interface";
import {LOG_IN, LOG_OUT, UPDATE_USER} from "../../actions/user/userAccount.actions";
import {
    getUser,
    getCurrentUserSubscription
} from "../../helper/user-helper"

const user  = getUser();
const userSubscription = getCurrentUserSubscription();

const initialState: IUserAccount = {
    user: user,
    subscription: userSubscription
};
let currentSubscription = initialState.subscription;

function userAccountReducer(state: IUserAccount = initialState, action: IActionBase): IUserAccount {
    switch (action.type) {
        case LOG_IN: {
            if(action.user.subscriptions && action.user.subscriptions.length >0){
                currentSubscription = action.user.subscriptions[0];
            }
            else {
                currentSubscription = null;
            }
            return { ...state, user: (action.user), subscription: currentSubscription};
        }
        case UPDATE_USER: {
            if(action.user.subscriptions && action.user.subscriptions.length >0){
                currentSubscription = action.user.subscriptions[0];
            }
            else {
                currentSubscription = null;
            }
            return { ...state, user: (action.user), subscription: currentSubscription};
        }
        case LOG_OUT: {
            localStorage.setItem('access-token', "");
            localStorage.setItem('user-data', "");
            return { ...state, subscription: null ,user : null};
        }
        default:
            return state;
    }
}


export default userAccountReducer;