import { test, expect } from 'vitest';

import { createShutdown } from '../lib/graceful-shutdown.mjs';

test('shutdown is idempotent', async () => {
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

  await shutdown('SIGTERM');
  await shutdown('SIGTERM');

  console.error = origErr;

  const full = logs.filter((l) => l.includes('Received SIGTERM. Shutting down'));
  expect(full.length).toBe(1);
  expect(closed).toBe(1);
});
