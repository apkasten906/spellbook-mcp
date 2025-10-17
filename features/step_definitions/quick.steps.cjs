const { Given, When, Then } = require("@cucumber/cucumber");

Given("the MCP server is running", async function () {
  // Ensure the MCP client/server machinery is started for tests
  await this.startClient();
});

When("I call the {string} tool", async function (toolName) {
  // Generic caller for tools that take no args in this quick smoke
  this.lastResult = await this.runTool(toolName, {});
});

Then("I should receive a non-empty list of prompts", function () {
  const val = this.lastResult?.content ?? this.lastResult;
  if (Array.isArray(val) && val.length > 0) return;
  // Some MCP responses wrap content in { content: [...] }
  if (val && typeof val === "object" && Array.isArray(val.content) && val.content.length > 0) return;
  const txt = typeof val === "string" ? val : JSON.stringify(val);
  throw new Error(`Expected non-empty list of prompts, got: ${txt}`);
});
