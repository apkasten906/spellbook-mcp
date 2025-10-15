const { setWorldConstructor } = require('@cucumber/cucumber');
const { McpClient } = require('./mcp-client.cjs');

class TestWorld {
  constructor() {
    this.client = null;
    this.lastResult = undefined;
    // Let you override command via env if needed
    const testEnv = { ...process.env };
    if (testEnv !== undefined && testEnv.LOG_MCP === '1') {
      console.log('[TestWorld] Initializing TestWorld');
      console.log(`[TestWorld] Raw LOG_MCP value: ${testEnv.LOG_MCP}`);
      console.log(`[TestWorld] Raw MCP_CMD value: ${testEnv.MCP_CMD}`);
      console.log(`[TestWorld] Raw MCP_ARGS value: ${testEnv.MCP_ARGS}`);
    }
    this.mcpCmd = testEnv.MCP_CMD || 'node';
    this.mcpArgs = (testEnv.MCP_ARGS && JSON.parse(testEnv.MCP_ARGS)) || ['mcp-starter/server.js'];
  }

  async startClient() {
    if (!this.client) {
      // Only pass LOG_MCP if explicitly set to '1' via npm run acceptance:logging
      // Otherwise filter it out to prevent logging during normal test runs
      const testEnv = { ...process.env };
      if (testEnv.LOG_MCP !== '1') {
        delete testEnv.LOG_MCP;
      }
      this.client = new McpClient(this.mcpCmd, this.mcpArgs, { env: testEnv });
      await this.client.start();
    }
  }

  async stopClient() {
    if (this.client) {
      await this.client.stop();
      this.client = null;
    }
  }

  async runTool(name, args) {
    await this.startClient();
    const testEnv = { ...process.env };
    if (testEnv.LOG_MCP === '1') {
      console.log(`[TestWorld] Running tool: ${name} with args:`, args);
    }
    const res = await this.client.callTool(name, args);
    if (testEnv.LOG_MCP === '1') {
      console.log(`[TestWorld] Received response:`, res);
    }
    this.lastResult = res;
    return res;
  }
}

setWorldConstructor(TestWorld);
