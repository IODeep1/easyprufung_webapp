import {IContact} from "../../store/models/contact.interface";

export async function requestCreateContactForm(newContact : IContact) {
    let serverReply: any;

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(newContact)
    };
    await fetch("/public/contact/create", requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            serverReply = result;
        })
        .catch(console.log)
    return serverReply;
}