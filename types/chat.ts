export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UserData {
  name?: string;
  jobRole?: string;
  difficulty?: number;
  jobDescription?: string;
  aiSpecialization?: string;
  inappropriateResponseCount?: number;
  currentQuestion?: string;
}

export type ConversationStage = 
  | 'greeting'
  | 'name'
  | 'job'
  | 'ai_specialization'
  | 'job_description'
  | 'difficulty'
  | 'interviewing'
  | 'complete';

export interface ConversationState {
  stage: ConversationStage;
  userData: UserData;
  messages: ChatMessage[];
  currentQuestionCount: number;
  maxQuestions: number;
  isLoading: boolean;
}

export interface ChatResponse {
  message: string;
  stage: ConversationStage;
  userData: UserData;
  questionCount: number;
  isComplete: boolean;
}