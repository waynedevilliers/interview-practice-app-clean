import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const defaultModel = process.env.OPENAI_MODEL || "gpt-4o";

// Add the missing defaultSettings object
export const defaultSettings = {
  model: defaultModel,
  temperature: 0.7,
  max_tokens: 300,
};
