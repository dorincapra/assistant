import fs from "fs";

function generateScript() {
  // JavaScript snippet to embed in client's website
  const scriptContent = `
    (function() {
        const chatContainer = document.createElement('div');
        chatContainer.id = 'chat-container';
        chatContainer.style.position = 'fixed';
        chatContainer.style.width = '96%';
        chatContainer.style.height = '96%';
        chatContainer.style.left = '2%';
        chatContainer.style.top = '2%';
        chatContainer.style.background = '#fff';
        chatContainer.style.borderRadius = '10px';
        chatContainer.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
        chatContainer.style.overflow = 'hidden';
        chatContainer.style.display = 'none';

        document.body.appendChild(chatContainer);

        const closeBtn = document.createElement('button');
        closeBtn.id = 'close-chat-btn';
        closeBtn.innerHTML = 'X';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.fontSize = '24px';
        closeBtn.style.border = 'none';
        closeBtn.style.background = 'none';
        closeBtn.style.cursor = 'pointer';
        chatContainer.appendChild(closeBtn);

        const chatArea = document.createElement('div');
        chatArea.id = 'chat-area';
        chatArea.style.overflowY = 'auto';
        chatArea.style.flexGrow = '1';
        chatArea.style.padding = '20px';
        chatContainer.appendChild(chatArea);

        const chatForm = document.createElement('form');
        chatForm.id = 'chat-form';
        chatForm.style.position = 'absolute';
        chatForm.style.bottom = '0';
        chatForm.style.left = '0';
        chatForm.style.right = '0';
        chatForm.style.background = '#f0f0f0';
        chatContainer.appendChild(chatForm);

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.name = 'userInput';
        inputField.style.flex = '1';
        inputField.style.padding = '10px';
        chatForm.appendChild(inputField);

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.innerHTML = 'Send';
        submitBtn.style.padding = '10px 20px';
        submitBtn.style.background = '#007bff';
        submitBtn.style.color = '#fff';
        submitBtn.style.border = 'none';
        chatForm.appendChild(submitBtn);

        chatForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const userInput = inputField.value.trim();
            if (!userInput) return;

            const userP = document.createElement('p');
            const userMsg = document.createElement('span');
            userMsg.textContent = \`You: \${userInput}\`;
            userP.appendChild(userMsg);
            chatArea.appendChild(userP);
            chatArea.scrollTop = chatArea.scrollHeight;

            try {
                const response = await fetch("/assistant", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({ userInput: userInput })
                });
                const resText = await response.json();

                const assistantP = document.createElement('p');
                const assistantMsg = document.createElement('span');
                assistantMsg.textContent = \`Assistant: \${resText.text}\`;
                assistantP.appendChild(assistantMsg);
                chatArea.appendChild(assistantP);
                chatArea.scrollTop = chatArea.scrollHeight;
            } catch (error) {
                const errP = document.createlement("p");
                errP.textContent = "Error: ${error.message}"
                chatArea.append(errP)
            }
        });

        const toggleBtn = document.createlement("button")
        toggleBtn.textContent = "Chat"
        document.body.append()

    })`;

  return `
    <script src="/"></script>
    `;
}

export default generateScript;
