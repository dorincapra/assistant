// chat-bubble.js
(function () {
  const createChatHTML = () => {
    // Create the main chat container
    const container = document.createElement("div");
    container.id = "chat-container";
    container.classList.add("chat-hidden");
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.right = "20px";
    container.style.width = "300px";
    container.style.background = "#fff";
    container.style.border = "1px solid #ccc";
    container.style.borderRadius = "8px";
    container.style.padding = "10px";
    container.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";

    // Create a button to close the chat
    const closeButton = document.createElement("button");
    closeButton.id = "close-chat-btn";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.fontSize = "24px";
    closeButton.style.border = "none";
    closeButton.style.background = "none";
    closeButton.style.cursor = "pointer";

    const closeSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    closeSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    closeSvg.setAttribute("fill", "none");
    closeSvg.setAttribute("viewBox", "0 0 24 24");
    closeSvg.setAttribute("stroke-width", "1.5");
    closeSvg.setAttribute("stroke", "currentColor");
    closeSvg.style.width = "1.5rem";
    closeSvg.style.padding = "0.5rem";

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("d", "M6 18 18 6M6 6l12 12");

    closeSvg.appendChild(path);
    closeButton.appendChild(closeSvg);
    container.appendChild(closeButton);

    // Create the header
    const header = document.createElement("h3");
    header.textContent = "Chat Assistant";
    header.style.textAlign = "center";
    container.appendChild(header);

    // Create chat area
    const chatArea = document.createElement("div");
    chatArea.id = "chat-area";
    chatArea.style.height = "200px";
    chatArea.style.overflowY = "auto";
    chatArea.style.border = "1px solid #ccc";
    container.appendChild(chatArea);

    // Create input form
    const form = document.createElement("form");
    form.id = "chat-form";
    form.style.marginTop = "10px";

    const input = document.createElement("input");
    input.type = "text";
    input.id = "user-input";
    input.placeholder = "Your message...";
    input.style.width = "80%";
    form.appendChild(input);

    const sendButton = document.createElement("button");
    sendButton.textContent = "Send";
    form.appendChild(sendButton);

    container.appendChild(form);
    document.body.appendChild(container);

    // Create a toggle button to show/hide the chat
    const toggleButton = document.createElement("button");
    toggleButton.id = "toggle-chat-btn";
    toggleButton.textContent = "Chat";
    toggleButton.style.position = "fixed";
    toggleButton.style.bottom = "20px";
    toggleButton.style.right = "20px";
    toggleButton.style.background = "#007bff";
    toggleButton.style.color = "#fff";
    toggleButton.style.border = "none";
    toggleButton.style.borderRadius = "4px";
    document.body.appendChild(toggleButton);

    return { container, toggleButton, form, input, chatArea };
  };

  const { container, toggleButton, form, input, chatArea } = createChatHTML();

  toggleButton.addEventListener("click", () => {
    container.classList.toggle("chat-hidden");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userMessage = input.value.trim();
    if (!userMessage) return;

    // Display user's message
    const userMsgElement = document.createElement("p");
    userMsgElement.textContent = `You: ${userMessage}`;
    chatArea.appendChild(userMsgElement);

    input.value = "";

    try {
      // Send the message to the server and get the response
      const response = await fetch("http://your-server.com/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInput: userMessage }),
      });

      const { response: aiResponse } = await response.json();

      // Display AI's response
      const aiMsgElement = document.createElement("p");
      aiMsgElement.textContent = `AI: ${aiResponse}`;
      chatArea.appendChild(aiMsgElement);
    } catch (err) {
      console.error("Error fetching response:", err);
    }
  });

  closeButton.addEventListener("click", () => {
    container.classList.toggle("chat-hidden");
  });
})();
