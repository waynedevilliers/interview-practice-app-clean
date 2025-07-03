import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function validateInput(input: string): { isValid: boolean; message?: string } {
  if (!input.trim()) {
    return { isValid: false, message: "Input cannot be empty" };
  }
  
  if (input.length > 500) {
    return { isValid: false, message: "Input too long (max 500 characters)" };
  }
  
  // Check for potential prompt injection
  const suspiciousPatterns = [
    /ignore\s+previous/i,
    /system\s+prompt/i,
    /act\s+as/i,
    /pretend\s+to\s+be/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      return { isValid: false, message: "Invalid input detected" };
    }
  }
  
  return { isValid: true };
}
