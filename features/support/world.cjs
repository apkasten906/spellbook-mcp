const { setWorldConstructor } = require('@cucumber/cucumber');
const { McpClient } = require('./mcp-client.cjs');

class TestWorld {
  constructor() {
    this.client = null;
    this.lastResult = undefined;
    // Let you override command via env if needed
    const testEnv = { ...process.env };

    // If verbose logging is requested for acceptance:logging, write TestWorld logs to a file
    if (testEnv.LOG_MCP === '1') {
      const fs = require('fs');
      const path = require('path');
      // Only announce the verbose log path once per test run
      if (!global.__TESTWORLD_VERBOSE_ANNOUNCED) {
        this._testLogPath = path.resolve(process.cwd(), 'cucumber-verbose.log');
        this._testLogStream = fs.createWriteStream(this._testLogPath, { flags: 'a' });
        // Print the file location once so CI or local users know where to look
        console.log(`[TestWorld] Verbose cucumber logging enabled. Writing to: ${this._testLogPath}`);
        this._testLogStream.write(`${new Date().toISOString()} - [TestWorld] Initializing TestWorld\n`);
        this._testLogStream.write(`${new Date().toISOString()} - [TestWorld] Raw LOG_MCP value: ${testEnv.LOG_MCP}\n`);
        this._testLogStream.write(`${new Date().toISOString()} - [TestWorld] Raw MCP_CMD value: ${testEnv.MCP_CMD}\n`);
        this._testLogStream.write(`${new Date().toISOString()} - [TestWorld] Raw MCP_ARGS value: ${testEnv.MCP_ARGS}\n`);
        global.__TESTWORLD_VERBOSE_ANNOUNCED = true;
      } else {
        // If the stream wasn't created yet in the first instance, create it so later instances can write
        if (!this._testLogStream) {
          const p = path.resolve(process.cwd(), 'cucumber-verbose.log');
          this._testLogPath = p;
          this._testLogStream = fs.createWriteStream(this._testLogPath, { flags: 'a' });
        }
      }
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
      // Announce server-side MCP log path from parent process (avoids PowerShell RemoteException)
      if (testEnv.LOG_MCP === '1' && !global.__MCP_LOG_ANNOUNCED) {
        const logPath = testEnv.LOG_MCP_LOG_PATH || require('path').resolve(__dirname, '..', 'mcp-starter', 'mcp-logging.log');
        console.log(`[MCP] Server log file: ${logPath}`);
        global.__MCP_LOG_ANNOUNCED = true;
      }
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
    if (testEnv.LOG_MCP === '1' && this._testLogStream) {
      this._testLogStream.write(`${new Date().toISOString()} - [TestWorld] Running tool: ${name} with args: ${JSON.stringify(args)}\n`);
    }
    const res = await this.client.callTool(name, args);
    if (testEnv.LOG_MCP === '1' && this._testLogStream) {
      this._testLogStream.write(`${new Date().toISOString()} - [TestWorld] Received response: ${JSON.stringify(res)}\n`);
    }
    this.lastResult = res;
    return res;
  }
}

setWorldConstructor(TestWorld);
