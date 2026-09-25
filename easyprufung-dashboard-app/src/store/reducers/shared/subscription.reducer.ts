import {IActionBase, ISubscriptionState} from "../../models/root.interface";
import {LIST_SUBSCRIPTIONS} from "../../actions/shared/subscription.actions";

const initialState: ISubscriptionState = {
    selectedSubscription: null,
    subscriptions: []
};

function subscriptionsReducer(state: ISubscriptionState = initialState, action: IActionBase): ISubscriptionState {
    switch (action.type) {
        case LIST_SUBSCRIPTIONS: {
            return { ...state, subscriptions: action.subscriptions};
        }
        default:
            return state;
    }
}


export default subscriptionsReducer;