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
    .valid("technical", "behavioral", "industry")
    .required(),

  difficulty: Joi.number().integer().min(1).max(10).required(),

  // Admin critique fields (optional)
  adminCritique: Joi.boolean().optional(),
  critiquePrompt: Joi.string().max(2000).optional(),
});

// Answer evaluation validation schema
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

// GitHub analysis validation schema
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
