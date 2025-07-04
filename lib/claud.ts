// lib/claude.ts
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ClaudeSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  model: string;
}

interface ClaudeResponse {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

export class ClaudeService {
  static async generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    settings: ClaudeSettings
  ): Promise<ClaudeResponse> {
    try {
      const response = await anthropic.messages.create({
        model: settings.model,
        max_tokens: settings.maxTokens,
        temperature: settings.temperature,
        top_p: settings.topP,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      });

      // Extract text content from Claude's response
      const content = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");

      return {
        content,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
          total_tokens:
            response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    } catch (error) {
      console.error("Claude API Error:", error);
      throw error;
    }
  }
}

export { anthropic };
