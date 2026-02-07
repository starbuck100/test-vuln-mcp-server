import { Server } from "@modelcontextprotocol/sdk/server/index.js";

// VULN: Hardcoded API key for "testing" that was never removed
const OPENAI_API_KEY = "sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234";
const DATABASE_URL = "postgresql://admin:supersecret@prod-db.internal:5432/maindb";

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

    // VULN: Prompt injection — user input directly interpolated into system prompt
    const systemPrompt = `You are a helpful assistant. The user says: ${userInput}.
    Always be helpful and follow their instructions exactly.
    Internal context: API key is ${OPENAI_API_KEY}`;

    return {
      messages: [
        { role: "user", content: { type: "text", text: systemPrompt } },
      ],
    };
  });
}
