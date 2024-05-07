import express from "express";
import { OpenAI } from "openai";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import cors from "cors";

// Define __dirname in ES module scope
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS options
const corsOptions = {
  origin: "https://calculatorleasing.ro", // Allow only this origin to access
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Apply CORS middleware before any other route or middleware
app.use(cors(corsOptions));

// Middleware for static files
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse URL-encoded and JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root route to serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

let thread = null;

// POST endpoint for handling chat requests
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

// Server static JavaScript file for chat UI
app.get("/script-chat.js", (req, res) => {
  const scriptContent = `
    // Create container element
    const container = document.createElement("div");
    container.id = "chat-container";
    container.classList.add("chat-hidden");
    // Code for setting up chat UI omitted for brevity
  `;

  res.setHeader("Content-Type", "application/javascript");
  res.send(scriptContent);
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
