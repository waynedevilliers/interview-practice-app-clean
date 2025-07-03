Please analyze and critique this Interview Practice App from three perspectives: usability, security, and prompt engineering. Here's the current implementation:

## App Overview:
- Next.js + TypeScript interview practice application
- Users generate AI interview questions based on job role, type, and difficulty
- Users answer questions and receive AI evaluation/feedback
- Two-column layout: form on left, questions/answers on right

## Current Features:
1. Question generation with OpenAI API
2. Answer evaluation with scoring (1-10)
3. Difficulty scaling (1-10 levels)
4. Three interview types: technical, behavioral, industry-specific
5. Real-time feedback with strengths/improvements

## Code Structure:
- Frontend: React components (InterviewForm, QuestionGenerator)
- Backend: Next.js API routes (/api/interview, /api/interview/evaluate)
- AI Integration: OpenAI GPT-4o-mini with structured prompts
- Styling: Tailwind CSS for responsive design

## Current Prompt Engineering:
- System prompts define AI role as "expert interview coach"
- Difficulty-based complexity scaling
- Token limits based on difficulty (100-300 tokens)
- Structured evaluation format with SCORE, STRENGTHS, IMPROVEMENTS
- Context-aware prompts for different interview types

## Current Security:
- API key stored in environment variables
- Basic input validation (required fields, empty checks)
- Error handling for API failures
- TypeScript for type safety

Please provide detailed critique on:

### 1. USABILITY:
- User experience and interface design
- Workflow and navigation
- Accessibility considerations
- Mobile responsiveness
- User feedback and error messaging

### 2. SECURITY:
- Potential vulnerabilities
- Input validation gaps
- Prompt injection risks
- API security concerns
- Data handling and privacy

### 3. PROMPT ENGINEERING:
- Effectiveness of current prompts
- Consistency of AI responses
- Bias considerations
- Prompt optimization opportunities
- Quality of evaluation criteria

### 4. OVERALL RECOMMENDATIONS:
- Top 3 priority improvements
- Feature suggestions
- Best practices we should implement
- Industry standards we might be missing

Please be specific and actionable in your feedback.
