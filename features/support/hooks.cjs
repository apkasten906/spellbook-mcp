const { Before, AfterAll } = require('@cucumber/cucumber');

Before(async function () {
  await this.startClient();
});

AfterAll(function () {
  return this.stopClient && this.stopClient();
});
