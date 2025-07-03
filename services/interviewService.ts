import { openai } from "@/lib/openai";
import { validateInput, sanitizeForAI } from "@/lib/utils";
import type {
  InterviewFormData,
  InterviewQuestionResponse,
} from "@/types/interview";

export class InterviewService {
  private static getDifficultyGuidelines(level: number): string {
    if (level <= 3)
      return "Keep it simple and straightforward. One clear question only. Suitable for entry-level candidates.";
    if (level <= 6)
      return "Moderate complexity. Single focused question with some depth. Mid-level professional.";
    if (level <= 8)
      return "Advanced question requiring detailed knowledge and experience. Senior level.";
    return "Expert-level question. Complex scenario requiring deep expertise and strategic thinking.";
  }

  private static createSystemPrompt(): string {
    return `You are an expert interview coach with 10+ years of experience. 
    Generate realistic, professional interview questions that test actual job skills. 
    
    CRITICAL: Match the complexity to the difficulty level specified.
    - Levels 1-3: Simple, direct questions (1-2 sentences max)
    - Levels 4-6: Moderate questions with some context (2-3 sentences)  
    - Levels 7-8: Advanced questions with scenarios (3-4 sentences)
    - Levels 9-10: Complex, multi-part expert questions
    
    Always keep questions focused and avoid excessive detail unless it's level 8+.`;
  }

  private static createUserPrompt(formData: InterviewFormData): string {
    const { jobRole, interviewType, difficulty } = formData;
    const difficultyGuideline = this.getDifficultyGuidelines(difficulty);

    return `Generate a ${interviewType} interview question for a ${sanitizeForAI(
      jobRole
    )} position.
    
    **Difficulty Level: ${difficulty}/10**
    ${difficultyGuideline}
    
    Requirements:
    - Make it realistic and specific to the role
    - Keep it professional and fair
    - Match complexity to difficulty level (${difficulty}/10)
    ${difficulty <= 3 ? "- Keep it SHORT and simple (1-2 sentences max)" : ""}
    ${difficulty >= 8 ? "- Can include scenarios or multi-part questions" : ""}
    
    ${
      interviewType === "technical"
        ? "Focus on practical skills and problem-solving."
        : ""
    }
    ${
      interviewType === "behavioral"
        ? "Use STAR method framework (Situation, Task, Action, Result)."
        : ""
    }
    ${
      interviewType === "industry"
        ? "Focus on industry-specific knowledge and trends."
        : ""
    }
    
    Generate ONLY the question. No additional context or explanations unless difficulty is 7+.`;
  }

  static async generateQuestion(formData: InterviewFormData): Promise<{
    success: boolean;
    question?: string;
    error?: string;
  }> {
    try {
      // Validate input
      const jobRoleValidation = validateInput(formData.jobRole);
      if (!jobRoleValidation.isValid) {
        return {
          success: false,
          error: `Invalid job role: ${jobRoleValidation.message}`,
        };
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: this.createSystemPrompt() },
          { role: "user", content: this.createUserPrompt(formData) },
        ],
        temperature: 0.7,
        max_tokens:
          formData.difficulty <= 3 ? 100 : formData.difficulty <= 6 ? 200 : 300,
      });

      return {
        success: true,
        question: response.choices[0].message.content || undefined,
      };
    } catch (error) {
      console.error(
        "Interview Service Error:",
        error instanceof Error ? error.message : "Unknown error"
      );
      return {
        success: false,
        error: "Failed to generate question. Please try again.",
      };
    }
  }

  static async evaluateAnswer(data: {
    question: string;
    answer: string;
    jobRole: string;
    interviewType: string;
    difficulty: number;
  }): Promise<{
    success: boolean;
    evaluation?: any;
    error?: string;
  }> {
    try {
      // Validate inputs
      const questionValidation = validateInput(data.question);
      const answerValidation = validateInput(data.answer);

      if (!questionValidation.isValid) {
        return { success: false, error: "Invalid question format" };
      }
      if (!answerValidation.isValid) {
        return {
          success: false,
          error: `Invalid answer: ${answerValidation.message}`,
        };
      }

      const systemPrompt = `You are an expert interview coach and evaluator. 
      Your job is to provide constructive, detailed feedback on interview answers.
      
      Evaluation Criteria:
      - Relevance to the question
      - Clarity and structure
      - Use of specific examples
      - Demonstration of skills/experience
      - Communication effectiveness
      
      Always be encouraging but honest. Provide actionable feedback for improvement.`;

      const evaluationPrompt = `Please evaluate this interview answer:

**Question:** ${data.question}

**Candidate's Answer:** ${sanitizeForAI(data.answer)}

**Context:**
- Role: ${data.jobRole}
- Interview Type: ${data.interviewType}
- Difficulty Level: ${data.difficulty}/10

**Please provide evaluation in this exact format:**

SCORE: [Give a score from 1-10]

STRENGTHS:
- [List 2-3 specific strengths]

AREAS FOR IMPROVEMENT:
- [List 2-3 specific areas to improve]

DETAILED FEEDBACK:
[Provide 2-3 sentences of constructive feedback with specific suggestions]

${
  data.interviewType === "behavioral"
    ? "STAR METHOD ASSESSMENT: [Evaluate if they used Situation, Task, Action, Result structure]"
    : ""
}
${
  data.interviewType === "technical"
    ? "TECHNICAL ACCURACY: [Assess technical correctness and depth]"
    : ""
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: evaluationPrompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const evaluation = response.choices[0].message.content;
      const scoreMatch = evaluation?.match(/SCORE:\s*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;

      return {
        success: true,
        evaluation: {
          rawFeedback: evaluation,
          score: score,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error(
        "Evaluation Service Error:",
        error instanceof Error ? error.message : "Unknown error"
      );
      return {
        success: false,
        error: "Failed to evaluate answer. Please try again.",
      };
    }
  }
}
