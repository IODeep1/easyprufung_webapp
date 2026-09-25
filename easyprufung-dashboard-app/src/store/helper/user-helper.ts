import {IUser} from "../models/user/user.interface";

export function getUser() {
    try {
        const userData = localStorage.getItem('user-data');
        if(userData !== null && userData.length >0){
            const user = (JSON.parse(userData)) as IUser;
            if(user !== null) return user;
        }
    }
    catch (ex){
        return null;;
    }
}

export function getCurrentUserSubscription() {
    try {
        const userData = localStorage.getItem('user-data');
        if(userData !== null && userData.length >0){
            const user = (JSON.parse(userData)) as IUser;
            if(user !==null && user.subscriptions) return user.subscriptions[0];
        }
    }
    catch (ex){
        return null;
    }
}
