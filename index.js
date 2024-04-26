import express from "express";
import { OpenAI } from "openai";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname in ES module scope
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Make sure the server can parse JSON bodies

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

    if (!thread) {
      thread = await openai.beta.threads.create();
    }

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userInput,
    });

    const run = openai.beta.threads.runs
      .stream(thread.id, {
        assistant_id: asstID,
      })
      .on("textCreated", (text) => {
        res.write(JSON.stringify({ type: "textCreated", text: text }));
      })
      .on("textDelta", (textDelta, snapshot) => {
        res.write(
          JSON.stringify({ type: "textDelta", textDelta: textDelta.value })
        );
      })
      .on("complete", () => {
        res.end();
      });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while processing the request.");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
