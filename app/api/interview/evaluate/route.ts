import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

// Claude API configuration
const claude = {
  messages: {
    create: async (params: any) => {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.CLAUDE_API_KEY!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: params.model,
          max_tokens: params.max_tokens,
          temperature: params.temperature,
          messages: params.messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        choices: [
          {
            message: {
              content: data.content[0].text,
            },
          },
        ],
        usage: {
          prompt_tokens: data.usage.input_tokens,
          completion_tokens: data.usage.output_tokens,
          total_tokens: data.usage.input_tokens + data.usage.output_tokens,
        },
      };
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const {
      question,
      answer,
      jobRole,
      interviewType,
      difficulty,
      llmSettings,
    } = await request.json();

    // Input validation
    if (!question || !answer || !jobRole) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Default evaluation settings
    const evaluationSettings = {
      provider: "openai" as "openai" | "claude",
      model: "gpt-4o-mini",
      temperature: 0.3,
      maxTokens: 500,
      ...llmSettings, // Override with provided settings
    };

    // System prompt for evaluation
    const systemPrompt = `You are an expert interview coach and evaluator. 
Your job is to provide constructive, detailed feedback on interview answers.

Evaluation Criteria:
- Relevance to the question
- Clarity and structure
- Use of specific examples
- Demonstration of skills/experience
- Communication effectiveness

Always be encouraging but honest. Provide actionable feedback for improvement.`;

    // User prompt for specific evaluation
    const evaluationPrompt = `Please evaluate this interview answer:

**Question:** ${question}

**Candidate's Answer:** ${answer}

**Context:**
- Role: ${jobRole}
- Interview Type: ${interviewType}
- Difficulty Level: ${difficulty}/10

**Please provide evaluation in this exact format:**

SCORE: [Give a score from 1-10]

STRENGTHS:
- [List 2-3 specific strengths]

AREAS FOR IMPROVEMENT:
- [List 2-3 specific areas to improve]

DETAILED FEEDBACK:
[Provide 2-3 sentences of constructive feedback with specific suggestions]

${
  interviewType === "behavioral"
    ? "STAR METHOD ASSESSMENT: [Evaluate if they used Situation, Task, Action, Result structure]"
    : ""
}
${
  interviewType === "technical"
    ? "TECHNICAL ACCURACY: [Assess technical correctness and depth]"
    : ""
}`;

    let response;

    // Call appropriate AI provider
    if (evaluationSettings.provider === "claude") {
      response = await claude.messages.create({
        model: evaluationSettings.model,
        max_tokens: evaluationSettings.maxTokens,
        temperature: evaluationSettings.temperature,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: evaluationPrompt,
          },
        ],
      });
    } else {
      // OpenAI evaluation
      response = await openai.chat.completions.create({
        model: evaluationSettings.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: evaluationPrompt },
        ],
        temperature: evaluationSettings.temperature,
        max_tokens: evaluationSettings.maxTokens,
      });
    }

    const evaluation = response.choices[0].message.content;

    // Parse the response to extract score
    const scoreMatch = evaluation?.match(/SCORE:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;

    return NextResponse.json({
      success: true,
      evaluation: {
        rawFeedback: evaluation,
        score: score,
        timestamp: new Date().toISOString(),
      },
      usage: response.usage, // Include token usage for cost calculation
      metadata: {
        question: question.substring(0, 100) + "...", // First 100 chars for logging
        answerLength: answer.length,
        jobRole,
        interviewType,
        difficulty,
        provider: evaluationSettings.provider,
        model: evaluationSettings.model,
      },
    });
  } catch (error) {
    console.error("Answer Evaluation Error:", error);

    // Handle specific Claude errors
    if (
      error instanceof Error &&
      error.message.includes("Claude API error: 404")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `The Claude model does not exist or you do not have access to it. Try using "claude-3-sonnet-20240229" or "claude-3-haiku-20240307" instead.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to evaluate answer. Please try again." },
      { status: 500 }
    );
  }
}

// Health check for evaluate endpoint
export async function GET() {
  return NextResponse.json({
    status: "Evaluation API is running!",
    features: [
      "OpenAI evaluation support",
      "Claude evaluation support",
      "Token usage tracking",
      "Multiple model support",
    ],
    timestamp: new Date().toISOString(),
  });
}
