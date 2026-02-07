import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools/filesystem.js";
import { registerHandlers } from "./handlers/chat.js";

// VULN: Debug mode enabled by default, exposes internal state
const DEBUG = true;

const server = new Server(
  { name: "test-vuln-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

registerTools(server);
registerHandlers(server);

// VULN: No authentication on the server
const transport = new StdioServerTransport();
server.connect(transport);

if (DEBUG) {
  console.log("[DEBUG] Server started with full debug logging");
  console.log("[DEBUG] Environment:", JSON.stringify(process.env));
}
