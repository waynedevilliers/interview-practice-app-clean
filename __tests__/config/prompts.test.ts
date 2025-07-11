import { SYSTEM_PROMPTS, CONVERSATION_PROMPTS, QUESTION_TEMPLATES } from '@/config/prompts';

describe('Prompt Configuration', () => {
  describe('SYSTEM_PROMPTS', () => {
    it('should contain technical interviewer system prompt', () => {
      expect(SYSTEM_PROMPTS.TECHNICAL_INTERVIEWER).toBeDefined();
      expect(typeof SYSTEM_PROMPTS.TECHNICAL_INTERVIEWER).toBe('string');
      expect(SYSTEM_PROMPTS.TECHNICAL_INTERVIEWER.length).toBeGreaterThan(100);
    });

    it('should include key behavioral instructions', () => {
      const prompt = SYSTEM_PROMPTS.TECHNICAL_INTERVIEWER;
      
      expect(prompt).toContain('professional technical interviewer');
      expect(prompt).toContain('5 technical questions');
      expect(prompt).toContain('difficulty level');
      expect(prompt).toContain('feedback');
      expect(prompt).toContain('EVALUATION CRITERIA');
    });

    it('should include conversation flow instructions', () => {
      const prompt = SYSTEM_PROMPTS.TECHNICAL_INTERVIEWER;
      
      expect(prompt).toContain('GREETING');
      expect(prompt).toContain('JOB_ROLE');
      expect(prompt).toContain('JOB_DESCRIPTION');
      expect(prompt).toContain('DIFFICULTY');
      expect(prompt).toContain('INTERVIEWING');
      expect(prompt).toContain('COMPLETE');
    });

    it('should include difficulty guide', () => {
      expect(SYSTEM_PROMPTS.DIFFICULTY_GUIDE).toBeDefined();
      expect(SYSTEM_PROMPTS.DIFFICULTY_GUIDE).toContain('1-3 (Junior)');
      expect(SYSTEM_PROMPTS.DIFFICULTY_GUIDE).toContain('4-6 (Mid-level)');
      expect(SYSTEM_PROMPTS.DIFFICULTY_GUIDE).toContain('7-10 (Senior)');
    });
  });

  describe('CONVERSATION_PROMPTS', () => {
    it('should contain greeting prompt', () => {
      expect(CONVERSATION_PROMPTS.GREETING).toBeDefined();
      expect(CONVERSATION_PROMPTS.GREETING).toContain('Hello');
      expect(CONVERSATION_PROMPTS.GREETING).toContain('name');
    });

    it('should generate personalized job role prompt', () => {
      const prompt = CONVERSATION_PROMPTS.ASK_JOB_ROLE('John');
      
      expect(prompt).toContain('John');
      expect(prompt).toContain('technical role');
      expect(prompt).toContain('preparing for');
    });

    it('should generate personalized job description prompt', () => {
      const prompt = CONVERSATION_PROMPTS.ASK_JOB_DESCRIPTION('Alice', 'Frontend Developer');
      
      expect(prompt).toContain('Alice');
      expect(prompt).toContain('Frontend Developer');
      expect(prompt).toContain('specific job');
      expect(prompt).toContain('skip');
    });

    it('should generate personalized difficulty prompt', () => {
      const prompt = CONVERSATION_PROMPTS.ASK_DIFFICULTY('Bob', 'Backend Developer');
      
      expect(prompt).toContain('difficulty level');
      expect(prompt).toContain('1-10');
      expect(prompt).toContain('Junior level');
      expect(prompt).toContain('Mid-level');
      expect(prompt).toContain('Senior level');
    });

    it('should generate personalized interview start prompt', () => {
      const prompt = CONVERSATION_PROMPTS.START_INTERVIEW('Charlie', 'Full Stack Developer', 7);
      
      expect(prompt).toContain('Full Stack Developer');
      expect(prompt).toContain('level 7');
      expect(prompt).toContain('5 technical questions');
      expect(prompt).toContain('Question 1 of 5');
    });

    it('should generate personalized final assessment prompt', () => {
      const prompt = CONVERSATION_PROMPTS.FINAL_ASSESSMENT('Diana');
      
      expect(prompt).toContain('Diana');
      expect(prompt).toContain('final assessment');
      expect(prompt).toContain('completing the interview');
    });
  });

  describe('QUESTION_TEMPLATES', () => {
    it('should generate technical question template', () => {
      const template = QUESTION_TEMPLATES.TECHNICAL_QUESTION('React Developer', 6, 3);
      
      expect(template).toContain('React Developer');
      expect(template).toContain('difficulty level 6/10');
      expect(template).toContain('question 3 of 5');
      expect(template).toContain('Appropriate for');
      expect(template).toContain('Clear and specific');
    });

    it('should include previous context when provided', () => {
      const template = QUESTION_TEMPLATES.TECHNICAL_QUESTION(
        'Vue.js Developer',
        8,
        2,
        'Previous answer about component lifecycle'
      );
      
      expect(template).toContain('Vue.js Developer');
      expect(template).toContain('difficulty level 8/10');
      expect(template).toContain('question 2 of 5');
      expect(template).toContain('Previous answer about component lifecycle');
    });

    it('should generate evaluation template', () => {
      const template = QUESTION_TEMPLATES.EVALUATE_ANSWER(
        'What is a closure in JavaScript?',
        'A closure is a function that has access to variables from its outer scope',
        7
      );
      
      expect(template).toContain('What is a closure in JavaScript?');
      expect(template).toContain('A closure is a function that has access to variables from its outer scope');
      expect(template).toContain('Difficulty Level: 7/10');
      expect(template).toContain('Technical accuracy');
      expect(template).toContain('Areas for improvement');
      expect(template).toContain('encouraging and constructive');
    });
  });

  describe('Prompt Quality', () => {
    it('should have consistent formatting across all prompts', () => {
      const systemPrompt = SYSTEM_PROMPTS.TECHNICAL_INTERVIEWER;
      
      // Check for consistent capitalization and structure
      expect(systemPrompt).toMatch(/ROLE & BEHAVIOR:/);
      expect(systemPrompt).toMatch(/CONVERSATION FLOW:/);
      expect(systemPrompt).toMatch(/INTERVIEW SETTINGS:/);
      expect(systemPrompt).toMatch(/EVALUATION CRITERIA:/);
      expect(systemPrompt).toMatch(/RESPONSE FORMAT:/);
    });

    it('should not contain placeholder values', () => {
      const allPrompts = [
        SYSTEM_PROMPTS.TECHNICAL_INTERVIEWER,
        SYSTEM_PROMPTS.DIFFICULTY_GUIDE,
        CONVERSATION_PROMPTS.GREETING,
        ...Object.values(CONVERSATION_PROMPTS).map(p => typeof p === 'function' ? p('Test', 'Test', 5) : p)
      ];

      allPrompts.forEach(prompt => {
        expect(prompt).not.toContain('TODO');
        expect(prompt).not.toContain('PLACEHOLDER');
        expect(prompt).not.toContain('{{');
        expect(prompt).not.toContain('}}');
      });
    });

    it('should have appropriate length for system prompts', () => {
      const systemPrompt = SYSTEM_PROMPTS.TECHNICAL_INTERVIEWER;
      
      // Should be comprehensive but not too long
      expect(systemPrompt.length).toBeGreaterThan(500);
      expect(systemPrompt.length).toBeLessThan(3000);
    });

    it('should have appropriate length for conversation prompts', () => {
      const conversationPrompts = [
        CONVERSATION_PROMPTS.GREETING,
        CONVERSATION_PROMPTS.ASK_JOB_ROLE('Test'),
        CONVERSATION_PROMPTS.ASK_JOB_DESCRIPTION('Test', 'Test'),
        CONVERSATION_PROMPTS.ASK_DIFFICULTY('Test', 'Test'),
        CONVERSATION_PROMPTS.START_INTERVIEW('Test', 'Test', 5),
        CONVERSATION_PROMPTS.FINAL_ASSESSMENT('Test'),
      ];

      conversationPrompts.forEach(prompt => {
        expect(prompt.length).toBeGreaterThan(10);
        expect(prompt.length).toBeLessThan(500);
      });
    });
  });

  describe('Template Functions', () => {
    it('should handle empty or undefined parameters gracefully', () => {
      expect(() => CONVERSATION_PROMPTS.ASK_JOB_ROLE('')).not.toThrow();
      expect(() => CONVERSATION_PROMPTS.ASK_JOB_DESCRIPTION('', '')).not.toThrow();
      expect(() => CONVERSATION_PROMPTS.ASK_DIFFICULTY('', '')).not.toThrow();
      expect(() => CONVERSATION_PROMPTS.START_INTERVIEW('', '', 0)).not.toThrow();
      expect(() => CONVERSATION_PROMPTS.FINAL_ASSESSMENT('')).not.toThrow();
    });

    it('should handle special characters in parameters', () => {
      const specialName = 'José María';
      const specialJob = 'C++ Developer';
      
      expect(() => CONVERSATION_PROMPTS.ASK_JOB_ROLE(specialName)).not.toThrow();
      expect(() => CONVERSATION_PROMPTS.ASK_JOB_DESCRIPTION(specialName, specialJob)).not.toThrow();
      
      const prompt = CONVERSATION_PROMPTS.ASK_JOB_ROLE(specialName);
      expect(prompt).toContain(specialName);
    });

    it('should handle extreme difficulty values', () => {
      expect(() => CONVERSATION_PROMPTS.START_INTERVIEW('Test', 'Test', 1)).not.toThrow();
      expect(() => CONVERSATION_PROMPTS.START_INTERVIEW('Test', 'Test', 10)).not.toThrow();
      expect(() => CONVERSATION_PROMPTS.START_INTERVIEW('Test', 'Test', 999)).not.toThrow();
    });
  });
});