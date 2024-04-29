import express from "express";
import { OpenAI } from "openai";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

// Define __dirname in ES module scope
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Make sure the server can parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

let thread = null;

app.post("/assistant", async (req, res) => {
  const userInput = req.body.userInput;

  try {
    const openai = new OpenAI();
    const asstID = "asst_qVaITkJsmfVNGzdv05Rm2izr";

    // Create a thread if none exists
    if (!thread) {
      thread = await openai.beta.threads.create();
    }

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userInput,
    });

    // Stream responses back to the client
    const run = openai.beta.threads.runs.stream(thread.id, {
      assistant_id: asstID,
    });

    run
      .on("textCreated", (text) => {
        res.write(JSON.stringify({ type: "textCreated", text: text.value }));
      })
      .on("textDelta", (textDelta) => {
        res.write(
          JSON.stringify({ type: "textDelta", textDelta: textDelta.value })
        );
      })
      .on("complete", () => {
        res.end();
      });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .send({ error: "An error occurred while processing the request." });
  }
});

app.get("/script-chat.js", (req, res) => {
  const scriptContent = `
    document.getElementById("chat-form").addEventListener("submit", async function (event) {
      event.preventDefault();

      const userInput = document.getElementById("user-input"). value.trim();
      if (userInput === "") return;

      // Append user's message to the chat area inside a span within a paragraph
      const userParagraph = document.createElement("p");
      userParagraph.classList.add("userP");
      const userMessageSpan = document.createElement("span");
      userMessageSpan.classList.add("user-message");
      userMessageSpan.textContent = \`Tu: \${userInput}\`;
      userParagraph.appendChild(userMessageSpan);
      const chatArea = document.getElementById("chat-area");
      chatArea.appendChild(userParagraph);

      // Clear the input field
      document.getElementById("user-input"). value = "";

      // Scroll down
      chatArea.scrollTop = chatArea.scrollHeight;

      try {
        const response = await fetch("/assistant", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ userInput: userInput }),
        });

        if (!response.ok) {
          throw new Error(\`Server responded with status \${response.status}\`);
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
            lastSpan.textContent = \`Asistent: \${initialText.replace(
              /\\【.*?\\】/g,
              ""
            )}\`;
            isFirstChunk = false;
          } else if (data.type === "textDelta") {
            if (!firstDeltaReceived && data.textDelta === initialText) {
              firstDeltaReceived = true;
            } else {
              lastSpan.textContent += data.textDelta.replace(/\\【.*?\\】/g, "");
            }
          }
        }

        reader.read().then(function processText({ done, value }) {
          if (done) {
            lastParagraph.classList.add("complete");
            return;
          }
          const chunk = new TextDecoder().decode(value, { stream: true });
          const jsonChunks = chunk.match(/\\{.*?\\}(?=\\{)|\\{.*?\\}$/g);
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
        errorParagraph.textContent = \`A apărut o eroare: \${error.message}\`;
        chatArea.appendChild(errorParagraph);
        chatArea.scrollTop = chatArea.scrollHeight;
      }
    });

    document.getElementById("toggle-chat-btn").addEventListener("click", function() {
      var chatContainer = document.getElementById("chat-container");
      chatContainer.classList.add("chat-shown");
      this.classList.add("chat-hidden");
    });

    document.getElementById("close-chat-btn").addEventListener("click", function() {
      var chatContainer = document.getElementById("chat-container");
      chatContainer.classList.remove("chat-shown");
      document.getElementById("toggle-chat-btn").classList.remove("chat-hidden");
    });
  `;

  res.setHeader("Content-Type", "application/javascript");
  res.send(scriptContent);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
