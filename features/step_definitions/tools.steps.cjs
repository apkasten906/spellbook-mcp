const { Given } = require("@cucumber/cucumber");

Given("I print the world context", function () {
  // Avoid dumping large objects to the test runner stdout. When verbose logging is enabled,
  // write the world context to the cucumber verbose log file instead.
  if (process.env.LOG_MCP === "1") {
    try {
      const fs = require("fs");
      const path = require("path");
      const logDir = process.env.LOG_DIR || path.resolve(__dirname, "..", "mcp-starter", "logs");
      try {
        fs.mkdirSync(logDir, { recursive: true });
      } catch (e) {
        /* ignore */
      }
      const p = path.resolve(logDir, "cucumber-verbose.log");
      let body;
      try {
        body = JSON.stringify(this, null, 2);
      } catch (e) {
        body = "[unserializable world context]";
      }
      fs.appendFileSync(p, `${new Date().toISOString()} - World context:\n${body}\n`);
    } catch (e) {
      // If writing the file fails, fallback to a short console message.
      console.log("[TestWorld] (log write failed) World context available in debug log");
    }
  }
  if (typeof this.runTool !== "function") {
    throw new Error("runTool is not a function on World context");
  }
});
const { When, Then } = require("@cucumber/cucumber");
const assert = require("node:assert/strict");

function toText(x) {
  if (x == null) return "";
  if (typeof x === "string") return x;
  // Handle MCP content array format: [{ type: 'text', text: '...' }]
  if (Array.isArray(x) && x.length > 0 && x[0].type === "text") {
    return x.map((item) => item.text).join("\n");
  }
  return JSON.stringify(x);
}
function isMdList(val) {
  // Extract text from MCP content format if needed
  const text = toText(val);
  // Check if it's a newline-separated list of .md files
  if (typeof text === "string" && /\.md(\s|$)/i.test(text)) {
    return text.split("\n").every((line) => line.trim() === "" || line.endsWith(".md"));
  }
  return false;
}

/* WHENs */
When("I call the prompt_list tool with base {string}", async function (base) {
  this.lastResult = await this.runTool("prompt_list", { base });
});
When("I call the prompt_read tool with file {string}", async function (file) {
  this.lastResult = await this.runTool("prompt_read", { file });
});
When("I call the prompt_commands tool", async function () {
  this.lastResult = await this.runTool("prompt_commands", {});
});
When("I call the pdca_generate tool with phase {string} and artifact {string}", async function (phase, artifact) {
  this.lastResult = await this.runTool("pdca_generate", { phase, artifact });
});
When("I call the due_check tool with path {string} and format {string}", async function (path, format) {
  this.lastResult = await this.runTool("due_check", { path, format });
});
When("I call the retro_create tool with type {string} and window {string}", async function (type, window) {
  this.lastResult = await this.runTool("retro_create", { type, window });
});
When("I call the api_scaffold tool with name {string}", async function (name) {
  this.lastResult = await this.runTool("api_scaffold", { name });
});
When("I call the ci_configure tool with service {string} and env {string}", async function (service, env) {
  this.lastResult = await this.runTool("ci_configure", { service, env });
});
When("I call the tests_plan tool with scope {string} and target {string}", async function (scope, target) {
  this.lastResult = await this.runTool("tests_plan", { scope, target });
});
When("I call the rca_analyze tool with log {string}", async function (log) {
  this.lastResult = await this.runTool("rca_analyze", { log });
});
When("I call the arch_adr tool with system {string}", async function (system) {
  this.lastResult = await this.runTool("arch_adr", { system });
});

/* THENs */
Then("I should receive a list of markdown files", function () {
  // Some MCP servers return { content: [...] } — try to normalize
  const val = this.lastResult?.content ?? this.lastResult;
  if (!isMdList(val)) {
    const txt = toText(val);
    throw new Error(`Expected list of .md files, got: ${txt}`);
  }
});

Then("I should receive the contents of the file", function () {
  const val = this.lastResult?.content ?? this.lastResult;
  const txt = toText(val);
  if (!txt || txt.length === 0) throw new Error("Empty file contents");
  if (!/[#*_`-]|```/.test(txt)) throw new Error("Does not look like markdown");
});

Then("I should receive the contents of COMMANDS.md", function () {
  const val = this.lastResult?.content ?? this.lastResult;
  const txt = toText(val);
  if (!txt || txt.length === 0) throw new Error("Empty file contents");
  // COMMANDS.md should contain command listings
  if (!/command|slash|prompt/i.test(txt)) throw new Error("Does not look like COMMANDS.md content");
});

Then("the result should include {string}", function (snippet) {
  const val = this.lastResult?.content ?? this.lastResult;
  const txt = toText(val);
  if (!txt.includes(snippet)) {
    throw new Error(`Expected result to include "${snippet}", got: ${txt.slice(0, 400)}...`);
  }
});
Then("the result should be an error message mentioning {string}", function (term) {
  const val = this.lastResult?.content ?? this.lastResult;
  const txt = toText(val);
  if (!/error/i.test(txt) || !txt.toLowerCase().includes(term.toLowerCase())) {
    throw new Error(`Expected error message mentioning "${term}", got: ${txt.slice(0, 400)}...`);
  }
});
Then("the result should be a non-empty JSON array", function () {
  const val = this.lastResult?.content ?? this.lastResult;
  if (!Array.isArray(val) || val.length === 0) {
    const txt = toText(val);
    throw new Error(`Expected non-empty array, got: ${txt}`);
  }
});
Then("the result should be a non-empty JSON object", function () {
  const val = this.lastResult?.content ?? this.lastResult;
  if (typeof val !== "object" || val == null || Array.isArray(val) || Object.keys(val).length === 0) {
    const txt = toText(val);
    throw new Error(`Expected non-empty object, got: ${txt}`);
  }
});
Then("the result should be a non-empty string", function () {
  const val = this.lastResult?.content ?? this.lastResult;
  if (typeof val !== "string" || val.length === 0) {
    const txt = toText(val);
    throw new Error(`Expected non-empty string, got: ${txt}`);
  }
});
Then("the result should be a boolean true", function () {
  const val = this.lastResult?.content ?? this.lastResult;
  if (val !== true) {
    const txt = toText(val);
    throw new Error(`Expected boolean true, got: ${txt}`);
  }
});
Then("the result should be a boolean false", function () {
  const val = this.lastResult?.content ?? this.lastResult;
  if (val !== false) {
    const txt = toText(val);
    throw new Error(`Expected boolean false, got: ${txt}`);
  }
});
Then("the result should be a number greater than {int}", function (num) {
  const val = this.lastResult?.content ?? this.lastResult;
  if (typeof val !== "number" || !(val > num)) {
    const txt = toText(val);
    throw new Error(`Expected number > ${num}, got: ${txt}`);
  }
});
Then("the result should be a number greater than or equal to {int}", function (num) {
  const val = this.lastResult?.content ?? this.lastResult;
  if (typeof val !== "number" || !(val >= num)) {
    const txt = toText(val);
    throw new Error(`Expected number >= ${num}, got: ${txt}`);
  }
});
Then("the result should be a number less than {int}", function (num) {
  const val = this.lastResult?.content ?? this.lastResult;
  if (typeof val !== "number" || !(val < num)) {
    const txt = toText(val);
    throw new Error(`Expected number < ${num}, got: ${txt}`);
  }
});
Then("the result should be a number less than or equal to {int}", function (num) {
  const val = this.lastResult?.content ?? this.lastResult;
  if (typeof val !== "number" || !(val <= num)) {
    const txt = toText(val);
    throw new Error(`Expected number <= ${num}, got: ${txt}`);
  }
});
Then("the result should be a valid JSON", function () {
  const val = this.lastResult?.content ?? this.lastResult;
  if (val == null) throw new Error("Expected valid JSON, got null/undefined");
  if (typeof val === "string") {
    try {
      JSON.parse(val);
    } catch (e) {
      throw new Error(`Expected valid JSON, got parse error: ${e.message}`);
    }
  } else if (typeof val !== "object") {
    const txt = toText(val);
    throw new Error(`Expected valid JSON object/array/string, got: ${txt}`);
  }
});
