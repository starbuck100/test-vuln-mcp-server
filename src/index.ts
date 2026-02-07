import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools/filesystem.js";
import { registerHandlers } from "./handlers/chat.js";

// FIXED in v2.0.0: Debug mode disabled by default
const DEBUG = process.env.DEBUG === "true";

const server = new Server(
  { name: "test-vuln-mcp-server", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

registerTools(server);
registerHandlers(server);

// VULN: No authentication on the server (STILL PRESENT in v2)
const transport = new StdioServerTransport();
server.connect(transport);

if (DEBUG) {
  console.log("[DEBUG] Server started");
  // FIXED: No longer leaks full environment
  console.log("[DEBUG] Node version:", process.version);
}
