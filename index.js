import express from "express";
import { OpenAI } from "openai";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import { generateScript } from "./utils"; // Ensure this path points to your utility file

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

// Serve the chat script dynamically
app.get("/chat-script.js", (req, res) => {
  const scriptContent = generateScript(); // Generate the script content dynamically
  res.setHeader("Content-Type", "application/javascript");
  res.send(scriptContent);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
