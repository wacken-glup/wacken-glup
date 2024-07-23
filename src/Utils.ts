export function removeHTMLTags(htmlString: string) {
    // Create a new DOMParser instance
    const parser = new DOMParser();
    // Parse the HTML string into a DOM document
    const doc = parser.parseFromString(htmlString, 'text/html');
    // Extract the text content from the parsed document
    const textContent = doc.body.textContent || "";
    return textContent.trim(); // Trim any leading or trailing whitespace
}