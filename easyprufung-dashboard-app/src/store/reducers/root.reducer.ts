import { combineReducers, Reducer } from "redux";
import { UPDATE_CURRENT_PATH } from "../actions/root.actions";
import { IRootStateType, IActionBase, IStateType } from "../models/root.interface";
import projectsReducer from "./user/project.reducer";
import userAccountReducer from "./user/userAccount.reducer";
import adminAccountReducer from "./admin/adminAccount.reducer";
import subscriptionsReducer from "./shared/subscription.reducer";


const initialState: IRootStateType = {
    page: {area: "home", subArea: ""}
};

function rootReducer(state: IRootStateType = initialState, action: IActionBase): IRootStateType {
    switch (action.type) {
        case UPDATE_CURRENT_PATH:
            return { ...state, page: {area: action.area, subArea: action.subArea}};
        default:
            return state;
    }
}

const rootReducers: Reducer<IStateType> = combineReducers({root: rootReducer,
    subscriptions: subscriptionsReducer,
    projects: projectsReducer,
    adminAccount: adminAccountReducer,
    userAccount: userAccountReducer
});



export default rootReducers;