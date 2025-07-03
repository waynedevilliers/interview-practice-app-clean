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

    const {
      jobRole,
      interviewType,
      difficulty,
      adminCritique,
      critiquePrompt,
    } = value;

    // Handle admin critique requests
    if (adminCritique && critiquePrompt) {
      // This could be moved to a separate AdminService
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
            content: critiquePrompt,
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

    // Generate interview question using service
    const result = await InterviewService.generateQuestion({
      jobRole,
      interviewType,
      difficulty,
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
      metadata: {
        jobRole,
        interviewType,
        difficulty,
        timestamp: new Date().toISOString(),
        rateLimitRemaining: rateLimitCheck.remainingRequests,
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
    timestamp: new Date().toISOString(),
  });
}
