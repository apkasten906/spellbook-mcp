const { After, AfterAll, setDefaultTimeout } = require("@cucumber/cucumber");

// Increase default step timeout from 5s to 5 minutes to accommodate longer tool calls run via MCP
setDefaultTimeout(5 * 60 * 1000);

// Clean up after each scenario to prevent hanging processes
After(async function () {
  if (this.stopClient) {
    await this.stopClient();
  }
});

// Final cleanup after all tests
AfterAll(async function () {
  if (this.stopClient) {
    await this.stopClient();
  }
});
