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

    // Append JavaScript for main chat functionality
    const scriptTag = document.createElement("script");
    scriptTag.src = `${serverUrl}/scripts.js`;
    document.body.appendChild(scriptTag);

    // Append additional JavaScript to handle incoming responses
    const responseHandlerScript = document.createElement("script");
    responseHandlerScript.src = `${serverUrl}/incomingResponseHandler.js`;
    document.body.appendChild(responseHandlerScript);
  } catch (error) {
    console.error("Error embedding chat:", error);
    // Implement more user-friendly error handling here
  }
}
