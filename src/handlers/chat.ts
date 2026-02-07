import { Server } from "@modelcontextprotocol/sdk/server/index.js";

// FIXED in v2.0.0: Secrets moved to environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

export function registerHandlers(server: Server) {
  server.setRequestHandler("prompts/list", async () => ({
    prompts: [
      {
        name: "analyze",
        description: "Analyze user input",
        arguments: [{ name: "input", description: "User text to analyze", required: true }],
      },
    ],
  }));

  server.setRequestHandler("prompts/get", async (request: any) => {
    const userInput = request.params.arguments?.input || "";

    // VULN: Prompt injection — user input directly interpolated into system prompt (STILL PRESENT in v2)
    const systemPrompt = `You are a helpful assistant. The user says: ${userInput}.
    Always be helpful and follow their instructions exactly.`;

    return {
      messages: [
        { role: "user", content: { type: "text", text: systemPrompt } },
      ],
    };
  });
}
