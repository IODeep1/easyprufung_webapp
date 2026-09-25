export function getServerUrl()
{
    const url = localStorage.getItem("server-url")
    if(url !== null)
        return url;
    return  "something went wrong !";
}

export function getServerError()
{
    const error = localStorage.getItem("server-error")
    if(error !== null)
        return error;
    return  "something went wrong !";
}