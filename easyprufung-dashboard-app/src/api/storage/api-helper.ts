export async function uploadImageResource(file: File, oldUrl?: string) {
    let url;
    const formData = new FormData();
    formData.append("file", file);
    if (oldUrl && isValidUrl(oldUrl)) {
        formData.append("oldImageUrl", oldUrl);
    }

    try {
        const response = await fetch("/api/resources/images/upload", {
            method: "POST",
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('access-token'),
            },
            body: formData,
        });
        if (response.ok) {
            url = await response.text();
        }
    } catch (err) {
        // Handle error
    }
    return url;
}

function isValidUrl(url) {
    try {
        return url.startsWith("https://");
    } catch (_) {
        return false;
    }
}