import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { interviewRequestSchema } from "@/lib/validation";
import { validateInput, sanitizeForAI, checkRateLimit } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const clientIP =
      request.ip || request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitCheck = checkRateLimit(clientIP, 20, 15 * 60 * 1000); // 20 requests per 15 minutes

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          resetTime: rateLimitCheck.resetTime,
        },
        { status: 429 }
      );
    }

    // Get and validate request body
    const body = await request.json();
    const { error, value } = interviewRequestSchema.validate(body);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.details[0].message },
        { status: 400 }
      );
    }

    const {
      jobRole,
      interviewType,
      difficulty,
      adminCritique,
      critiquePrompt,
    } = value;

    // Additional security validation for user inputs
    const jobRoleValidation = validateInput(jobRole);
    if (!jobRoleValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid job role: ${jobRoleValidation.message}`,
        },
        { status: 400 }
      );
    }

    // Handle admin critique requests (with additional validation)
    if (adminCritique && critiquePrompt) {
      const critiqueValidation = validateInput(critiquePrompt);
      if (!critiqueValidation.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid critique prompt: ${critiqueValidation.message}`,
          },
          { status: 400 }
        );
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert software architect and UX consultant. Provide detailed, actionable critique and recommendations.",
          },
          {
            role: "user",
            content: sanitizeForAI(critiquePrompt),
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      return NextResponse.json({
        success: true,
        question: response.choices[0].message.content,
        metadata: {
          type: "admin_critique",
          timestamp: new Date().toISOString(),
          rateLimitRemaining: rateLimitCheck.remainingRequests,
        },
      });
    }

    // Regular interview question generation
    const getDifficultyGuidelines = (level: number): string => {
      if (level <= 3)
        return "Keep it simple and straightforward. One clear question only. Suitable for entry-level candidates.";
      if (level <= 6)
        return "Moderate complexity. Single focused question with some depth. Mid-level professional.";
      if (level <= 8)
        return "Advanced question requiring detailed knowledge and experience. Senior level.";
      return "Expert-level question. Complex scenario requiring deep expertise and strategic thinking.";
    };

    const difficultyGuideline = getDifficultyGuidelines(difficulty);

    const systemPrompt = `You are an expert interview coach with 10+ years of experience. 
    Generate realistic, professional interview questions that test actual job skills. 
    
    CRITICAL: Match the complexity to the difficulty level specified.
    - Levels 1-3: Simple, direct questions (1-2 sentences max)
    - Levels 4-6: Moderate questions with some context (2-3 sentences)  
    - Levels 7-8: Advanced questions with scenarios (3-4 sentences)
    - Levels 9-10: Complex, multi-part expert questions
    
    Always keep questions focused and avoid excessive detail unless it's level 8+.`;

    const userPrompt = `Generate a ${interviewType} interview question for a ${sanitizeForAI(
      jobRole
    )} position.
    
    **Difficulty Level: ${difficulty}/10**
    ${difficultyGuideline}
    
    Requirements:
    - Make it realistic and specific to the role
    - Keep it professional and fair
    - Match complexity to difficulty level (${difficulty}/10)
    ${difficulty <= 3 ? "- Keep it SHORT and simple (1-2 sentences max)" : ""}
    ${difficulty >= 8 ? "- Can include scenarios or multi-part questions" : ""}
    
    ${
      interviewType === "technical"
        ? "Focus on practical skills and problem-solving."
        : ""
    }
    ${
      interviewType === "behavioral"
        ? "Use STAR method framework (Situation, Task, Action, Result)."
        : ""
    }
    ${
      interviewType === "industry"
        ? "Focus on industry-specific knowledge and trends."
        : ""
    }
    
    Generate ONLY the question. No additional context or explanations unless difficulty is 7+.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: difficulty <= 3 ? 100 : difficulty <= 6 ? 200 : 300,
    });

    return NextResponse.json({
      success: true,
      question: response.choices[0].message.content,
      metadata: {
        jobRole: sanitizeForAI(jobRole),
        interviewType,
        difficulty,
        timestamp: new Date().toISOString(),
        rateLimitRemaining: rateLimitCheck.remainingRequests,
      },
    });
  } catch (error) {
    console.error(
      "OpenAI API Error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate question. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Interview API is running!",
    security: "Enhanced with validation and rate limiting",
    timestamp: new Date().toISOString(),
  });
}
