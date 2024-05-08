async function embedChat(serverUrl) {
  try {
    // Fetch the HTML content
    const response = await fetch(`${serverUrl}/index.html`);
    const htmlContent = await response.text();

    // Create and append container
    const container = document.createElement("div");
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    // Append CSS from the chat server, not the website's root
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = `${serverUrl}/styles.css`; // Make sure this points to the chat server
    document.head.appendChild(cssLink);

    // Append JavaScript from the chat server
    const scriptTag = document.createElement("script");
    scriptTag.src = `${serverUrl}/scripts.js`;
    document.body.appendChild(scriptTag);
  } catch (error) {
    console.error("Error embedding chat:", error);
    // Implement more user-friendly error handling here
  }

  // Append additional JavaScript to handle incoming responses
  const responseHandlerScript = document.createElement("script");
  responseHandlerScript.src = `${serverUrl}/incomingResponseHandler.js`;
  document.body.appendChild(responseHandlerScript);
}
