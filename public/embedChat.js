async function embedChat(serverUrl) {
  try {
    // Fetch the HTML content
    const response = await fetch(`${serverUrl}/index.html`);
    const htmlContent = await response.text();


    // Append CSS to the head
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = `${serverUrl}/styles.css`;
    document.head.appendChild(cssLink);

    // Fetch and append the JavaScript
    const scriptTag = document.createElement("script");
    scriptTag.src = `${serverUrl}/scripts.js`;
    document.body.appendChild(scriptTag);

    // Fetch and append additional JavaScript for incoming response handling
    const responseHandlerScript = document.createElement("script");
    responseHandlerScript.src = `${serverUrl}/incomingResponseHandler.js`;
    document.body.appendChild(responseHandlerScript);
  } catch (error) {
    console.error("Error embedding chat:", error);
    // Implement more user-friendly error handling here
  }
}
