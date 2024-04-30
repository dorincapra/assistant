document
  .getElementById("chat-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const userInput = document.getElementById("user-input").value.trim();
    if (userInput === "") return;

    // Append user's message to chat area inside a span within a paragraph
    const userParagraph = document.createElement("p");
    userParagraph.classList.add("userP");
    const userMessageSpan = document.createElement("span");
    userMessageSpan.classList.add("user-message");
    userMessageSpan.textContent = `Tu: ${userInput}`;
    userParagraph.appendChild(userMessageSpan);
    const chatArea = document.getElementById("chat-area");
    chatArea.appendChild(userParagraph);

    // Clear input field
    document.getElementById("user-input").value = "";

    //scroll down
    chatArea.scrollTop = chatArea.scrollHeight;

    // Fetch response from server
    try {
      const response = await fetch("/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ userInput: userInput }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const reader = response.body.getReader();
      let lastParagraph = document.createElement("p");
      let lastSpan = document.createElement("span");
      lastSpan.className = "assistant-message";
      lastParagraph.appendChild(lastSpan);
      chatArea.appendChild(lastParagraph);
      let isFirstChunk = true;
      let firstDeltaReceived = false;
      let initialText = "";

      function handleStream(data) {
        if (data.type === "textCreated" && isFirstChunk) {
          initialText = data.text.value;
          lastSpan.textContent = `Asistent: ${initialText.replace(
            /\【.*?\】/g,
            ""
          )}`;
          isFirstChunk = false; // Now handle subsequent deltas normally
        } else if (data.type === "textDelta") {
          if (!firstDeltaReceived && data.textDelta === initialText) {
            // If the first delta is identical to the initial text, ignore it
            firstDeltaReceived = true; // Mark the first delta as received
          } else {
            lastSpan.textContent += data.textDelta.replace(/\【.*?\】/g, "");
          }
        }
      }

      reader.read().then(function processText({ done, value }) {
        if (done) {
          lastParagraph.classList.add("complete");
          return;
        }
        const chunk = new TextDecoder().decode(value, { stream: true });
        const jsonChunks = chunk.match(/\{.*?\}(?=\{)|\{.*?\}$/g);
        if (jsonChunks) {
          jsonChunks.forEach((json) => {
            try {
              const data = JSON.parse(json);
              handleStream(data);
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          });
        }
        chatArea.scrollTop = chatArea.scrollHeight;
        return reader.read().then(processText);
      });
    } catch (error) {
      console.error("A apărut o eroare:", error);
      const errorParagraph = document.createElement("p");
      errorParagraph.textContent = `A apărut o eroare: ${error.message}`;
      chatArea.appendChild(errorParagraph);
      chatArea.scrollTop = chatArea.scrollHeight;
    }
  });
