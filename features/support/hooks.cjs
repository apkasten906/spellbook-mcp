const { After, AfterAll } = require('@cucumber/cucumber');

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
