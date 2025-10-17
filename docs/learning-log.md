# Learning Log

This document captures learnings from defects, incidents, and debugging sessions to improve code quality and prevent recurring issues.

---

## 2025-10-14: MCP Acceptance Tests Timeout Issue

**Date:** October 14, 2025  
**Session Duration:** ~2 hours  
**Severity:** High (all 24 acceptance tests failing)  
**Status:** ✅ Resolved

### Error Context

All Cucumber acceptance tests timing out with no response from MCP server:

- 24/24 scenarios failing with "function timed out, ensure the promise resolves within 5000 milliseconds"
- Custom MCP client sending requests to server's stdin
- Server starting successfully but never processing requests
- No error messages or exceptions, just silent timeouts

**Environment:**

- Node.js v24.5.0
- Windows 11
- @modelcontextprotocol/sdk version 2025.x
- Cucumber.js for BDD testing

### Root Cause

**Primary Issue:** MCP server was missing the `InitializeRequestSchema` handler, which is required by the Model Context Protocol for proper client-server handshake.

**Technical Details:**

- MCP protocol requires clients to send an `initialize` request before any other operations
- Server must respond to initialization with protocol version and capabilities
- Our server only implemented `ListToolsRequestSchema` and `CallToolRequestSchema` handlers
- Without the initialization handler, the server never acknowledged client connection
- All subsequent requests were ignored, causing timeouts

**Contributing Factor:** Custom MCP client implementation instead of using official SDK's `StdioClientTransport`, which may have had subtle protocol incompatibilities.

### Investigation Process

1. **Initial Analysis:** Added logging to both client and server to trace message flow
2. **Client-side logging:** Confirmed requests were being written to stdin with correct JSON-RPC framing
3. **Server-side logging:** Confirmed server started but showed no received requests
4. **Stdin verification:** Added raw stdin listeners - confirmed data was arriving but not processed
5. **SDK comparison:** Created test with official `@modelcontextprotocol/sdk` client - initially hung the same way
6. **Protocol analysis:** Reviewed MCP SDK documentation, discovered `InitializeRequestSchema`
7. **Validation:** Added initialization handler, all tests immediately passed

### Fix Summary

**Changes Made:**

1. **Added initialization handler to `mcp-starter/server.js`:**

   ```javascript
   import { InitializeRequestSchema } from "@modelcontextprotocol/sdk/types.js";

   server.setRequestHandler(InitializeRequestSchema, async (request) => {
     return {
       protocolVersion: "2024-11-05",
       capabilities: {
         tools: {},
       },
       serverInfo: {
         name: "spellbook-mcp",
         version: "0.3.0",
       },
     };
   });
   ```

2. **Replaced custom client with official SDK in `features/support/mcp-client.cjs`:**
   - Used `@modelcontextprotocol/sdk/client/index.js` `Client`
   - Used `@modelcontextprotocol/sdk/client/stdio.js` `StdioClientTransport`
   - Removed custom JSON-RPC framing implementation

3. **Updated step definitions to handle MCP content format:**
   - Modified `toText()` helper to extract text from `[{ type: 'text', text: '...' }]` arrays
   - Added missing step definition for "I should receive the contents of COMMANDS.md"

**Files Modified:**

- `mcp-starter/server.js` - Added InitializeRequestSchema handler
- `features/support/mcp-client.cjs` - Complete rewrite to use official SDK
- `features/support/world.cjs` - Simplified client lifecycle management
- `features/step_definitions/tools.steps.cjs` - Updated content parsing logic

### Test Results

**Before Fix:** 0/24 scenarios passing (100% failure rate)  
**After Fix:** 24/24 scenarios passing (100% success rate)  
**Execution Time:** ~4 seconds for full acceptance suite

### Prevention Steps

1. **Protocol Compliance:**
   - Always implement complete protocol specifications, not just the "happy path" handlers
   - Review protocol documentation for required initialization/handshake sequences
   - Add integration tests early to catch missing protocol requirements

2. **Use Official SDKs:**
   - Prefer official SDK clients/transports over custom implementations
   - Custom implementations may have subtle protocol incompatibilities
   - Official SDKs handle protocol updates and edge cases

3. **Early Testing:**
   - Run integration/acceptance tests immediately after scaffolding server
   - Don't wait until all features are implemented to verify basic connectivity
   - Use official SDK test clients for validation during development

4. **Comprehensive Logging:**
   - Add debug logging at protocol boundaries (initialization, request/response)
   - Log both successful and failed protocol exchanges
   - Use environment variables (like `LOG_MCP`) to toggle verbose logging

5. **Documentation Reference:**
   - Keep MCP specification and SDK documentation readily accessible
   - Review "getting started" examples from official SDK
   - Check for required vs optional protocol handlers

### Related Components

**Modified Files:**

- `mcp-starter/server.js` - Core server implementation
- `features/support/mcp-client.cjs` - Test client wrapper
- `features/support/world.cjs` - Cucumber world context
- `features/step_definitions/tools.steps.cjs` - BDD step definitions

**Pull Request:** feature/dev-pr branch  
**Tests:** All 24 acceptance test scenarios in `features/` directory

### Key Takeaways

1. **Protocol compliance is non-negotiable** - Missing even one required handler can break the entire communication flow
2. **Official SDKs exist for a reason** - They handle protocol nuances and edge cases we might miss
3. **Silent failures are the hardest to debug** - Add comprehensive logging at protocol boundaries
4. **Test early, test often** - Integration tests would have caught this immediately
5. **Read the spec** - MCP protocol requires initialization handshake, not just tool calls

### Additional Notes

This issue highlighted the importance of:

- Following protocol specifications completely
- Using official implementations when available
- Adding diagnostic logging at system boundaries
- Creating integration tests alongside feature development

The debugging process itself was valuable for understanding the MCP protocol's initialization sequence and the importance of proper client-server handshake.

---
