// Core analysis types
export type AnalysisType =
  | "github-security"
  | "github-codeQuality"
  | "github-architecture"
  | "github-performance"
  | "github-critical"
  | "github-production"
  | "github-final"
  | "usability"
  | "promptEngineering"
  | "overall";

// Extended analysis types (includes project criteria)
export type ExtendedAnalysisType =
  | AnalysisType
  | "project-criteria-easy"
  | "project-criteria-medium"
  | "project-criteria-hard"
  | "cross-validation";

// Validation settings for cross-validation
export interface ValidationSettings {
  primaryProvider: "openai" | "claude";
  validatorProvider: "openai" | "claude";
  includeScore: boolean;
  crossValidate: boolean;
}

// Analysis metadata (unified - removed duplicate)
export interface AnalysisMetadata {
  filesAnalyzed: number;
  analysisType: string;
  timestamp: string;
  repositoryName: string;
  repo?: string; // Optional legacy field
  rateLimitRemaining?: number; // Optional rate limit info
}

// GitHub analysis response (unified - removed duplicate)
export interface GitHubAnalysisResponse {
  success: boolean;
  question?: string; // Main response field
  analysis?: string; // Alternative response field
  error?: string;
  usage?: any;
  metadata?: AnalysisMetadata;
}

// Critique prompts for different analysis types
export interface CritiquePrompts {
  usability: string;
  promptEngineering: string;
  overall: string;
}
