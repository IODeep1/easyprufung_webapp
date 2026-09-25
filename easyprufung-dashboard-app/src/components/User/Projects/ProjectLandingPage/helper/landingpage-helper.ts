export function replaceLandingPageBodyContent (originalHtml, newBodyHtml) {
    // Parse the original HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(originalHtml, 'text/html');
    // Replace the body content
    doc.body.innerHTML = newBodyHtml;
    // Serialize back to string
    return doc.documentElement.outerHTML;
};