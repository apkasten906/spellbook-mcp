#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

// reuse project helpers
import { planSdlc } from "../mcp-starter/lib/sdlc-orchestrator.mjs";
import { jsonSchemaToZod } from "../mcp-starter/lib/schema-to-zod.mjs";
import { validateWithZod } from "../mcp-starter/lib/validate-args.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadForm(formRel) {
  const p = path.resolve(process.cwd(), formRel);
  const txt = await fs.readFile(p, "utf8");
  return yaml.load(txt);
}

function askQuestion(prompt, def) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const q = `${prompt}${def !== undefined ? ` [${def}]` : ""}: `;
  return new Promise((res) =>
    rl.question(q, (ans) => {
      rl.close();
      res(ans === "" ? def : ans);
    }),
  );
}

function coerceValue(field, raw) {
  if (raw === undefined || raw === null) return raw;
  if (field.type === "boolean") return String(raw) === "true" || raw === true;
  if (field.type === "array") {
    if (Array.isArray(raw)) return raw;
    return String(raw)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return raw;
}

async function collectInteractive(form, argvArgs = {}) {
  const out = {};
  for (const f of form.fields || []) {
    const name = f.name;
    if (argvArgs[name] !== undefined) {
      out[name] = coerceValue(f, argvArgs[name]);
      continue;
    }
    const def = f.default ? String(f.default).replace("{{goal}}", out.goal || "") : undefined;
    const raw = await askQuestion(f.prompt || name, def);
    out[name] = coerceValue(f, raw);
  }
  return out;
}

async function main() {
  // simple args parser: --args '{...}' to provide JSON non-interactively
  const argv = process.argv.slice(2);
  let argsJson = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--args" && argv[i + 1]) {
      argsJson = argv[i + 1];
      i++;
    }
  }

  const form = await loadForm("prompts/v0.3.0/meta/sdlc_orchestrator.form.yaml");
  let collected = {};
  if (argsJson) {
    try {
      collected = JSON.parse(argsJson);
    } catch (e) {
      console.error("Invalid JSON for --args");
      process.exit(2);
    }
  }
  const inputs = await collectInteractive(form, collected);

  // map fields to the server's expected input shape
  const payload = {
    scope: inputs.scope,
    goal: inputs.goal,
    phases: inputs.phases,
    write: inputs.write === true,
    branch: inputs.branch || null,
    message: inputs.message || `sdlc-orchestrate: ${inputs.goal || "artifact"}`,
    push: inputs.push === true,
  };

  // validate with the server's schema-to-zod pipeline when possible
  // we create a minimal jsonSchema matching expected shape
  const inputSchema = {
    type: "object",
    properties: {
      scope: { type: "string", enum: ["feature", "service", "repo"], default: "feature" },
      goal: { type: "string" },
      phases: { type: "array" },
      write: { type: "boolean", default: false },
      branch: { type: "string" },
      message: { type: "string" },
      push: { type: "boolean", default: false },
    },
    required: ["goal"],
  };

  const z = jsonSchemaToZod(inputSchema, { name: "sdlc_orchestrate" });
  try {
    validateWithZod(z, payload);
  } catch (e) {
    console.error("Validation failed:", e.message || e);
    process.exit(2);
  }

  // run planSdlc and optionally write to out folder
  const plan = planSdlc({ scope: payload.scope, goal: payload.goal, phases: payload.phases });

  if (!payload.write) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  const outRoot = path.resolve(process.cwd(), inputs.out || "__output_sample");
  await fs.rm(outRoot, { recursive: true, force: true }).catch(() => {});
  for (const p of plan.plan || []) {
    if (!p.artifact) continue;
    const dest = path.join(outRoot, p.artifact);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    let body = `# ${payload.goal} · ${p.phase}\n\n`;
    try {
      const promptPath = path.resolve(process.cwd(), p.prompt || "");
      const promptText = await fs.readFile(promptPath, "utf8");
      body += promptText;
    } catch {
      body += `Generated artifact for ${p.phase}`;
    }
    await fs.writeFile(dest, body, "utf8");
    console.log("WROTE", dest);
  }
  console.log("\nArtifacts written to", outRoot);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
