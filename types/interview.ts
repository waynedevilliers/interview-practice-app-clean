export interface FormData {
  jobRole: string;
  interviewType: string;
  difficulty: number;
}

export interface OpenAISettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  model: string;
}

export interface CostInfo {
  estimatedTokens: number;
  estimatedCost: number;
  actualTokens?: number;
  actualCost?: number;
}

export interface InterviewFormProps {
  onSubmit: (
    data: FormData & { jobDescription?: string; openAISettings: OpenAISettings }
  ) => void;
  isLoading?: boolean;
  onToggleAdmin: () => void;
}

// Model cost structure
export const MODEL_COSTS = {
  "gpt-4": { input: 0.03, output: 0.06 }, // per 1K tokens
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "gpt-3.5-turbo": { input: 0.0015, output: 0.002 },
} as const;

// Interview types for the selector
export const INTERVIEW_TYPES = [
  { value: "technical", label: "💻 Technical" },
  { value: "behavioral", label: "🧠 Behavioral" },
  { value: "industry", label: "🏢 Industry-Specific" },
  { value: "system-design", label: "🏗️ System Design" },
  { value: "coding", label: "⌨️ Coding Challenge" },
  { value: "leadership", label: "👥 Leadership" },
  { value: "cultural-fit", label: "🤝 Cultural Fit" },
] as const;

// Model options for the selector
export const MODEL_OPTIONS = [
  { value: "gpt-4-turbo", label: "GPT-4 Turbo (Recommended)" },
  { value: "gpt-4", label: "GPT-4 (Premium)" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Fast)" },
] as const;
