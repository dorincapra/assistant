async function embedChat(serverUrl) {
  try {
    // Create a container for the chat to isolate it from the rest of the page
    const chatContainer = document.createElement("div");
    chatContainer.style.position = "fixed";
    chatContainer.style.bottom = "20px";
    chatContainer.style.right = "20px";
    chatContainer.style.width = "300px"; // Adjust size as needed
    chatContainer.style.height = "400px"; // Adjust size as needed
    chatContainer.style.zIndex = "1000"; // Ensure it's on top of other content
    chatContainer.style.border = "1px solid #ccc"; // Optional for styling
    chatContainer.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)"; // Optional for styling

    // Create and configure the iframe
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.src = `${serverUrl}/index.html`;
    chatContainer.appendChild(iframe); // Append iframe to the container
    document.body.appendChild(chatContainer); // Append container to body

    // Append CSS to the head
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = `${serverUrl}/styles.css`;
    document.head.appendChild(cssLink);

    // Fetch and append the JavaScript
    const scriptTag = document.createElement("script");
    scriptTag.src = `${serverUrl}/scripts.js`;
    document.body.appendChild(scriptTag);

    // Response handler
    const handler = document.createElement("script");
    handler.src = `${serverUrl}/incomingResponseHandler.js`;
    document.body.appendChild(handler);
  } catch (error) {
    console.error("Error embedding chat:", error);
  }
}
