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

export interface LLMSettings {
  provider: "openai" | "claude";
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number; // OpenAI only
  presencePenalty: number; // OpenAI only
  model: string;
}

// Enhanced form data interface to support multiple LLMs
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
  jobDescription?: string;
  llmSettings?: LLMSettings; // Changed from openAISettings to llmSettings
}

// API response interfaces
export interface InterviewQuestionResponse {
  success: boolean;
  question?: string;
  usage?: {
    prompt_tokens?: number; // OpenAI format
    completion_tokens?: number; // OpenAI format
    total_tokens: number;
    input_tokens?: number; // Claude format
    output_tokens?: number; // Claude format
  };
  settings?: LLMSettings;
  metadata?: {
    jobRole: string;
    interviewType: string;
    difficulty: number;
    timestamp: string;
    rateLimitRemaining?: number;
    type?: "admin_critique";
    hasJobDescription?: boolean;
    provider?: "openai" | "claude"; // New field
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

// Cost calculation interface
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
