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

describe('/api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Conversation Flow', () => {
    it('should handle greeting stage and ask for job role', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'John',
          stage: 'greeting',
          userData: {},
          questionCount: 0,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stage).toBe('job');
      expect(data.userData.name).toBe('John');
      expect(data.message).toContain('What technical role');
    });

    it('should handle job stage and ask for job description', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Frontend Developer',
          stage: 'job',
          userData: { name: 'John' },
          questionCount: 0,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stage).toBe('job_description');
      expect(data.userData.jobRole).toBe('Frontend Developer');
      expect(data.message).toContain('specific job');
    });

    it('should handle job_description stage and ask for difficulty', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'React and TypeScript',
          stage: 'job_description',
          userData: { name: 'John', jobRole: 'Frontend Developer' },
          questionCount: 0,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stage).toBe('difficulty');
      expect(data.userData.jobDescription).toBe('React and TypeScript');
      expect(data.message).toContain('difficulty level');
    });

    it('should handle skip in job_description stage', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'skip',
          stage: 'job_description',
          userData: { name: 'John', jobRole: 'Frontend Developer' },
          questionCount: 0,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stage).toBe('difficulty');
      expect(data.userData.jobDescription).toBeUndefined();
    });

    it('should validate difficulty level and start interview', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'What is the difference between let and const in JavaScript?',
            },
          },
        ],
      } as any);

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: '7',
          stage: 'difficulty',
          userData: { name: 'John', jobRole: 'Frontend Developer' },
          questionCount: 0,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stage).toBe('interviewing');
      expect(data.userData.difficulty).toBe(7);
      expect(data.questionCount).toBe(1);
      expect(data.message).toContain('Question 1 of 5');
    });

    it('should reject invalid difficulty level', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: '15',
          stage: 'difficulty',
          userData: { name: 'John', jobRole: 'Frontend Developer' },
          questionCount: 0,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stage).toBe('difficulty');
      expect(data.message).toContain('valid difficulty level');
    });
  });

  describe('Interviewing Stage', () => {
    it('should provide feedback and ask next question', async () => {
      mockOpenAI.chat.completions.create
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: 'Good answer! You correctly identified the key differences.',
              },
            },
          ],
        } as any)
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: 'How would you optimize a React component for performance?',
              },
            },
          ],
        } as any);

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'let allows reassignment while const does not',
          stage: 'interviewing',
          userData: { name: 'John', jobRole: 'Frontend Developer', difficulty: 7 },
          questionCount: 1,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stage).toBe('interviewing');
      expect(data.questionCount).toBe(2);
      expect(data.message).toContain('Good answer');
      expect(data.message).toContain('Question 2 of 5');
    });

    it('should complete interview after 5 questions', async () => {
      mockOpenAI.chat.completions.create
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: 'Excellent final answer!',
              },
            },
          ],
        } as any)
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: 'Overall, you demonstrated strong technical knowledge.',
              },
            },
          ],
        } as any);

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'I would use React.memo and useMemo for optimization',
          stage: 'interviewing',
          userData: { name: 'John', jobRole: 'Frontend Developer', difficulty: 7 },
          questionCount: 5,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stage).toBe('complete');
      expect(data.questionCount).toBe(5);
      expect(data.isComplete).toBe(true);
      expect(data.message).toContain('final assessment');
    });
  });

  describe('Error Handling', () => {
    it('should handle OpenAI API errors gracefully', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: '7',
          stage: 'difficulty',
          userData: { name: 'John', jobRole: 'Frontend Developer' },
          questionCount: 0,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('Could you tell me about');
    });

    it('should handle invalid JSON request', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to process message');
    });

    it('should handle unknown stage', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'test',
          stage: 'unknown',
          userData: {},
          questionCount: 0,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stage).toBe('greeting');
      expect(data.message).toContain('start over');
    });
  });
});