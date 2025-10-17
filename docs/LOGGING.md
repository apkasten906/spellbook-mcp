# Logging

This project writes MCP/server and test logs to files and exposes a small set of environment variables to control behavior.

Locations

- Default log directory: `mcp-starter/logs` (relative to repository root). This default comes from the server's logger and the test harness. You can override it with `LOG_DIR`.

- Server protocol log (rotating daily + by size): `mcp-<DATE>.log` (e.g. `mcp-2025-10-15.log`).

- Error-only log (rotating): `mcp-error-<DATE>.log`.

- Cucumber verbose test log (when `LOG_MCP=1`): `cucumber-verbose.log` in the same `LOG_DIR`.

Environment variables

- `LOG_DIR` — Directory to place logs. Default: `mcp-starter/logs`. Set this to a path of your choice (absolute or relative).

- `LOG_MCP` — Set to `1` or `true` to enable verbose logging and mirror selected log output to the console (useful for local debugging and acceptance:logging runs).

- `LOG_ROTATE_MAX_BYTES` — Maximum size before rotation. The logger accepts human-readable sizes (for example `1m`, `5m`) and defaults to `1m` (1 megabyte).

- `LOG_ROTATE_BACKUPS` — Number of rotated backup files to keep. Default: `3`.

Notes about unused/changed vars

- Older configs referenced a single `LOG_MCP_LOG_PATH`; the current implementation uses `LOG_DIR` and produces daily files named `mcp-<DATE>.log` and `mcp-error-<DATE>.log`.

Behavior

- The server uses a winston-based rotating logger (winston + winston-daily-rotate-file). Logs are rotated by date (daily) and also when a file exceeds `LOG_ROTATE_MAX_BYTES`.

- The Cucumber TestWorld writes verbose, step-level information to `cucumber-verbose.log` under the same `LOG_DIR` when `LOG_MCP` is enabled. The parent test runner announces the log directory at startup so you can find rotated files easily.

How to enable verbose test logging

- Windows PowerShell example (current session):

```powershell
$env:LOG_MCP = '1'
# Optionally set a custom log directory for this run
$env:LOG_DIR = 'mcp-starter\logs'
npm run acceptance:logging
# Then inspect the logs (tail last 200 lines):
Get-Content .\mcp-starter\logs\cucumber-verbose.log -Tail 200
```

Notes & troubleshooting

- We intentionally avoid printing large amounts of detailed protocol logs to child stderr because PowerShell wraps those in RemoteException metadata; verbose logs are written to files and the parent prints concise announcements.

- If you prefer a different log layout, retention policy, or to centralize logs at the repo root, set `LOG_DIR` to the desired path (for example, set `LOG_DIR=..\logs` from `mcp-starter` to move logs up one level).
