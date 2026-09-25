import {IAdmin} from "../../store/models/admin/admin.interface";
import {IUser} from "../../store/models/user/user.interface";
import {IProject} from "../../store/models/user/project/project.interface";
import {ISubscription} from "../../store/models/subscription.interface";
import {adminLogout} from "../../store/actions/admin/adminAccount.actions";

export async function authenticateAdmin(email: string, password:string) {
    let admin: any;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ email: email , password: password })
    };
    await fetch('/public/admin/login', requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            admin = result as IAdmin;
            localStorage.setItem('access-token', admin.token);
            localStorage.setItem('admin-data', result);
        })
        .catch(() => {})
    return admin;
}

export async function requestUsersCount(dispatch) {
    let count: string;
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/user/list/count', requestOptions)
        .then((response )=>  {
            if(!response.ok){
                dispatch(adminLogout());
            }
            return response.json();
        })
        .then((result) => {
            count = result;
        })
        .catch((e) => {
            dispatch(adminLogout());
        })
    if(!count) count = "0";
    return count;
}

export async function requestProjectsCount(dispatch) {
    let count: string;
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/project/list/count', requestOptions)
        .then((response )=>  {
            if(!response.ok){
                dispatch(adminLogout());
            }
            return response.json();
        })
        .then((result) => {
            count = result;
        })
        .catch((e) => {
            dispatch(adminLogout());
        })
    if(!count) count = "0";
    return count;
}

export async function requestUsersList(dispatch) {
    let users: any;
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/user/list', requestOptions)
        .then((response )=>  {
            if(!response.ok){
                dispatch(adminLogout());
            }
            return response.json();
        })
        .then((result) => {
            users =  result as IUser[];
        })
        .catch((e) => {
            dispatch(adminLogout());
        })
    return users;
}

export async function requestProjectsList(dispatch) {
    let projects: any;
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/project/list', requestOptions)
        .then((response )=>  {
            if(!response.ok){
                dispatch(adminLogout());
            }
            return response.json();
        })
        .then((result) => {
            projects =  result as IProject[];
        })
        .catch((e) => {
            dispatch(adminLogout());
        })
    return projects;
}

export async function requestSubscriptionsList(dispatch) {
    let subscriptions: any;
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/subscription/list', requestOptions)
        .then((response )=>  {
            if(!response.ok){
                dispatch(adminLogout());
            }
            return response.json();
        })
        .then((result) => {
            subscriptions =  result as ISubscription[];

        })
        .catch((e) => {
            dispatch(adminLogout());
        })
    return subscriptions;
}
