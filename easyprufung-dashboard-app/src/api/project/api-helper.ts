import {IProject} from "../../store/models/user/project/project.interface";
import {IDomain} from "../../store/models/user/project/domain.interface";
import {ISocial} from "../../store/models/user/project/social.interface";
import {ILandingPage} from "../../store/models/user/project/landingPage.interface";
import {logout} from "../../store/actions/user/userAccount.actions";
import { changeSelectedProject} from "../../store/actions/user/project.actions";
import {IUser} from "../../store/models/user/user.interface.ts";

export async function createProject(newProject : IProject) {
    let project: any;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
        body: JSON.stringify(newProject)
    };
    await fetch('/api/project/create', requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            project = result as IProject;
        })
        .catch(console.log)
    return project;
}

export async function createPrebuiltProject(newProject : IProject) {
    let project: any;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
        body: JSON.stringify(newProject)
    };
    await fetch('/api/project/prebuilt/create', requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            project = result as IProject;
        })
        .catch(console.log)
    return project;
}

export async function updateProject(updatedProject : IProject) {
    let project: any;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
        body: JSON.stringify(updatedProject)
    };
    await fetch('/api/project/update', requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            project = result as IProject;
        })
        .catch(console.log)
    return project;
}

export async function upvoteProject(uuid : String) {
    let status: boolean = false
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/project/upvote?uuid='+uuid, requestOptions)
        .then((response) => {
            if(response.ok) {
                return response.json();
            }
        })
        .then((result) => {
            status = result;
        })
        .catch(console.log)
    return status;
}

export async function deleteProject(uuid) {
    let status: boolean = false;
    const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    try {
        const response = await fetch('/api/project/delete?uuid=' + uuid, requestOptions);
        if (!response.ok) {
            status = false;
        }
        const result = await response.text();
        if (result === 'OK') {
            status = true;
        } else {
            status = false;
        }
    } catch (e) {
        console.log(e);
    }
    return status;
}


export async function getProject(uuid : String,  dispatch) {
    let project: any;
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/project/get?uuid='+uuid, requestOptions)
        .then((response) => {
            if(!response.ok) {
                dispatch(logout());
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            project = result as IProject;
        })
        .catch(console.log)
    return project;
}

export async function getProjectLandingPage(uuid : String,  dispatch) {
    let project: any;
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/project/landingpage/get?uuid='+uuid, requestOptions)
        .then((response) => {
            if(!response.ok) {
                dispatch(logout());
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            project = result as IProject;
        })
        .catch(console.log)
    return project;
}

export async function getPublicProjects() {
    let projects: any;
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'},
    };
    await fetch('/public/project/public/list', requestOptions)
        .then((response) => {
            if(response.ok) {
                return response.json();
            }
        })
        .then((result) => {
            projects = result as IProject [];

        })
        .catch(console.log)
    return projects;
}

export async function getProjectValidation(uuid : String) {
    let project: any;
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/project/validate?uuid='+uuid, requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            project = result as IProject;
        })
        .catch(console.log)
    return project;
}

export async function updateProjectValidation(chatMessage : any, uuid : String) {
    let project: any;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
        body: JSON.stringify(chatMessage)
    };
    await fetch('/api/chat/project/validation?uuid='+uuid, requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            project = result as IProject;
        })
        .catch(console.log)
    return project;
}

export async function saveProjectDescription(project : IProject) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
        body: JSON.stringify(project)
    };
    await fetch('/api/project/description/save', requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {

        })
        .catch(console.log)
}

export async function getProjectName(uuid : String) {
    let project: any;
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/project/name/generate?uuid='+uuid, requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            project = result as IProject;
        })
        .catch(console.log)
    return project;
}

export async function saveProjectName(project : IProject, dispatch) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
        body: JSON.stringify(project)
    };
    await fetch('/api/project/name/save', requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            project = result as IProject;
            if(dispatch)
                dispatch(changeSelectedProject(project));
        })
        .catch(console.log)
    return project;
}

export async function updateProjectName(chatMessage : any, uuid : String) {
    let project: any;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
        body: JSON.stringify(chatMessage)
    };
    await fetch('/api/chat/project/name?uuid='+uuid, requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            project = result as IProject;
        })
        .catch(console.log)
    return project;
}


export async function getProjectDomainCheck(name : String) {
    let domains: any;
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/project/domain-check?name='+name, requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            domains = result as IDomain[];
        })
        .catch(console.log)
    return domains ;
}

export async function addDomain(domain,projectUuid) {
    let status: boolean = false;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
        body: JSON.stringify({
            domain,
            projectUuid
        }),
    };
    try {
        const response = await fetch('/api/project/domain/add', requestOptions);
        if (!response.ok) {
            status = false;
        }
        const result = await response.text();
        if (result === 'OK') {
            status = true;
        } else {
            status = false;
        }
    } catch (e) {
        console.log(e);
    }
    return status;
}

export async function deleteDomain(uuid) {
    let status: boolean = false;
    const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    try {
        const response = await fetch('/api/project/domain/delete?uuid=' + uuid, requestOptions);
        if (!response.ok) {
            status = false;
        }
        const result = await response.text();
        if (result === 'OK') {
            status = true;
        } else {
            status = false;
        }
    } catch (e) {
        console.log(e);
    }
    return status;
}

export async function getProjectSocialCheck(name : String) {
    let socials: any;
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/project/social-check?name='+name, requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            socials = result as ISocial[];
        })
        .catch(console.log)
    return socials;
}

export async function getProjectLogoSvgContent(uuid : String) {
    let project: any;
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/project/logo/svg-content?uuid='+uuid, requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            project = result as IProject;
        })
        .catch(console.log)
    return project;
}

export async function saveProjectIcon(project : IProject, dispatch) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
        body: JSON.stringify(project)
    };
    await fetch('/api/project/logo/save', requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            project= result as IProject;
            dispatch(changeSelectedProject(project));
        })
        .catch(console.log)
    return project;
}

export async function removeProjectLogoBg(image_b64 : string) {

    const response = await fetch("/api/project/logo/removebg", {
        method: "POST",
        headers: {
            Authorization: 'Bearer '+localStorage.getItem('access-token'),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ image_b64 }),
    });

    if (!response.ok) {
        throw new Error("Failed Generate Logo");
    }

    const result = await response.json();
    return result.b64_json;
}

export async function deleteProjectLogo(uuid : string) {
    let project: any;
    const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/project/logo/delete?uuid='+uuid, requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            project = result as IProject;
        })
        .catch(console.log)
    return project;
}

export async function updateProjectSvgIcon(chatMessage : any, uuid : String) {
    let project: any;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
        body: JSON.stringify(chatMessage)
    };
    await fetch('/api/chat/project/icon?uuid='+uuid, requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            project = result as IProject;
        })
        .catch(console.log)
    return project;
}

export async function createProjectLandingPage(landingPage : ILandingPage) {
    let project: any;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
        body: JSON.stringify(landingPage)
    };
    await fetch('/api/project/landingpage/create', requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            project = result as IProject;
        })
        .catch(console.log)
    return project;
}

export async function saveProjectLandingPage(project: IProject) {
    let status: boolean = false;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
        body: JSON.stringify(project)

    };
    try {
        const response = await fetch('/api/project/landingpage/save', requestOptions);
        if (!response.ok) {
            status = false;
        }
        const result = await response.text();
        if (result === 'OK') {
            status = true;
        } else {
            status = false;
        }
    } catch (e) {
        console.log(e);
    }
    return status;
}

export async function downloadProjectLandingPage(uuid : String, type) {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    const result = await fetch('/api/project/landingpage/download?uuid='+uuid+'&type='+type, requestOptions);
    const blob = await result.blob();
    const url = URL.createObjectURL(blob);
    return url ;
}


export async function deleteProjectLandingPage(uuid : string) {
    let project: any;
    const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/project/landingpage/delete?uuid='+uuid, requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            project = result as IProject;
        })
        .catch(console.log)
    return project;
}

export async function updateProjectLandingPage(chatMessage : any, uuid : String) {
    let project: any;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
        body: JSON.stringify(chatMessage)
    };
    await fetch('/api/chat/project/landingpage?uuid='+uuid, requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            project = result as IProject;
        })
        .catch(console.log)
    return project;
}