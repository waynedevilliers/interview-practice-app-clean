import { NextRequest } from 'next/server';
import { POST } from '@/app/api/chat/route';
import { openai } from '@/lib/openai';

// Mock OpenAI
jest.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  },
}));

const mockOpenAI = openai as jest.Mocked<typeof openai>;

describe('Conversation Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle complete conversation flow from greeting to completion', async () => {
    // Mock OpenAI responses for questions and feedback
    mockOpenAI.chat.completions.create
      .mockResolvedValueOnce({
        choices: [{ message: { content: 'What is closure in JavaScript?' } }],
      } as any)
      .mockResolvedValueOnce({
        choices: [{ message: { content: 'Good explanation of closure!' } }],
      } as any)
      .mockResolvedValueOnce({
        choices: [{ message: { content: 'Explain the difference between == and === in JavaScript?' } }],
      } as any)
      .mockResolvedValueOnce({
        choices: [{ message: { content: 'Excellent understanding of equality operators!' } }],
      } as any)
      .mockResolvedValueOnce({
        choices: [{ message: { content: 'How would you optimize a React application?' } }],
      } as any)
      .mockResolvedValueOnce({
        choices: [{ message: { content: 'Great optimization strategies!' } }],
      } as any)
      .mockResolvedValueOnce({
        choices: [{ message: { content: 'What are the benefits of using TypeScript?' } }],
      } as any)
      .mockResolvedValueOnce({
        choices: [{ message: { content: 'Solid understanding of TypeScript benefits!' } }],
      } as any)
      .mockResolvedValueOnce({
        choices: [{ message: { content: 'Explain the concept of hoisting in JavaScript?' } }],
      } as any)
      .mockResolvedValueOnce({
        choices: [{ message: { content: 'Perfect explanation of hoisting!' } }],
      } as any)
      .mockResolvedValueOnce({
        choices: [{ message: { content: 'Overall excellent performance! You demonstrated strong technical knowledge.' } }],
      } as any);

    // Step 1: Greeting -> Name
    const greetingRequest = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'John',
        stage: 'greeting',
        userData: {},
        questionCount: 0,
      }),
    });

    const greetingResponse = await POST(greetingRequest);
    const greetingData = await greetingResponse.json();

    expect(greetingData.stage).toBe('job');
    expect(greetingData.userData.name).toBe('John');

    // Step 2: Job Role
    const jobRequest = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Frontend Developer',
        stage: 'job',
        userData: { name: 'John' },
        questionCount: 0,
      }),
    });

    const jobResponse = await POST(jobRequest);
    const jobData = await jobResponse.json();

    expect(jobData.stage).toBe('job_description');
    expect(jobData.userData.jobRole).toBe('Frontend Developer');

    // Step 3: Job Description (skip)
    const jobDescRequest = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'skip',
        stage: 'job_description',
        userData: { name: 'John', jobRole: 'Frontend Developer' },
        questionCount: 0,
      }),
    });

    const jobDescResponse = await POST(jobDescRequest);
    const jobDescData = await jobDescResponse.json();

    expect(jobDescData.stage).toBe('difficulty');
    expect(jobDescData.userData.jobDescription).toBeUndefined();

    // Step 4: Difficulty
    const difficultyRequest = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: '7',
        stage: 'difficulty',
        userData: { name: 'John', jobRole: 'Frontend Developer' },
        questionCount: 0,
      }),
    });

    const difficultyResponse = await POST(difficultyRequest);
    const difficultyData = await difficultyResponse.json();

    expect(difficultyData.stage).toBe('interviewing');
    expect(difficultyData.userData.difficulty).toBe(7);
    expect(difficultyData.questionCount).toBe(1);
    expect(difficultyData.message).toContain('Question 1 of 5');

    // Step 5-9: Answer 5 questions
    const questions = [
      'A closure is a function that has access to outer scope variables',
      'Triple equals checks type and value, double equals only value',
      'Use React.memo, useMemo, and useCallback for optimization',
      'TypeScript provides static typing and better IDE support',
      'Hoisting moves variable declarations to the top of their scope'
    ];

    let currentUserData = difficultyData.userData;
    let currentQuestionCount = difficultyData.questionCount;

    for (let i = 0; i < 5; i++) {
      const answerRequest = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: questions[i],
          stage: 'interviewing',
          userData: currentUserData,
          questionCount: currentQuestionCount,
        }),
      });

      const answerResponse = await POST(answerRequest);
      const answerData = await answerResponse.json();

      if (i < 4) {
        // Questions 1-4: Continue interviewing
        expect(answerData.stage).toBe('interviewing');
        expect(answerData.questionCount).toBe(i + 2);
        expect(answerData.message).toContain(`Question ${i + 2} of 5`);
      } else {
        // Question 5: Complete interview
        expect(answerData.stage).toBe('complete');
        expect(answerData.questionCount).toBe(5);
        expect(answerData.isComplete).toBe(true);
        expect(answerData.message).toContain('final assessment');
      }

      currentUserData = answerData.userData;
      currentQuestionCount = answerData.questionCount;
    }
  });

  it('should handle invalid difficulty input and retry', async () => {
    // Step 1: Invalid difficulty
    const invalidDifficultyRequest = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: '15',
        stage: 'difficulty',
        userData: { name: 'John', jobRole: 'Frontend Developer' },
        questionCount: 0,
      }),
    });

    const invalidResponse = await POST(invalidDifficultyRequest);
    const invalidData = await invalidResponse.json();

    expect(invalidData.stage).toBe('difficulty');
    expect(invalidData.message).toContain('valid difficulty level');

    // Step 2: Valid difficulty
    mockOpenAI.chat.completions.create.mockResolvedValueOnce({
      choices: [{ message: { content: 'What is React?' } }],
    } as any);

    const validDifficultyRequest = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: '5',
        stage: 'difficulty',
        userData: { name: 'John', jobRole: 'Frontend Developer' },
        questionCount: 0,
      }),
    });

    const validResponse = await POST(validDifficultyRequest);
    const validData = await validResponse.json();

    expect(validData.stage).toBe('interviewing');
    expect(validData.userData.difficulty).toBe(5);
    expect(validData.questionCount).toBe(1);
  });

  it('should handle job description with specific technologies', async () => {
    const jobDescRequest = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'React, TypeScript, Node.js experience required',
        stage: 'job_description',
        userData: { name: 'John', jobRole: 'Frontend Developer' },
        questionCount: 0,
      }),
    });

    const response = await POST(jobDescRequest);
    const data = await response.json();

    expect(data.stage).toBe('difficulty');
    expect(data.userData.jobDescription).toBe('React, TypeScript, Node.js experience required');
    expect(data.message).toContain('difficulty level');
  });

  it('should handle edge cases in conversation flow', async () => {
    // Test empty message in greeting
    const emptyGreetingRequest = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: '',
        stage: 'greeting',
        userData: {},
        questionCount: 0,
      }),
    });

    const emptyResponse = await POST(emptyGreetingRequest);
    const emptyData = await emptyResponse.json();

    expect(emptyData.stage).toBe('job');
    expect(emptyData.userData.name).toBe('');

    // Test very long job role
    const longJobRequest = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Senior Full Stack Developer with expertise in React, Node.js, TypeScript, and AWS',
        stage: 'job',
        userData: { name: 'John' },
        questionCount: 0,
      }),
    });

    const longJobResponse = await POST(longJobRequest);
    const longJobData = await longJobResponse.json();

    expect(longJobData.stage).toBe('job_description');
    expect(longJobData.userData.jobRole).toBe('Senior Full Stack Developer with expertise in React, Node.js, TypeScript, and AWS');
  });

  it('should maintain conversation state correctly throughout flow', async () => {
    let userData = {};
    let questionCount = 0;

    // Step 1: Name
    const nameRequest = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Alice',
        stage: 'greeting',
        userData,
        questionCount,
      }),
    });

    const nameResponse = await POST(nameRequest);
    const nameData = await nameResponse.json();
    userData = nameData.userData;

    expect(userData).toEqual({ name: 'Alice' });

    // Step 2: Job Role
    const jobRequest = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Backend Developer',
        stage: 'job',
        userData,
        questionCount,
      }),
    });

    const jobResponse = await POST(jobRequest);
    const jobData = await jobResponse.json();
    userData = jobData.userData;

    expect(userData).toEqual({ name: 'Alice', jobRole: 'Backend Developer' });

    // Step 3: Job Description
    const jobDescRequest = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Python and Django experience',
        stage: 'job_description',
        userData,
        questionCount,
      }),
    });

    const jobDescResponse = await POST(jobDescRequest);
    const jobDescData = await jobDescResponse.json();
    userData = jobDescData.userData;

    expect(userData).toEqual({
      name: 'Alice',
      jobRole: 'Backend Developer',
      jobDescription: 'Python and Django experience',
    });

    // Step 4: Difficulty
    mockOpenAI.chat.completions.create.mockResolvedValueOnce({
      choices: [{ message: { content: 'What is Django ORM?' } }],
    } as any);

    const difficultyRequest = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: '6',
        stage: 'difficulty',
        userData,
        questionCount,
      }),
    });

    const difficultyResponse = await POST(difficultyRequest);
    const difficultyData = await difficultyResponse.json();
    userData = difficultyData.userData;
    questionCount = difficultyData.questionCount;

    expect(userData).toEqual({
      name: 'Alice',
      jobRole: 'Backend Developer',
      jobDescription: 'Python and Django experience',
      difficulty: 6,
    });
    expect(questionCount).toBe(1);
  });
});