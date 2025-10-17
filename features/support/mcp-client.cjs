// Use the official MCP SDK client instead of custom implementation
let Client, StdioClientTransport;

// Dynamic import workaround for ESM in CommonJS
async function loadMcpSdk() {
  if (!Client) {
    const clientModule = await import("@modelcontextprotocol/sdk/client/index.js");
    const transportModule = await import("@modelcontextprotocol/sdk/client/stdio.js");
    Client = clientModule.Client;
    StdioClientTransport = transportModule.StdioClientTransport;
  }
}

class McpClient {
  constructor(cmd = "node", args = ["server.js"], opts = {}) {
    this.cmd = cmd;
    this.args = args;
    this.env = { ...process.env, ...opts.env };
    this.client = null;
    this.transport = null;
  }

  async start() {
    if (this.client) return;

    await loadMcpSdk();

    this.transport = new StdioClientTransport({
      command: this.cmd,
      args: this.args,
      env: this.env,
    });

    this.client = new Client(
      {
        name: "cucumber-test-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      },
    );

    await this.client.connect(this.transport);
  }

  async stop() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.transport = null;
    }
  }

  async callTool(name, args) {
    if (!this.client) {
      throw new Error("Client not started");
    }
    return await this.client.callTool({ name, arguments: args });
  }

  async listTools() {
    if (!this.client) {
      throw new Error("Client not started");
    }
    return await this.client.listTools();
  }
}

module.exports = { McpClient };
