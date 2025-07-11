import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { SYSTEM_PROMPTS, CONVERSATION_PROMPTS, QUESTION_TEMPLATES } from '@/config/prompts';
import { ConversationStage, UserData, ChatResponse } from '@/types/chat';

interface ChatRequest {
  message: string;
  stage: ConversationStage;
  userData: UserData;
  questionCount: number;
}

export async function POST(request: NextRequest) {
  try {
    const { message, stage, userData, questionCount }: ChatRequest = await request.json();

    const response = await handleConversationFlow(message, stage, userData, questionCount);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

async function handleConversationFlow(
  userMessage: string,
  currentStage: ConversationStage,
  userData: UserData,
  questionCount: number
): Promise<ChatResponse> {
  
  switch (currentStage) {
    case 'greeting':
      return {
        message: CONVERSATION_PROMPTS.ASK_JOB_ROLE(userMessage),
        stage: 'job',
        userData: { ...userData, name: userMessage },
        questionCount,
        isComplete: false
      };

    case 'name':
      return {
        message: CONVERSATION_PROMPTS.ASK_JOB_ROLE(userMessage),
        stage: 'job',
        userData: { ...userData, name: userMessage },
        questionCount,
        isComplete: false
      };

    case 'job':
      // Validate if it's a technical role
      if (!isValidTechnicalRole(userMessage)) {
        return {
          message: CONVERSATION_PROMPTS.INVALID_ROLE(userData.name!, userMessage),
          stage: 'job', // Stay in job stage to ask again
          userData,
          questionCount,
          isComplete: false
        };
      }
      
      // Check if it's an AI role that needs specialization
      if (isAIRole(userMessage)) {
        return {
          message: CONVERSATION_PROMPTS.ASK_AI_SPECIALIZATION(userData.name!),
          stage: 'ai_specialization',
          userData: { ...userData, jobRole: userMessage },
          questionCount,
          isComplete: false
        };
      }
      
      return {
        message: CONVERSATION_PROMPTS.ASK_JOB_DESCRIPTION(userData.name!, userMessage),
        stage: 'job_description',
        userData: { ...userData, jobRole: userMessage },
        questionCount,
        isComplete: false
      };

    case 'ai_specialization':
      const specializationMap: { [key: string]: string } = {
        '1': 'LLM Engineering',
        '2': 'ML Engineering', 
        '3': 'General AI'
      };
      
      const specialization = specializationMap[userMessage.trim()];
      if (!specialization) {
        return {
          message: `Please choose 1, 2, or 3 for your AI specialization:\n\n**1.** LLM Engineering\n**2.** ML Engineering\n**3.** General AI`,
          stage: 'ai_specialization',
          userData,
          questionCount,
          isComplete: false
        };
      }
      
      return {
        message: CONVERSATION_PROMPTS.ASK_JOB_DESCRIPTION(userData.name!, `${userData.jobRole} (${specialization})`),
        stage: 'job_description',
        userData: { ...userData, aiSpecialization: specialization },
        questionCount,
        isComplete: false
      };

    case 'job_description':
      const jobDescription = userMessage.toLowerCase() === 'skip' ? undefined : userMessage;
      return {
        message: CONVERSATION_PROMPTS.ASK_DIFFICULTY(userData.name!, userData.jobRole!),
        stage: 'difficulty',
        userData: { ...userData, jobDescription },
        questionCount,
        isComplete: false
      };

    case 'difficulty':
      const difficulty = parseInt(userMessage);
      if (isNaN(difficulty) || difficulty < 1 || difficulty > 10) {
        return {
          message: 'Please enter a valid difficulty level between 1 and 10.',
          stage: 'difficulty',
          userData,
          questionCount,
          isComplete: false
        };
      }

      const startMessage = CONVERSATION_PROMPTS.START_INTERVIEW(userData.name!, userData.jobRole!, difficulty);
      const firstQuestion = await generateTechnicalQuestion(userData.jobRole!, difficulty, 1, userData.aiSpecialization);
      
      return {
        message: `${startMessage}\n\n${firstQuestion}`,
        stage: 'interviewing',
        userData: { ...userData, difficulty, currentQuestion: firstQuestion },
        questionCount: 1,
        isComplete: false
      };

    case 'interviewing':
      // Check for inappropriate responses
      if (!isAppropriateResponse(userMessage)) {
        const currentCount = (userData.inappropriateResponseCount || 0) + 1;
        
        if (currentCount >= 2) {
          return {
            message: CONVERSATION_PROMPTS.INTERVIEW_ENDED(userData.name!),
            stage: 'complete',
            userData: { ...userData, inappropriateResponseCount: currentCount },
            questionCount,
            isComplete: true
          };
        }
        
        return {
          message: CONVERSATION_PROMPTS.INAPPROPRIATE_WARNING(userData.name!, currentCount),
          stage: 'interviewing',
          userData: { ...userData, inappropriateResponseCount: currentCount },
          questionCount,
          isComplete: false
        };
      }
      
      return await handleInterviewingStage(userMessage, userData, questionCount, userData.currentQuestion);

    default:
      return {
        message: 'I\'m not sure how to respond to that. Let\'s start over.',
        stage: 'greeting',
        userData: {},
        questionCount: 0,
        isComplete: false
      };
  }
}

async function handleInterviewingStage(
  userAnswer: string,
  userData: UserData,
  questionCount: number,
  currentQuestion?: string
): Promise<ChatResponse> {
  
  // Generate feedback for the current answer
  const feedback = await generateFeedback(userAnswer, userData.difficulty!);
  
  // Generate the correct/ideal answer for the current question
  const idealAnswer = currentQuestion 
    ? await generateIdealAnswer(userData.jobRole!, userData.difficulty!, currentQuestion, userData.aiSpecialization)
    : await generateIdealAnswer(userData.jobRole!, userData.difficulty!, "the previous question", userData.aiSpecialization);
  
  // Check if we've reached the question limit
  if (questionCount >= 5) {
    const finalAssessment = await generateFinalAssessment(userData.name!, userData);
    
    return {
      message: `${feedback}\n\n**Ideal Answer:**\n${idealAnswer}\n\n${finalAssessment}`,
      stage: 'complete',
      userData,
      questionCount,
      isComplete: true
    };
  }

  // Generate next question
  const nextQuestionNumber = questionCount + 1;
  const nextQuestion = await generateTechnicalQuestion(userData.jobRole!, userData.difficulty!, nextQuestionNumber, userData.aiSpecialization);
  
  return {
    message: `${feedback}\n\n**Ideal Answer:**\n${idealAnswer}\n\n**Question ${nextQuestionNumber} of 5:**\n${nextQuestion}`,
    stage: 'interviewing',
    userData: { ...userData, currentQuestion: nextQuestion },
    questionCount: nextQuestionNumber,
    isComplete: false
  };
}

async function generateTechnicalQuestion(jobRole: string, difficulty: number, questionNumber: number, aiSpecialization?: string): Promise<string> {
  const roleContext = aiSpecialization ? `${jobRole} (${aiSpecialization})` : jobRole;
  const prompt = QUESTION_TEMPLATES.TECHNICAL_QUESTION(roleContext, difficulty, questionNumber);
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.TECHNICAL_INTERVIEWER },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || 'Could you tell me about your experience with this technology?';
  } catch (error) {
    console.error('Error generating question:', error);
    return 'Could you tell me about your experience with this technology?';
  }
}

async function generateFeedback(answer: string, difficulty: number): Promise<string> {
  const prompt = `Evaluate this technical interview answer at difficulty level ${difficulty}/10:

Answer: ${answer}

Provide brief feedback (2-3 sentences) covering:
- Technical accuracy and correctness
- Completeness and depth of answer
- One specific positive point
- One specific area for improvement (if any)

Keep the tone professional and constructive. Focus on technical merit.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.TECHNICAL_INTERVIEWER },
        { role: 'user', content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || 'Thank you for your answer. Let\'s continue with the next question.';
  } catch (error) {
    console.error('Error generating feedback:', error);
    return 'Thank you for your answer. Let\'s continue with the next question.';
  }
}

async function generateIdealAnswer(jobRole: string, difficulty: number, lastQuestion: string, aiSpecialization?: string): Promise<string> {
  const roleContext = aiSpecialization ? `${jobRole} (${aiSpecialization})` : jobRole;
  
  const prompt = `You are a senior technical interviewer. Use Chain-of-Thought reasoning to generate an ideal answer for this specific question from a ${roleContext} interview at difficulty level ${difficulty}/10.

QUESTION: ${lastQuestion}

CHAIN-OF-THOUGHT PROCESS:
1. First, understand exactly what this question is asking
2. Think about what an expert in ${roleContext} would know about this topic
3. Consider the difficulty level ${difficulty}/10 and what depth is expected
4. Structure the response to show technical depth and practical understanding
5. Include concrete examples and best practices specific to this question

Think step by step:
1. What are the key concepts this specific question is testing?
2. How would a senior ${roleContext} explain this topic?
3. What examples would demonstrate mastery of this concept?
4. What best practices should be mentioned for this topic?

Provide a comprehensive but concise answer that demonstrates:
- Deep technical understanding of the specific question asked
- Clear communication with concrete examples
- Practical examples directly relevant to the question
- Best practices and considerations for this specific topic

Format the answer as if an expert candidate would respond. Keep it 2-3 paragraphs maximum. Address the question directly and specifically.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.TECHNICAL_INTERVIEWER },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || 'A strong answer would demonstrate clear technical understanding with practical examples.';
  } catch (error) {
    console.error('Error generating ideal answer:', error);
    return 'A strong answer would demonstrate clear technical understanding with practical examples.';
  }
}

async function generateFinalAssessment(name: string, userData: UserData): Promise<string> {
  // Check if the user gave mostly inappropriate responses
  const inappropriateCount = userData.inappropriateResponseCount || 0;
  
  if (inappropriateCount >= 2) {
    return CONVERSATION_PROMPTS.INTERVIEW_ENDED(name);
  }
  
  // For users who gave some inappropriate responses but completed the interview
  if (inappropriateCount > 0) {
    return CONVERSATION_PROMPTS.FINAL_ASSESSMENT(name) + '\n\n' + 
           `Unfortunately, the interview was impacted by some inappropriate responses. While you completed all questions, I'd recommend focusing on professional communication skills alongside technical preparation for future interviews.`;
  }
  
  // For users who gave appropriate responses, generate a proper assessment
  const prompt = `Generate an honest final assessment for ${name} who just completed a 5-question technical interview.

Based on the interview context, provide:
- Overall performance summary (be honest about technical quality)
- Key strengths observed (if any)
- Areas for improvement
- Constructive next steps

Keep it professional and honest (3-4 sentences). Don't give false praise if the answers were poor.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.TECHNICAL_INTERVIEWER },
        { role: 'user', content: prompt }
      ],
      max_tokens: 250,
      temperature: 0.7
    });

    return CONVERSATION_PROMPTS.FINAL_ASSESSMENT(name) + '\n\n' + 
           (response.choices[0]?.message?.content || 'Thank you for completing the interview. I recommend focusing on technical fundamentals and practicing more structured answers for future interviews.');
  } catch (error) {
    console.error('Error generating final assessment:', error);
    return CONVERSATION_PROMPTS.FINAL_ASSESSMENT(name) + '\n\nThank you for completing the interview. I recommend focusing on technical fundamentals and practicing more structured answers for future interviews.';
  }
}

// Role validation function
function isValidTechnicalRole(role: string): boolean {
  const technicalRoles = [
    'software engineer', 'developer', 'programmer',
    'frontend developer', 'backend developer', 'full stack developer', 'fullstack developer',
    'mobile developer', 'ios developer', 'android developer', 'react native developer',
    'devops engineer', 'sre', 'site reliability engineer', 'platform engineer',
    'data engineer', 'machine learning engineer', 'ml engineer', 'ai engineer', 'artificial intelligence engineer',
    'qa engineer', 'test engineer', 'automation engineer',
    'web developer', 'software developer', 'application developer',
    'javascript developer', 'python developer', 'java developer', 'c++ developer',
    'react developer', 'angular developer', 'vue developer', 'node developer',
    'cloud engineer', 'infrastructure engineer', 'systems engineer',
    'security engineer', 'cybersecurity engineer', 'database engineer',
    'llm engineer', 'prompt engineer', 'ai/ml engineer'
  ];
  
  const normalizedRole = role.toLowerCase().trim();
  
  return technicalRoles.some(techRole => 
    normalizedRole.includes(techRole) || 
    techRole.includes(normalizedRole) ||
    normalizedRole.split(' ').some(word => techRole.includes(word))
  );
}

// Check if response is appropriate for technical interview
function isAppropriateResponse(response: string): boolean {
  const inappropriatePatterns = [
    /\b(fuck|shit|bitch|dick|ass|damn|hell)\b/i,
    /[a-z]{10,}/i, // Random character strings
    /^\s*$/, // Empty or whitespace only
    /^[^a-zA-Z]*$/, // No letters (just symbols/numbers)
  ];
  
  return !inappropriatePatterns.some(pattern => pattern.test(response.trim()));
}

// Check if it's an AI-related role that needs specialization
function isAIRole(role: string): boolean {
  const aiRoles = ['ai engineer', 'artificial intelligence engineer', 'ai/ml engineer', 'machine learning engineer'];
  const normalizedRole = role.toLowerCase().trim();
  
  return aiRoles.some(aiRole => 
    normalizedRole.includes(aiRole) || 
    aiRole.includes(normalizedRole) ||
    normalizedRole.includes('ai ') || 
    normalizedRole.includes(' ai')
  );
}