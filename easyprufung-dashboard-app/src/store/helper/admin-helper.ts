import {IAdmin} from "../models/admin/admin.interface";

export function getCurrentAdminFirstName() {
    try {
        const adminData = localStorage.getItem('admin-data');
        if(adminData !== null && adminData.length >0){
            const admin =  (JSON.parse(adminData)) as IAdmin;
            if(admin !==null)
                return admin.firstname;
        }
    }
    catch (ex){
        return 'Admin';
    }
}

export function getCurrentAdminLastName() {
    try { const adminData = localStorage.getItem('admin-data');
        if(adminData !== null && adminData.length >0){
            const admin =  (JSON.parse(adminData)) as IAdmin;
            if(admin !==null)
                return admin.lastname;
        }
    }
    catch (ex){
        return 'Admin';
    }
}

export function getCurrentAdminFullName() {
    try {
        const adminData = localStorage.getItem('admin-data');
        if(adminData !== null && adminData.length >0){
            const admin =  (JSON.parse(adminData)) as IAdmin;
            if(admin !==null)
                return admin.firstname +' '+ admin.lastname;
        }
    }
    catch (ex){
        return 'Admin';
    }
}

export function getCurrentAdminEmail() {
    try {
        const adminData = localStorage.getItem('admin-data');
        if(adminData !== null && adminData.length >0){
            const admin =  (JSON.parse(adminData)) as IAdmin;
            if(admin !==null) return admin.email;
        }
    }
    catch (ex){
        return null;
    }
}