import OpenAI from "openai";
const openai = new OpenAI();

const asstID = "asst_qVaITkJsmfVNGzdv05Rm2izr";

const thread = await openai.beta.threads.create(
  "sk-proj-"
);
console.log(thread);
const message = await openai.beta.threads.messages.create(thread.id, {
  role: "user",
  content: "Zi-mi cum te cheama",
});

const run = openai.beta.threads.runs
  .stream(thread.id, {
    assistant_id: asstID,
  })
  .on("textCreated", (text) => process.stdout.write("\nassistant > "))
  .on("textDelta", (textDelta, snapshot) =>
    process.stdout.write(textDelta.value)
  )
  .on("toolCallCreated", (toolCall) =>
    process.stdout.write(`\nassistant > ${toolCall.type}\n\n`)
  )
  .on("toolCallDelta", (toolCallDelta, snapshot) => {
    if (toolCallDelta.type === "file_search") {
      if (toolCallDelta.code_interpreter.input) {
        process.stdout.write(toolCallDelta.code_interpreter.input);
      }
      if (toolCallDelta.code_interpreter.outputs) {
        process.stdout.write("\noutput >\n");
        toolCallDelta.code_interpreter.outputs.forEach((output) => {
          if (output.type === "logs") {
            process.stdout.write(`\n${output.logs}\n`);
          }
        });
      }
    }
  });
