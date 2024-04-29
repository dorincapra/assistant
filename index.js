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

// Serve the JavaScript code
app.get("/script-chat.js", (req, res) => {
  const scriptContent = `
    document.addEventListener('DOMContentLoaded', function() {
      const chatContainer = document.getElementById('chat-container');
      const toggleChatBtn = document.getElementById('toggle-chat-btn');
      const closeChatBtn = document.getElementById('close-chat-btn');
      const chatForm = document.getElementById('chat-form');
      const chatArea = document.getElementById('chat-area');
      const userInputField = document.getElementById('user-input');

      function appendMessage(role, content) {
        const messageWrapper = document.createElement('p');
        const message = document.createElement('span');
        message.classList.add(role, 'complete');
        message.textContent = role + ": " + content;
        messageWrapper.appendChild(message);
        chatArea.appendChild(messageWrapper);
        chatArea.scrollTop = chatArea.scrollHeight; // Scroll to the bottom
      }

      toggleChatBtn.addEventListener('click', function() {
        chatContainer.classList.toggle('chat-hidden');
      });

      closeChatBtn.addEventListener('click', function() {
        chatContainer.classList.add('chat-hidden');
      });

      chatForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const input = userInputField.value.trim();

        if (!input) return;

        appendMessage('User', input);
        userInputField.value = '';

        fetch('/assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userInput: input }),
        })
          .then(response => response.body)
          .then(bodyStream => {
            const reader = bodyStream.getReader();
            reader.read().then(function processText({ done, value }) {
              if (done) return;

              const response = new TextDecoder().decode(value);
              const jsonResponse = JSON.parse(response);
              if (jsonResponse.type === 'textCreated') {
                appendMessage('Assistant', jsonResponse.text);
              } else if jsonResponse.type === 'textDelta') {
                appendMessage('Assistant', jsonResponse.textDelta);
              }

              reader.read().then(processText);
            });
          })
          .catch(console.error);
      });
    });
  `;

  res.setHeader("Content-Type", "application/javascript");
  res.send(scriptContent);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
