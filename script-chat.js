// Import the 'fs' module to handle file system operations
import { readFileSync } from "fs";

// Function to read file content
function readFileContent(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
    return content;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Paths to your files
const htmlFile = "./public/index.html";
const cssFile = "./public/styles.css";
const scripts = "./public/scripts.js";
const handler = "./public/incomingResponseHandler.js";
// Reading the content of the files
const htmlContent = readFileContent(htmlFile);
const cssContent = readFileContent(cssFile);
const scriptsContent = readFileContent(scripts);
const handlerContent = readFileContent(handler);

// Output the content of the files
console.log("HTML Content:\n", htmlContent, "\n");
console.log("CSS Content:\n", cssContent, "\n");
console.log("JavaScript Content:\n", scriptsContent, "\n");
console.log("JavaScript Content:\n", handlerContent, "\n");
