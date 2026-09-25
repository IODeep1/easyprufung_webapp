export async function requestGetServerHost() {
    let serverHost: string = '';
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'},
    };
    await fetch('/public/serverinfo', requestOptions)
        .then((response) => {
            if(!response.ok) throw new Error(response.statusText);
            else return response.json();
        })
        .then((result) => {
            localStorage.setItem('server-url', result);
            serverHost = result
        })
        .catch((e) => {
            console.log(e);
        })
    return serverHost;
}


export async function requestCheckDomain(domain,projectUuid) {
    let status: boolean = false;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
        body: JSON.stringify({
            domain,
            projectUuid
        }),
    };
    await fetch('/api/domain/check', requestOptions)
        .then((response) => {
            if(!response.ok) throw new Error(response.statusText);
            else return response.json();
        })
        .then((result) => {
            status = result
        })
        .catch((e) => {
            console.log(e);
        })
    return status;
}