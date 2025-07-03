export interface InterviewQuestion {
  id: string;
  type: 'technical' | 'behavioral' | 'industry';
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

export interface AnswerEvaluation {
  score: number; // 1-10
  feedback: string;
  strengths: string[];
  improvements: string[];
  overallComment: string;
}

export interface InterviewSession {
  question: InterviewQuestion;
  userAnswer?: string;
  evaluation?: AnswerEvaluation;
  status: 'question-generated' | 'answer-submitted' | 'evaluated';
}
