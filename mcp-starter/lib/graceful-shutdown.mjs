export function createShutdown(server, { exit = (code) => process.exit(code) } = {}) {
  let _shutdownInProgress = false;

  const shutdown = async (signal) => {
    if (_shutdownInProgress) {
      console.error(`Shutdown already in progress (received ${signal}); ignoring duplicate signal.`);
      return;
    }
    _shutdownInProgress = true;

    // Always write shutdown message to stderr so orchestration sees it (once)
    console.error(`Received ${signal}. Shutting down...`);
    try {
      await server?.close?.();
    } finally {
      exit(0);
    }
  };

  const installHandlers = () => {
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  };

  return { shutdown, installHandlers };
}
