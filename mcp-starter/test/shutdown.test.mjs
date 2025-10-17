import assert from 'assert';

import { createShutdown } from '../lib/graceful-shutdown.mjs';


// This test calls the shutdown function twice and verifies only one full
// shutdown message is emitted. We inject a fake exit function to avoid
// terminating the test process.

async function testShutdownIdempotent() {
  // fake server with close() that resolves
  let closed = 0;
  const fakeServer = {
    close: async () => {
      closed += 1;
    },
  };

  const logs = [];
  const origErr = console.error;
  console.error = (...args) => logs.push(args.join(' '));

  const { shutdown } = createShutdown(fakeServer, { exit: () => {} });

  // call shutdown twice
  await shutdown('SIGTERM');
  await shutdown('SIGTERM');

  // restore
  console.error = origErr;

  // find full shutdown messages
  const full = logs.filter((l) => l.includes('Received SIGTERM. Shutting down'));
  assert.strictEqual(full.length, 1, `Expected 1 full shutdown message, found ${full.length}. Logs: ${logs.join('\n')}`);
  // ensure server.close was called once
  assert.strictEqual(closed, 1, `Expected server.close to be called once, was called ${closed} times`);
}

// Run test
testShutdownIdempotent()
  .then(() => {
    console.log('ok');
    process.exit(0);
  })
  .catch((e) => {
    console.error('test failed', e);
    process.exit(2);
  });
