const { setWorldConstructor } = require('@cucumber/cucumber');
const { McpClient } = require('./mcp-client.cjs');

class TestWorld {
  constructor() {
    this.client = null;
    this.lastResult = undefined;
    // Let you override command via env if needed
    this.mcpCmd = process.env.MCP_CMD || 'node';
  this.mcpArgs = (process.env.MCP_ARGS && JSON.parse(process.env.MCP_ARGS)) || ['mcp-starter/server.js'];
  }

  async startClient() {
    if (!this.client) {
      this.client = new McpClient(this.mcpCmd, this.mcpArgs, { env: process.env });
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
    const res = await this.client.callTool(name, args);
    this.lastResult = res;
    return res;
  }
}

setWorldConstructor(TestWorld);
