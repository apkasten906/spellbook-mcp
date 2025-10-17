import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';

// prompts live at the repo root `prompts/`, not under mcp-starter
const promptPath = path.resolve(__dirname, '..', '..', 'prompts', 'v0.3.0', 'meta', 'sdlc_orchestrator.md');

describe('SDLC orchestrator prompt', () => {
  it('contains references to PDCA and due_diligence', () => {
    const text = fs.readFileSync(promptPath, 'utf8');
    expect(text).toContain('PDCA');
    expect(text.toLowerCase()).toContain('due-diligence');
  });
});
