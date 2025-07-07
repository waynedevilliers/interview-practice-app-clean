import { NextRequest, NextResponse } from "next/server";
import { interviewRequestSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/utils";
import { ErrorHandler } from "@/lib/errorHandler";
import { InterviewService } from "@/services/interviewService";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const clientIP =
      request.ip || request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitCheck = checkRateLimit(clientIP, 20, 15 * 60 * 1000);

    if (!rateLimitCheck.allowed) {
      throw ErrorHandler.createRateLimitError(rateLimitCheck.resetTime);
    }

    // Validate request body
    const body = await request.json();
    const { error, value } = interviewRequestSchema.validate(body);

    if (error) {
      throw ErrorHandler.createValidationError(
        "request",
        error.details[0].message
      );
    }

    const { jobRole, interviewType, difficulty, jobDescription, llmSettings } =
      value;

    // Default LLM settings if not provided
    const aiSettings = {
      provider: "openai" as "openai" | "claude",
      temperature: 0.7,
      maxTokens: 1000,
      topP: 0.9,
      frequencyPenalty: 0.3,
      presencePenalty: 0.0,
      model: "gpt-4o-mini",
      ...llmSettings, // Override with user settings if provided
    };

    // Generate interview question using service with enhanced settings
    const result = await InterviewService.generateQuestion({
      jobRole,
      interviewType,
      difficulty,
      jobDescription,
      llmSettings: aiSettings,
    });

    if (!result.success) {
      throw ErrorHandler.createError(
        "GENERATION_ERROR",
        result.error || "Failed to generate question"
      );
    }

    return NextResponse.json({
      success: true,
      question: result.question,
      usage: result.usage, // Token usage from InterviewService
      settings: aiSettings, // Settings used for generation
      metadata: {
        jobRole,
        interviewType,
        difficulty,
        timestamp: new Date().toISOString(),
        rateLimitRemaining: rateLimitCheck.remainingRequests,
        ...(jobDescription && { hasJobDescription: true }),
      },
    });
  } catch (error) {
    return ErrorHandler.handleAPIError(error);
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Interview API is running!",
    security: "Enhanced with validation and rate limiting",
    architecture: "Service layer pattern implemented",
    features: [
      "User-configurable OpenAI settings",
      "Cost tracking with token usage",
      "Job description integration",
      "Multiple AI models support (OpenAI + Claude)",
    ],
    timestamp: new Date().toISOString(),
  });
}
