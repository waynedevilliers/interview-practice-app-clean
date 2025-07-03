export interface InterviewQuestion {
  id: string;
  type: "technical" | "behavioral" | "industry";
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
}

// Form data interface
export interface InterviewFormData {
  jobRole: string;
  interviewType: "technical" | "behavioral" | "industry";
  difficulty: number;
}

// API response interfaces
export interface InterviewQuestionResponse {
  success: boolean;
  question?: string;
  metadata?: {
    jobRole: string;
    interviewType: string;
    difficulty: number;
    timestamp: string;
    rateLimitRemaining?: number;
    type?: "admin_critique";
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
