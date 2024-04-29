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

  // Create container element
  const container = document.createElement("div");
  container.id = "chat-container";
  container.classList.add("chat-hidden");

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.id = "close-chat-btn";
  closeButton.innerHTML = '
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6" style="width: 1.8rem">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  ';
  closeButton.style.position = "absolute";
  closeButton.style.top = "10px";
  closeButton.style.right = "10px";
  closeButton.style.fontSize = "24px";
  closeButton.style.border = "none";
  closeButton.style.background = "none";
  closeButton.style.cursor = "pointer";
  container.appendChild(closeButton);

  // Create header
  const header = document.createElement("div");
  header.id = "header";
  header.innerHTML = "<h1 style='text-align: center; margin-bottom: 0'>ChatGPT</h1>";
  container.appendChild(header);

  // Create chat area
  const chatArea = document.createElement("div");
  chatArea.id = "chat-area";
  chatArea.style.overflowY = "auto";
  chatArea.style.flexGrow = "1";
  container.appendChild(chatArea);

  // Create form
  const form = document.createElement("form");
  form.id = "chat-form";
  form.style.flexShrink = "0";
  form.innerHTML = '
    <input type="text" id="user-input" name="userInput" placeholder="Introdu întrebarea ta:" />
    <button type="submit">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 1rem">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
      </svg>
    </button>
  ';
  container.appendChild(form);

  // Create toggle button
  const toggleButton = document.createElement("button");
  toggleButton.id = "toggle-chat-btn";
  toggleButton.innerHTML = '
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6" style="width: 1.8rem">
      <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  ';
  toggleButton.style.position = "fixed";
  toggleButton.style.bottom = "20px";
  toggleButton.style.right = "20px";
  toggleButton.style.width = "60px";
  toggleButton.style.height = "60px";
  toggleButton.style.borderRadius = "50%";
  toggleButton.style.backgroundColor = "#007bff";
  toggleButton.style.color = "white";
  toggleButton.style.fontSize = "16px";
  toggleButton.style.border = "none";
  toggleButton.style.cursor = "pointer";
  toggleButton.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
  container.appendChild(toggleButton);

  // Append the container to the body
  document.body.appendChild(container);

  `;

  res.setHeader("Content-Type", "application/javascript");
  res.send(scriptContent);
});
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
