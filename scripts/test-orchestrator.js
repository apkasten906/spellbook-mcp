#!/usr/bin/env node
/**
 * Quick test script for the SDLC orchestrator
 * Runs planSdlc and prints the plan JSON
 */
import { planSdlc } from '../mcp-starter/lib/sdlc-orchestrator.mjs';

const sampleGoal = process.argv[2] || 'Add async retry to client';

console.log('🚀 SDLC Orchestrator Test\n');
console.log(`Goal: ${sampleGoal}\n`);

const plan = planSdlc({
  scope: 'feature',
  goal: sampleGoal,
  phases: null, // use all phases
  cwd: process.cwd(),
});

console.log('📋 Generated Plan:\n');
console.log(JSON.stringify(plan, null, 2));

console.log('\n✅ Orchestrator plan generated successfully!');
console.log('\nArtifacts that would be created:');
plan.plan.forEach((p, i) => {
  if (p.artifact) {
    console.log(`  ${i + 1}. ${p.artifact} (${p.phase})`);
  }
});
