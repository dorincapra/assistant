import express from "express";
import { OpenAI } from "openai";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname in ES module scope
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000; // Use the PORT environment variable if provided, otherwise default to 3000

app.use(express.urlencoded({ extended: true }));

// Allow CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Main page
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

    const message = await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userInput,
    });

    const run = openai.beta.threads.runs
      .stream(thread.id, {
        assistant_id: asstID,
      })
      .on("textCreated", (text) => res.write("\nassistant > "))
      .on("textDelta", (textDelta, snapshot) => res.write(textDelta.value))
      .on("toolCallDelta", (toolCallDelta, snapshot) => {
        if (toolCallDelta.type === "file_search") {
          if (toolCallDelta.file_search.input) {
            // Add appropriate handling
          }
          if (toolCallDelta.file_search.outputs) {
            res.write("\noutput >\n");
            toolCallDelta.file_search.outputs.forEach((output) => {
              if (output.type === "logs") {
                // Add appropriate handling
              }
            });
          }
        }
      });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while processing the request.");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://your-droplet-ip:${port}`);
});
