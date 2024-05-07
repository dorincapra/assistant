async function embedChat(serverUrl) {
  try {
    // Fetch the HTML content
    const response = await fetch(`${serverUrl}/index.html`);
    const htmlContent = await response.text();

    // Create and append container
    const container = document.createElement("div");
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    // Append CSS
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = `${serverUrl}/styles.css`;
    document.head.appendChild(cssLink);

    // Append JavaScript
    const scriptTag = document.createElement("script");
    scriptTag.src = `${serverUrl}/script.js`;
    document.body.appendChild(scriptTag);
  } catch (error) {
    console.error("Error embedding chat:", error);
    // Implement more user-friendly error handling here
  }
}
