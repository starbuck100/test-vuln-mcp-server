# test-vuln-mcp-server

Intentionally vulnerable MCP server for [AgentAudit](https://agentaudit.dev) end-to-end testing.

**DO NOT USE IN PRODUCTION** - This contains deliberate security vulnerabilities.

## Vulnerabilities (v1.0.0)

- Unrestricted filesystem read/write (path traversal)
- Command injection via `run_command` tool
- SSRF via `fetch_url` tool (no URL validation)
- Hardcoded API credentials in source
- Prompt injection (unsanitized user input in prompts)
- Debug mode leaking environment variables
- No authentication on server
