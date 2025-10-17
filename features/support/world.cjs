const { setWorldConstructor } = require("@cucumber/cucumber");
const { McpClient } = require("./mcp-client.cjs");

class TestWorld {
  constructor() {
    this.client = null;
    this.lastResult = undefined;
    // Let you override command via env if needed
    const testEnv = { ...process.env };

    // If verbose logging is requested for acceptance:logging, write TestWorld logs to a file
    if (testEnv.LOG_MCP === "1") {
      const fs = require("fs");
      const path = require("path");
      // Prefer an explicit LOG_DIR if provided, otherwise default to repo-root/mcp-starter/logs
      const logDir = process.env.LOG_DIR || path.resolve(__dirname, "..", "..", "mcp-starter", "logs");
      try {
        fs.mkdirSync(logDir, { recursive: true });
      } catch (e) {
        console.warn("[TestWorld] mkdirSync failed:", e && e.message);
      }

      // Only announce the verbose log path once per test run
      if (!global.__TESTWORLD_VERBOSE_ANNOUNCED) {
        this._testLogPath = path.resolve(logDir, "cucumber-verbose.log");
        this._testLogStream = fs.createWriteStream(this._testLogPath, { flags: "a" });
        // Print the file location once so CI or local users know where to look
        console.log(`[TestWorld] Verbose cucumber logging enabled. Writing to: ${this._testLogPath}`);
        this._testLogStream.write(`${new Date().toISOString()} - [TestWorld] Initializing TestWorld\n`);
        this._testLogStream.write(`${new Date().toISOString()} - [TestWorld] Raw LOG_MCP value: ${testEnv.LOG_MCP}\n`);
        this._testLogStream.write(`${new Date().toISOString()} - [TestWorld] Raw MCP_CMD value: ${testEnv.MCP_CMD}\n`);
        this._testLogStream.write(
          `${new Date().toISOString()} - [TestWorld] Raw MCP_ARGS value: ${testEnv.MCP_ARGS}\n`,
        );
        global.__TESTWORLD_VERBOSE_ANNOUNCED = true;
      } else {
        // If the stream wasn't created yet in the first instance, create it so later instances can write
        if (!this._testLogStream) {
          const p = path.resolve(logDir, "cucumber-verbose.log");
          this._testLogPath = p;
          this._testLogStream = fs.createWriteStream(this._testLogPath, { flags: "a" });
        }
      }
    }

    this.mcpCmd = testEnv.MCP_CMD || "node";
    this.mcpArgs = (testEnv.MCP_ARGS && JSON.parse(testEnv.MCP_ARGS)) || ["mcp-starter/server.js"];
  }

  async startClient() {
    if (!this.client) {
      // Only pass LOG_MCP if explicitly set to '1' via npm run acceptance:logging
      // Otherwise filter it out to prevent logging during normal test runs
      const testEnv = { ...process.env };
      if (testEnv.LOG_MCP !== "1") {
        delete testEnv.LOG_MCP;
      }
      this.client = new McpClient(this.mcpCmd, this.mcpArgs, { env: testEnv });
      await this.client.start();
      // Write a tiny placeholder artifact so CI uploads are reliable even on early failures.
      // This file is safe to create and helps debugging when tests crash before writing logs.
      try {
        if (testEnv.LOG_MCP === "1") {
          const fs = require("fs");
          const path = require("path");
          const logDir = testEnv.LOG_DIR || path.resolve(__dirname, "..", "..", "mcp-starter", "logs");
          try {
            fs.mkdirSync(logDir, { recursive: true });
          } catch (e) {
            console.warn("[TestWorld] mkdirSync failed:", e && e.message);
          }
          const markerPath = path.join(logDir, "artifact-ready.txt");
          const payload = `${new Date().toISOString()} - artifact-ready: tests starting (branch: ${process.env.GITHUB_REF || "local"})\n`;
          try {
            fs.writeFileSync(markerPath, payload, { flag: "w" });
          } catch (e) {
            console.warn("[TestWorld] Could not write artifact-ready marker:", e && e.message);
          }
        }
      } catch (e) {
        // Best-effort only; don't fail tests for this
        console.warn("[TestWorld] artifact-ready marker write failed", e && e.message);
      }
      // Announce server-side MCP log path from parent process (avoids PowerShell RemoteException)
      if (testEnv.LOG_MCP === "1" && !global.__MCP_LOG_ANNOUNCED) {
        // Announce the server log directory so users can find rotated files
        const logDir = testEnv.LOG_DIR || require("path").resolve(__dirname, "..", "..", "mcp-starter", "logs");
        console.log(`[MCP] Server log directory: ${logDir} (files: mcp-<DATE>.log, mcp-error-<DATE>.log)`);
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
    if (testEnv.LOG_MCP === "1" && this._testLogStream) {
      this._testLogStream.write(
        `${new Date().toISOString()} - [TestWorld] Running tool: ${name} with args: ${JSON.stringify(args)}\n`,
      );
    }
    const res = await this.client.callTool(name, args);
    if (testEnv.LOG_MCP === "1" && this._testLogStream) {
      this._testLogStream.write(
        `${new Date().toISOString()} - [TestWorld] Received response: ${JSON.stringify(res)}\n`,
      );
    }
    this.lastResult = res;
    return res;
  }
}

setWorldConstructor(TestWorld);
