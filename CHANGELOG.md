# Changelog

## v0.3.1 — 2025-10-14 (Unreleased)

### Added

- 🎯 **Comprehensive BDD Test Suite**: 24 Cucumber acceptance tests covering all MCP server tools
  - Feature files for all tool categories (api-scaffold, arch-adr, ci-cd, due-diligence, pdca, etc.)
  - 100% scenario pass rate with ~4 second execution time
  - Official MCP SDK client integration for robust test automation
- 📋 **Requirements Traceability**: Structured requirements and issues tracking system
  - `requirements/requirements-planning.yaml` with feature specifications
  - `issues/` directory for tracking work items and blockers
- 📚 **Learning Log**: Comprehensive error learning protocol implementation
  - Detailed post-mortem of MCP initialization issue
  - Prevention steps and key takeaways documented
- 🔧 **Git Configuration**: Added `.gitattributes` for consistent line endings across platforms

### Fixed

- 🐛 **Critical: MCP Server Initialization**: Added missing `InitializeRequestSchema` handler
  - Server now properly responds to MCP protocol initialization handshake
  - Fixes all acceptance tests timing out (0/24 → 24/24 passing)
  - Root cause: Missing required protocol handler for client-server initialization
- 🔌 **Test Client**: Replaced custom MCP client with official `@modelcontextprotocol/sdk` implementation
  - Ensures protocol compliance and compatibility
  - Eliminates custom JSON-RPC framing issues

### Changed

- 📦 **Dependencies**: Added `@cucumber/cucumber` for BDD testing
- 🧹 **Cleanup**: Removed obsolete `.vscode/setting.json` (typo in filename)
- 📝 **Test Infrastructure**: Enhanced step definitions with MCP content format support

### Developer Experience

- ✅ Test coverage: 100% of MCP server tools validated via acceptance tests
- 📖 Documentation: Learning log provides guidance for preventing similar issues
- 🚀 CI-Ready: Test suite can be integrated into CI/CD pipeline
- 🎓 Lessons Captured: Protocol compliance and SDK usage best practices documented


## v0.3.0 — 2025-10-12

- Initial public repo layout.
- SDLC prompts + PDCA meta-prompts.
- MCP server with prompt tools, model router, prompt catalog, metrics capture.
- Release workflow, Dockerfile, and usage docs.

