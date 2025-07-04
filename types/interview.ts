// @/types/interview.ts

export interface InterviewQuestion {
  id: string;
  type:
    | "technical"
    | "behavioral"
    | "industry"
    | "system-design"
    | "coding"
    | "leadership"
    | "cultural-fit";
  difficulty: number;
  question: string;
  followUp?: string;
  hints?: string[];
}

export interface InterviewSession {
  id: string;
  jobRole: string;
  companyName?: string;
  interviewType: string;
  questions: InterviewQuestion[];
  createdAt: Date;
}

export interface PromptSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  model: string; // Added model selection
}

// Enhanced form data interface to support new features
export interface InterviewFormData {
  jobRole: string;
  interviewType:
    | "technical"
    | "behavioral"
    | "industry"
    | "system-design"
    | "coding"
    | "leadership"
    | "cultural-fit";
  difficulty: number;
  jobDescription?: string; // New optional field
  openAISettings?: PromptSettings; // New optional settings
}

// API response interfaces
export interface InterviewQuestionResponse {
  success: boolean;
  question?: string;
  usage?: {
    // New usage tracking for cost calculation
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  settings?: PromptSettings; // Echo back settings used
  metadata?: {
    jobRole: string;
    interviewType: string;
    difficulty: number;
    timestamp: string;
    rateLimitRemaining?: number;
    type?: "admin_critique";
    hasJobDescription?: boolean; // New field
  };
  error?: string;
}

export interface AnswerEvaluation {
  rawFeedback: string;
  score: number;
  timestamp: string;
}

export interface EvaluationResponse {
  success: boolean;
  evaluation?: AnswerEvaluation;
  metadata?: {
    question: string;
    answerLength: number;
    jobRole: string;
    interviewType: string;
    difficulty: number;
  };
  error?: string;
}

// Hook return types
export interface UseInterviewState {
  currentQuestion: InterviewQuestionResponse | null;
  userAnswer: string;
  evaluation: AnswerEvaluation | null;
  isLoading: boolean;
  isEvaluating: boolean;
  error: string | null;
}

// New interface for cost calculation
export interface CostInfo {
  estimatedTokens: number;
  estimatedCost: number;
  actualTokens?: number;
  actualCost?: number;
}

// Model pricing information
export interface ModelCosts {
  [key: string]: {
    input: number; // cost per 1K tokens
    output: number; // cost per 1K tokens
  };
}
