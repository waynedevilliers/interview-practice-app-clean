// Admin panel specific types
export interface AnalysisMetadata {
  repo: string;
  filesAnalyzed: number;
  timestamp: string;
  rateLimitRemaining?: number;
}

export interface GitHubAnalysisResponse {
  success: boolean;
  analysis?: string;
  metadata?: AnalysisMetadata;
  error?: string;
}

export interface CritiquePrompts {
  usability: string;
  promptEngineering: string;
  overall: string;
}

export type AnalysisType =
  | "github-security"
  | "github-codeQuality"
  | "github-architecture"
  | "github-performance"
  | "usability"
  | "promptEngineering"
  | "overall";
