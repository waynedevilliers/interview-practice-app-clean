import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { question, answer, jobRole, interviewType, difficulty } =
      await request.json();

    // Input validation
    if (!question || !answer || !jobRole) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

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

    // Call OpenAI for evaluation
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: evaluationPrompt },
      ],
      temperature: 0.3, // Lower temperature for more consistent evaluation
      max_tokens: 500,
    });

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
      metadata: {
        question: question.substring(0, 100) + "...", // First 100 chars for logging
        answerLength: answer.length,
        jobRole,
        interviewType,
        difficulty,
      },
    });
  } catch (error) {
    console.error("Answer Evaluation Error:", error);
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
    timestamp: new Date().toISOString(),
  });
}
