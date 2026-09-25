import {IUser} from "../../store/models/user/user.interface";
import {logout} from "../../store/actions/user/userAccount.actions";

export async function authenticateUser(email: string, password:string) {
    let user: any;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ email: email , password: password })
    };
    await fetch('/public/user/login', requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            user = result as IUser;
            localStorage.setItem('access-token', user.token);
            localStorage.setItem('user-data', JSON.stringify(user));
        })
        .catch(() => {})
    return user;
}

export async function authenticateGoogleUser(accessToken: string) {
    let user: any;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ access_token: accessToken })
    };
    await fetch('/public/user/google/login', requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.status.toString());
            }
            else return response.json();
        })
        .then((result) => {
            user = result as IUser;
            localStorage.setItem('access-token', user.token);
            localStorage.setItem('user-data', JSON.stringify(user));
        })
        .catch(() => {})
    return user;
}

export async function requestCreateUser(newUser : IUser) {
    let user: any;

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(newUser)
    };
    await fetch('/public/user/create', requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            user = result as IUser;
            localStorage.setItem('access-token', user.token);
            localStorage.setItem('user-data', JSON.stringify(user));
        })
        .catch(console.log)
    return user;
}


export async function requestUpdateUser(updatedUser : IUser, dispatch) {
    let user: any;

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',  'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
        body: JSON.stringify(updatedUser)
    };
    await fetch('/api/user/update', requestOptions)
        .then((response) => {
            if(!response.ok) {
                dispatch(logout());
            }
            else return response.json();
        })
        .then((result) => {
            user = result as IUser;
            localStorage.setItem('user-data', JSON.stringify(user));
        })
        .catch((e) => {
            dispatch(logout());
        })
    return user;
}


export async function requestGetUser(dispatch) {
    let user: any;

    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json',  'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/user/get', requestOptions)
        .then((response) => {
            if(!response.ok) {
                dispatch(logout());
            }
            else return response.json();
        })
        .then((result) => {
            user = result as IUser;
            localStorage.setItem('user-data', JSON.stringify(user));
        })
        .catch((e) => {
            dispatch(logout());
        })
    return user;
}

export async function requestGetUserWithProjects(dispatch) {
    let user: any;
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json',  'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/user/projects', requestOptions)
        .then((response) => {
            if(!response.ok) {
                dispatch(logout());
            }
            else return response.json();
        })
        .then((result) => {
            user = result as IUser;
            localStorage.setItem('user-data', JSON.stringify(user));
        })
        .catch((e) => {
            dispatch(logout());
        })
    return user;
}

export async function requestForgotPassword(email : string) {
    let resultToReturn: string;
    const requestOptions = {
        method: 'POST',
    };
    try {
        const response =    await fetch('/public/user/forgot-password?email='+email, requestOptions)
        if (!response.ok) {
            resultToReturn = response.statusText;
        }
        resultToReturn =  await response.text();
        if (resultToReturn.startsWith('"') && resultToReturn.endsWith('"')) {
            resultToReturn = resultToReturn.slice(1, -1);
        }
    } catch (error) {
        //console.error('There has been a problem with your fetch operation:', error);
    }
    resultToReturn = "We've sent a password reset email to your address. Follow the instructions in the email to reset your password.";
    /*if(resultToReturn === "Email not found")
        resultToReturn = "We couldn't find an account with that email address. Please check and try again.";
    if(resultToReturn === "Email sent")
        resultToReturn = "We've sent a password reset email to your address. Follow the instructions in the email to reset your password.";
    */
    return resultToReturn as string;
}

export async function requestResetPassword(token : string, passowrd : string) {
    let resultToReturn: string;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ token: token , password: passowrd })
    };
    try {
        const response =    await fetch('/public/user/reset-password', requestOptions)
        if (!response.ok) {
            resultToReturn = response.statusText;
        }
        resultToReturn =  await response.text();
        if (resultToReturn.startsWith('"') && resultToReturn.endsWith('"')) {
            resultToReturn = resultToReturn.slice(1, -1);
        }
    } catch (error) {
        //console.error('There has been a problem with your fetch operation:', error);
    }
    return resultToReturn as string;
}

export async function requestActivatePromoCode(code: String) {
    let status: any;

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',  'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
        body: JSON.stringify(code)
    };
    await fetch('/api/promocode/activate', requestOptions)
        .then((response) => {
            if(response.ok) {
                return response.json();
            }
        })
        .then((result) => {
            status = result;
        })
        .catch(console.log)
    return status as String;
}


export async function requestIntercomHash() {
    let status: any;

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',  'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/user/intercom-hash', requestOptions)
        .then((response) => {
            if(response.ok) {
                return response.json();
            }
        })
        .then((result) => {
            status = result;
        })
        .catch(console.log)
    return status as String;
}
