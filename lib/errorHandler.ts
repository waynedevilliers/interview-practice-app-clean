import { NextResponse } from "next/server";

export interface APIError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: any
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = "AppError";
  }
}

export class ErrorHandler {
  static createError(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: any
  ): AppError {
    return new AppError(code, message, statusCode, details);
  }

  static handleAPIError(error: unknown): NextResponse {
    // Log error for monitoring
    console.error("API Error:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            ...(process.env.NODE_ENV === "development" && {
              details: error.details,
            }),
          },
        },
        { status: error.statusCode }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message:
              process.env.NODE_ENV === "development"
                ? error.message
                : "An unexpected error occurred",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }

  static createValidationError(field: string, message: string): AppError {
    return new AppError("VALIDATION_ERROR", `${field}: ${message}`, 400);
  }

  static createRateLimitError(resetTime?: number): AppError {
    return new AppError(
      "RATE_LIMIT_EXCEEDED",
      "Too many requests. Please try again later.",
      429,
      { resetTime }
    );
  }

  static createNotFoundError(resource: string): AppError {
    return new AppError("NOT_FOUND", `${resource} not found`, 404);
  }
}
