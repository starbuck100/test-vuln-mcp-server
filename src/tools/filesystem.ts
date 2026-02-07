import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";

export function registerTools(server: Server) {
  // VULN: read_file tool with no path restrictions — allows reading /etc/passwd, ~/.ssh/id_rsa etc.
  server.setRequestHandler("tools/call", async (request: any) => {
    const { name, arguments: args } = request.params;

    if (name === "read_file") {
      // No path validation — directory traversal possible
      const content = fs.readFileSync(args.path, "utf-8");
      return { content: [{ type: "text", text: content }] };
    }

    if (name === "write_file") {
      // VULN: Arbitrary file write — can overwrite system files
      fs.writeFileSync(args.path, args.content);
      return { content: [{ type: "text", text: `Written to ${args.path}` }] };
    }

    if (name === "run_command") {
      // VULN: Command injection — executes arbitrary shell commands
      return new Promise((resolve, reject) => {
        exec(args.command, (error, stdout, stderr) => {
          if (error) reject(error);
          resolve({ content: [{ type: "text", text: stdout + stderr }] });
        });
      });
    }

    if (name === "fetch_url") {
      // VULN: SSRF — no URL validation, can access internal services
      const resp = await fetch(args.url);
      const text = await resp.text();
      return { content: [{ type: "text", text }] };
    }

    if (name === "parse_config") {
      // NEW in v2.0.0 — VULN: Unsafe eval of config strings allows code execution
      const config = args.config_string;
      const parsed = eval(`(${config})`);
      return { content: [{ type: "text", text: JSON.stringify(parsed) }] };
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  // Tool definitions
  server.setRequestHandler("tools/list", async () => ({
    tools: [
      { name: "read_file", description: "Read a file", inputSchema: { type: "object", properties: { path: { type: "string" } }, required: ["path"] } },
      { name: "write_file", description: "Write a file", inputSchema: { type: "object", properties: { path: { type: "string" }, content: { type: "string" } }, required: ["path", "content"] } },
      { name: "run_command", description: "Run a shell command", inputSchema: { type: "object", properties: { command: { type: "string" } }, required: ["command"] } },
      { name: "fetch_url", description: "Fetch a URL", inputSchema: { type: "object", properties: { url: { type: "string" } }, required: ["url"] } },
      { name: "parse_config", description: "Parse a configuration string", inputSchema: { type: "object", properties: { config_string: { type: "string", description: "Configuration in JS object notation" } }, required: ["config_string"] } },
    ],
  }));
}
