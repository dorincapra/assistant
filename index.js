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

// Define the script-chat.js route
app.get("/script-chat.js", (req, res) => {
  const scriptContent = `
    (function () {
      const createChatHTML = () => {
        const container = document.createElement("div");
        container.id = "chat-container";
        container.classList.add("chat-hidden");

        const closeButton = document.createElement("button");
        closeButton.id = "close-chat-btn";
        closeButton.style.position = "absolute";
        closeButton.style.top = "10px";
        closeButton.style.right = "10px";
        closeButton.style.fontSize = "24px";
        closeButton.style.border = "none";
        closeButton.style.background = "none";
        closeButton.style.cursor = "pointer";

        const closeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
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

        const header = document.createElement("h3");
        header.textContent = "Chat Assistant";
        header.style.textAlign = "center";
        container.appendChild(header);

        const chatArea = document.createElement("div");
        chatArea.id = "chat-area";
        chatArea.style.height = "200px";
        chatArea.style.overflowY = "auto";
        chatArea.style.border = "1px solid #ccc";
        container.appendChild(chatArea);

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
        sendButton textContent = "Send";
        form.appendChild(sendButton);

        container.appendChild(form);

        document.body.appendChild(container);

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

        return { container, toggleButton, form, input, chatArea, closeButton };
      };

      const { container, toggleButton, form, input, chatArea, closeButton } = createChatHTML();

      toggleButton.addEventListener("click", () => {
        container.classList.toggle("chat-shown");
        toggleButton.classList.toggle("chat-hidden");
      });

      closeButton.addEventListener("click", () => {
        container.classList.toggle("chat-shown");
        toggleButton.classList.toggle("chat-hidden");
      });

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const userMessage = input.value.trim();
        if (!userMessage) return;

        const userMsgElement = document.createElement("p");
        userMsgElement.textContent = \`You: \${userMessage}\`;
        chatArea.appendChild(userMsgElement);

        input.value = "";

        try {
          const response = await fetch("http://your-server.com/assistant", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ userInput: userMessage }),
          });

          const { response: aiResponse } = await response.json();

          const aiMsgElement = document.createElement("p");
          aiMsgElement.textContent = \`AI: \${aiResponse}\`;
          chatArea.appendChild(aiMsgElement);
        } catch (err) {
          console.error("Error fetching response:", err);
          const errorMsgElement = document.createate("p");
          errorMsgElement.textContent = \`Error: \${err.message}\`;
          chatArea.appendChild(errorMsgElement);
        }
      });
    })();
    `;

  res.setHeader("Content-Type", "application/javascript");
  res.send(scriptContent);
}); // Define the script-chat.js route
app.get("/script-chat.js", (req, res) => {
  const scriptContent = `
    (function () {
      const createChatHTML = () => {
        const container = document.createElement("div");
        container.id = "chat-container";
        container.classList.add("chat-hidden");

        const closeButton = document.createElement("button");
        closeButton.id = "close-chat-btn";
        closeButton.style.position = "absolute";
        closeButton.style.top = "10px";
        closeButton.style.right = "10px";
        closeButton.style.fontSize = "24px";
        closeButton.style.border = "none";
        closeButton.style.background = "none";
        closeButton.style.cursor = "pointer";

        const closeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
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

        const header = document.createElement("h3");
        header.textContent = "Chat Assistant";
        header.style.textAlign = "center";
        container.appendChild(header);

        const chatArea = document.createElement("div");
        chatArea.id = "chat-area";
        chatArea.style.height = "200px";
        chatArea.style.overflowY = "auto";
        chatArea.style.border = "1px solid #ccc";
        container.appendChild(chatArea);

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
        sendButton textContent = "Send";
        form.appendChild(sendButton);

        container.appendChild(form);

        document.body.appendChild(container);

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

        return { container, toggleButton, form, input, chatArea, closeButton };
      };

      const { container, toggleButton, form, input, chatArea, closeButton } = createChatHTML();

      toggleButton.addEventListener("click", () => {
        container.classList.toggle("chat-shown");
        toggleButton.classList.toggle("chat-hidden");
      });

      closeButton.addEventListener("click", () => {
        container.classList.toggle("chat-shown");
        toggleButton.classList.toggle("chat-hidden");
      });

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const userMessage = input.value.trim();
        if (!userMessage) return;

        const userMsgElement = document.createElement("p");
        userMsgElement.textContent = \`You: \${userMessage}\`;
        chatArea.appendChild(userMsgElement);

        input.value = "";

        try {
          const response = await fetch("http://https://assistant-w8kxd.ondigitalocean.app/assistant", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ userInput: userMessage }),
          });

          const { response: aiResponse } = await response.json();

          const aiMsgElement = document.createElement("p");
          aiMsgElement.textContent = \`AI: \${aiResponse}\`;
          chatArea.appendChild(aiMsgElement);
        } catch (err) {
          console.error("Error fetching response:", err);
          const errorMsgElement = document.createate("p");
          errorMsgElement.textContent = \`Error: \${err.message}\`;
          chatArea.appendChild(errorMsgElement);
        }
      });
    })();
    `;

  res.setHeader("Content-Type", "application/javascript");
  res.send(scriptContent);
});
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
