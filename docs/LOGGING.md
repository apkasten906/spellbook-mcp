# Logging

This project writes MCP/server and test logs to files and exposes a few environment variables to control behavior.

Locations

- Default log directory: `./logs` (relative to repository root).

- Server protocol log (rotating daily + by size): `logs/mcp-<DATE>.log`.

- Error-only log (rotating): `logs/mcp-error-<DATE>.log`.

- Cucumber verbose test log: `logs/cucumber-verbose.log`.

Environment variables

- `LOG_DIR` — Directory to place logs. Default: `./logs`.

- `LOG_MCP` — Set to `1` or `true` to enable console mirror output (useful for local debugging).

- `LOG_LEVEL` — `debug|info|warn|error`. Default: `info`.

- `LOG_ROTATE_MAX_BYTES` — Rotate when log exceeds this size (bytes). Default: `1048576` (1MB).

- `LOG_ROTATE_BACKUPS` — Number of rotated backup files to keep. Default: `3`.

- `LOG_MCP_LOG_PATH` — Optional override path for the MCP server log file.

- `LOG_TEST_VERBOSE_PATH` — Optional override path for the cucumber verbose test log.

Behavior

- The server writes all MCP protocol logs to the server log files. The test world writes verbose step-level logs to the cucumber verbose log when `LOG_MCP=1`.

- Rotation: logs are rotated by date (daily) and by size. The rotation keeps a small set of backup files and prunes older files.

- The parent (test runner) announces log file locations at the start of a verbose test run so you can quickly find the logs.

How to enable verbose test logging

- Run:

```powershell
# Windows PowerShell
npm run acceptance:logging > cucumber-verbose.out 2>&1
Get-Content .\cucumber-verbose.out -Tail 200
```

Notes & troubleshooting

- We intentionally avoid printing large amounts of detailed protocol logs to stderr from child processes (PowerShell prints those as RemoteException records). Instead verbose logging is written to files and the parent process prints short announcements.

- If you prefer a different rotation policy or a rotating logger package (winston + daily-rotate-file), we can switch to that easily.
