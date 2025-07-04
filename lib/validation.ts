// lib/validation.ts
import Joi from "joi";

// Interview request validation schema
export const interviewRequestSchema = Joi.object({
  jobRole: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-\/]+$/) // Only alphanumeric, spaces, hyphens, slashes
    .required()
    .messages({
      "string.pattern.base": "Job role contains invalid characters",
      "string.min": "Job role must be at least 2 characters",
      "string.max": "Job role must not exceed 100 characters",
    }),

  interviewType: Joi.string()
    .valid(
      "technical",
      "behavioral",
      "industry",
      "system-design",
      "coding",
      "leadership",
      "cultural-fit"
    )
    .required(),

  difficulty: Joi.number().integer().min(1).max(10).required(),

  // New optional fields
  jobDescription: Joi.string()
    .trim()
    .max(2000)
    .pattern(
      /^[a-zA-Z0-9\s\-\/\.\,\:\;\(\)\[\]\{\}\@\#\$\%\^\&\*\+\=\?\!\~\`\"\']*$/
    ) // Allow common job description characters
    .optional()
    .allow("")
    .messages({
      "string.max": "Job description must be less than 2000 characters",
      "string.pattern.base": "Job description contains invalid characters",
    }),

  llmSettings: Joi.object({
    provider: Joi.string().valid("openai", "claude").optional(),
    temperature: Joi.number().min(0).max(2).optional(),
    maxTokens: Joi.number().integer().min(50).max(4000).optional(),
    topP: Joi.number().min(0.1).max(1).optional(),
    frequencyPenalty: Joi.number().min(-2).max(2).optional(), // OpenAI only
    presencePenalty: Joi.number().min(-2).max(2).optional(), // OpenAI only
    model: Joi.string()
      .valid(
        // OpenAI models
        "gpt-4",
        "gpt-4-turbo",
        "gpt-4o-mini",
        "gpt-3.5-turbo",
        // Claude models
        "claude-3-5-sonnet-20241022",
        "claude-3-haiku-20240307",
        "claude-3-opus-20240229"
      )
      .optional(),
  }).optional(),

  // Admin critique fields (optional) - keeping your existing implementation
  adminCritique: Joi.boolean().optional(),
  critiquePrompt: Joi.string().max(2000).optional(),
});

// Answer evaluation validation schema - keeping your existing implementation
export const evaluationRequestSchema = Joi.object({
  question: Joi.string().trim().min(10).max(2000).required(),

  answer: Joi.string().trim().min(5).max(5000).required().messages({
    "string.min": "Answer must be at least 5 characters",
    "string.max": "Answer must not exceed 5000 characters",
  }),

  jobRole: Joi.string().trim().min(2).max(100).required(),

  interviewType: Joi.string()
    .valid("technical", "behavioral", "industry")
    .required(),

  difficulty: Joi.number().integer().min(1).max(10).required(),
});

// GitHub analysis validation schema - keeping your existing implementation
export const githubAnalysisSchema = Joi.object({
  repoUrl: Joi.string()
    .uri()
    .pattern(/^https:\/\/github\.com\/[a-zA-Z0-9\-_]+\/[a-zA-Z0-9\-_]+\/?$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid GitHub repository URL format",
    }),

  analysisType: Joi.string()
    .valid("security", "codeQuality", "architecture", "performance")
    .required(),
});
