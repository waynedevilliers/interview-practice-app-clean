import { NextRequest, NextResponse } from "next/server";

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Set security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.openai.com https://api.github.com;"
  );

  return response;
}

// CSRF protection helper
export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

export function validateCSRFToken(
  token: string,
  expectedToken: string
): boolean {
  return token === expectedToken;
}
