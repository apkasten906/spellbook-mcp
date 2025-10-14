# Client Setup Directions

## Claude Desktop (Mac/Win) Client

Copy spellbook-mcp.json to:

- macOS: ~/Library/Application Support/Claude/mcp/servers/spellbook-mcp.json
- Windows: %AppData%\Claude\mcp\servers\spellbook-mcp.json

## Cursor

If your extension supports MCP servers via stdio, point it at node `path`/server.js the same way

## VS Code (MCP)

1. Open the Command Pallette
2. Run 'MCP: Add Server...'
3. Choose 'Command (stdio)' from the list of types of servers to choose
4. Tell it to run the command 'Node' followed by the path to server.js (e.g. node C:\spellbook-mcp\mcp-starter\server.js)
5. Choose in which context it should be installed:
   - Global: your mcp.json file in %AppData%\Roaming\Code\User\mcp.json will be updated
   - Workspace: your your mcp.json file in /.vscode of your current workspace will be updated
