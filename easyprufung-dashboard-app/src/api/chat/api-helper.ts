import {IChatRequest} from "../../store/models/user/Chat/chatRequest.interface";

export async function getProjectChatHistory(uuid : String, location: String) {
    let chatRequest: any;
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+localStorage.getItem('access-token')},
    };
    await fetch('/api/chat/project/history?uuid='+uuid+"&location="+location, requestOptions)
        .then((response) => {
            if(!response.ok) {
                localStorage.setItem('server-error', response.statusText);
            }
            else return response.json();
        })
        .then((result) => {
            chatRequest = result as IChatRequest;
        })
        .catch(console.log)
    return chatRequest;
}