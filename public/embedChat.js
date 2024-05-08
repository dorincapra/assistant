async function embedChat(serverUrl) {
  try {
    // Fetch the HTML content
    const response = await fetch(`${serverUrl}/index.html`);
    const htmlContent = await response.text();

    // Create a container for the chat to isolate it from the rest of the page
    const chatContainer = document.createElement("div");
    chatContainer.style.position = "fixed";
    chatContainer.style.bottom = "20px";
    chatContainer.style.right = "20px";
    chatContainer.style.width = "300px"; // Adjust size as needed
    chatContainer.style.height = "400px"; // Adjust size as needed
    chatContainer.style.zIndex = "1000"; // Ensure it's on top of other content
    chatContainer.style.overflow = "hidden"; // Prevents content from spilling out
    chatContainer.innerHTML = htmlContent; // Set fetched HTML content inside the container
    document.body.appendChild(chatContainer); // Append the container to the body

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
