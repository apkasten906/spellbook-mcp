#!/usr/bin/env node
import { planSdlc } from "../mcp-starter/lib/sdlc-orchestrator.mjs";
import fs from "fs/promises";
import path from "path";

function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a === "--goal" && process.argv[i + 1]) {
      args.goal = process.argv[++i];
    }
    if (a === "--out" && process.argv[i + 1]) {
      args.out = process.argv[++i];
    }
  }
  return args;
}

async function main() {
  const { goal = "spellbook-mcp", out = "__output_sample" } = parseArgs();
  const plan = planSdlc({ goal });
  const repoRoot = process.cwd();
  const outRoot = path.resolve(repoRoot, out);
  await fs.rm(outRoot, { recursive: true, force: true }).catch(() => {});
  for (const p of plan.plan || []) {
    if (!p.artifact) continue;
    const dest = path.join(outRoot, p.artifact);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    let body = `# ${goal} · ${p.phase}\n\n`;
    try {
      const promptPath = path.resolve(repoRoot, p.prompt || "");
      const promptText = await fs.readFile(promptPath, "utf8");
      body += promptText;
    } catch {
      body += `Generated artifact for ${p.phase}`;
    }
    await fs.writeFile(dest, body, "utf8");
    console.log("WROTE", dest);
  }
  console.log("\nAll artifacts written to", outRoot);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
