import { MCPServer, TextContent, Tool } from "@modelcontextprotocol/sdk";
import fg from "fast-glob";
import fs from "fs/promises";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const promptsRoot = path.resolve(__dirname, "..");

const server = new MCPServer({ name: "ai-sdlc-mcp", version: "0.3.0" });

// Tools
server.tool(new Tool({
  name: "prompt.read",
  description: "Read a prompt template by relative path (e.g., prompts/v0.3.0/1_requirements_planning.md).",
  inputSchema: { type: "object", properties: { file: { type: "string" } }, required: ["file"] },
  async invoke({ file }) {
    const abs = path.resolve(promptsRoot, file);
    const content = await fs.readFile(abs, "utf-8");
    return new TextContent(content);
  }
}));

server.tool(new Tool({
  name: "prompt.list",
  description: "List available prompt templates (markdown) under a base folder.",
  inputSchema: { type: "object", properties: { base: { type: "string", default: "." } } },
  async invoke({ base = "." }) {
    const baseAbs = path.resolve(promptsRoot, base);
    const files = await fg(["**/*.md"], { cwd: baseAbs });
    return new TextContent(files.join("\n"));
  }
}));

server.tool(new Tool({
  name: "prompt.commands",
  description: "List slash-style commands for quick prompting.",
  inputSchema: { type: "object", properties: {} },
  async invoke() {
    const content = await fs.readFile(path.resolve(promptsRoot, "COMMANDS.md"), "utf-8");
    return new TextContent(content);
  }
}));

server.tool(new Tool({
  name: "pdca.generate",
  description: "Generate a Plan-Do-Check-Act skeleton for a given artifact and phase.",
  inputSchema: { type: "object", properties: {
    phase: { type: "string" },
    artifact: { type: "string" },
    context: { type: "string" }
  }, required: ["phase", "artifact"] },
  async invoke({ phase, artifact, context = "" }) {
    const out = `plan:\n  goals: []\n  deliverables: []\ndo:\n  actions: []\ncheck:\n  evaluation: []\nact:\n  followup_actions: []\n# phase: ${phase}\n# artifact: ${artifact}\n# context:\n${context}`;
    return new TextContent(out);
  }
}));

server.tool(new Tool({
  name: "prompt.apply",
  description: "Write a prompt template to a destination file. Args: file (source), dest (path), vars (object), dry_run (bool).",
  inputSchema: {
    type: "object",
    properties: {
      file: { type: "string" },
      dest: { type: "string" },
      vars: { type: "object" },
      dry_run: { type: "boolean", default: true }
    },
    required: ["file", "dest"]
  },
  async invoke({ file, dest, vars = {}, dry_run = true }) {
    const srcAbs = path.resolve(promptsRoot, file);
    let template = await fs.readFile(srcAbs, "utf-8");
    for (const [k,v] of Object.entries(vars)) {
      const re = new RegExp(`{{\\s*${k}\\s*}}`, "g");
      template = template.replace(re, String(v));
    }
    if (dry_run) {
      return new TextContent(`# DRY RUN\nWould write to: ${dest}\n---\n${template}`);
    } else {
      const destAbs = path.resolve(process.cwd(), dest);
      await fs.mkdir(path.dirname(destAbs), { recursive: true });
      await fs.writeFile(destAbs, template, "utf-8");
      return new TextContent(`Wrote ${dest}`);
    }
  }
}));

server.tool(new Tool({
  name: "prompt.fill",
  description: "Load a prompt template and merge with provided context. Args: file, vars (object), context (string).",
  inputSchema: {
    type: "object",
    properties: {
      file: { type: "string" },
      vars: { type: "object" },
      context: { type: "string" }
    },
    required: ["file"]
  },
  async invoke({ file, vars = {}, context = "" }) {
    const srcAbs = path.resolve(promptsRoot, file);
    let template = await fs.readFile(srcAbs, "utf-8");
    for (const [k,v] of Object.entries(vars)) {
      const re = new RegExp(`{{\\s*${k}\\s*}}`, "g");
      template = template.replace(re, String(v));
    }
    if (context) {
      template += `\n\n---\n**Context**\n\n${context}\n`;
    }
    return new TextContent(template);
  }
}));

server.tool(new Tool({
  name: "prompt.catalog",
  description: "Return a JSON catalog of available prompts with tags.",
  inputSchema: { type: "object", properties: {} },
  async invoke() {
    const content = await fs.readFile(path.resolve(promptsRoot, "prompt.catalog.json"), "utf-8");
    return new TextContent(content);
  }
}));

server.tool(new Tool({
  name: "metrics.capture",
  description: "Append a PDCA/error-learning entry into docs/learning-log.md. Args: kind, title, details (object).",
  inputSchema: {
    type: "object",
    properties: {
      kind: { type: "string", enum: ["pdca","error","retro","improvement","note"] },
      title: { type: "string" },
      details: { type: "object" }
    },
    required: ["kind", "title"]
  },
  async invoke({ kind, title, details = {} }) {
    const logPath = path.resolve(promptsRoot, "docs", "learning-log.md");
    const now = new Date().toISOString();
    const block = `\n## ${title}\n**Time:** ${now}\n**Kind:** ${kind}\n**Details:**\n\n\`\`\`json\n${JSON.stringify(details, null, 2)}\n\`\`\`\n`;
    await fs.appendFile(logPath, block, "utf-8");
    return new TextContent(`Appended entry to docs/learning-log.md: ${title}`);
  }
}));

async function loadRouterConfig() {
  try {
    const cfg = await fs.readFile(path.resolve(promptsRoot, "router.config.json"), "utf-8");
    return JSON.parse(cfg);
  } catch {
    return null;
  }
}

server.tool(new Tool({
  name: "model.router",
  description: "Given a task label, return a recommended model + alternates to optimize cost/quality (internal defaults).",
  inputSchema: { type: "object", properties: { task: { type: "string" } }, required: ["task"] },
  async invoke({ task }) {
    const table = [
      { match: /code|impl|refactor|function/i, primary: "Copilot: GPT-5 Codex", alt: ["GPT-4o", "Grok Code Fast 1"], saver: ["o3-mini"] },
      { match: /openapi|api|schema|spec/i, primary: "ChatGPT Web: GPT-4.1", alt: ["Copilot: GPT-5 Codex"], saver: ["o3-mini"] },
      { match: /architecture|design|c4|nfr/i, primary: "ChatGPT Web: GPT-5", alt: ["Gemini 2.5 Pro"], saver: ["GPT-4o"] },
      { match: /test|qa|unit|e2e|coverage/i, primary: "ChatGPT Web: GPT-4.1", alt: ["Copilot: GPT-5 Codex"], saver: ["o4-mini"] },
      { match: /deploy|cicd|terraform|iac|release/i, primary: "ChatGPT Web: GPT-5", alt: ["Gemini 2.5 Pro", "Copilot: GPT-5 Codex"], saver: ["GPT-4o"] },
      { match: /rca|incident|log|monitor|maintenance/i, primary: "ChatGPT Web: GPT-4.1", alt: ["Claude Sonnet 4.5"], saver: ["GPT-4o"] },
      { match: /retro|pdca|due[- ]diligence|improvement/i, primary: "ChatGPT Web: GPT-4.1", alt: ["Claude Sonnet 4"], saver: ["o4-mini"] }
    ];
    const rec = table.find(r => r.match.test(task)) || { primary: "ChatGPT Web: GPT-4.1", alt: ["GPT-4o"], saver: ["o4-mini"] };
    return new TextContent(JSON.stringify({ task, recommendation: rec }, null, 2));
  }
}));

server.tool(new Tool({
  name: "model.router.configured",
  description: "Route a task to a model using router.config.json patterns.",
  inputSchema: { type: "object", properties: { task: { type: "string" } }, required: ["task"] },
  async invoke({ task }) {
    const cfg = await loadRouterConfig();
    if (!cfg) return new TextContent(JSON.stringify({ task, error: "router.config.json missing" }, null, 2));
    const found = (cfg.routes || []).find(r => new RegExp(r.pattern, "i").test(task));
    const rec = found || cfg.default;
    return new TextContent(JSON.stringify({ task, recommendation: rec }, null, 2));
  }
}));

server.start().then(() => {
  console.error("MCP server started: ai-sdlc-mcp v0.3.0");
}).catch(err => {
  console.error(err);
  process.exit(1);
});
