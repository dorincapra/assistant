// public/embedChat.js
function embedChat(serverUrl) {
  // Fetch the HTML content
  fetch(`${serverUrl}/index.html`)
    .then((response) => response.text())
    .then((htmlContent) => {
      // Create a container div for the chat UI
      const container = document.createElement("div");
      container.innerHTML = htmlContent;

      // Append the container to the body
      document.body.appendChild(container);

      // Fetch and append the CSS
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = `${serverUrl}/styles.css`;
      document.head.appendChild(cssLink);

      // Fetch and append the JavaScript
      const scriptTag = document.createElement("script");
      scriptTag.src = `${serverUrl}/script.js`;
      document.body.appendChild(scriptTag);
    })
    .catch((error) => console.error("Error embedding chat:", error));
}
