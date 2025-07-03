import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Enhanced prompt injection protection
export function validateInput(input: string): {
  isValid: boolean;
  message?: string;
} {
  if (!input.trim()) {
    return { isValid: false, message: "Input cannot be empty" };
  }

  if (input.length > 5000) {
    return { isValid: false, message: "Input too long (max 5000 characters)" };
  }

  // Enhanced suspicious patterns detection
  const suspiciousPatterns = [
    // Direct prompt manipulation
    /ignore\s+previous/i,
    /ignore\s+all\s+previous/i,
    /system\s+prompt/i,
    /act\s+as/i,
    /pretend\s+to\s+be/i,
    /role\s*:\s*system/i,

    // Reset/bypass attempts
    /reset\s+all/i,
    /bypass\s+security/i,
    /override\s+instructions/i,
    /forget\s+everything/i,
    /new\s+instructions/i,

    // Injection markers
    /\[INST\]/i,
    /\[\/INST\]/i,
    /\<\|.*?\|\>/i,
    /###\s*instruction/i,

    // AI model manipulation
    /as\s+an\s+ai/i,
    /you\s+are\s+now/i,
    /from\s+now\s+on/i,
    /change\s+your\s+role/i,

    // Code injection attempts
    /<script/i,
    /javascript:/i,
    /eval\s*\(/i,
    /function\s*\(/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      return {
        isValid: false,
        message: "Input contains potentially harmful content",
      };
    }
  }

  // Check for excessive special characters (possible obfuscation)
  const specialCharCount = (input.match(/[^a-zA-Z0-9\s\.\,\!\?\-]/g) || [])
    .length;
  const specialCharRatio = specialCharCount / input.length;

  if (specialCharRatio > 0.3) {
    return {
      isValid: false,
      message: "Input contains too many special characters",
    };
  }

  return { isValid: true };
}

// Sanitize input for AI prompts
export function sanitizeForAI(input: string): string {
  return input
    .trim()
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\n{3,}/g, "\n\n") // Limit consecutive newlines
    .replace(/[^\w\s\.\,\!\?\-\(\)\[\]]/g, "") // Remove potentially harmful characters
    .substring(0, 5000); // Enforce length limit
}

// Rate limiting helper (simple in-memory implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remainingRequests?: number; resetTime?: number } {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return {
      allowed: true,
      remainingRequests: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, resetTime: record.resetTime };
  }

  record.count++;
  return {
    allowed: true,
    remainingRequests: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}
