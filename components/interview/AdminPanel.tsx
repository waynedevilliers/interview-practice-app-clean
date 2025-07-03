'use client';

import { useState } from 'react';

interface AdminPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function AdminPanel({ isVisible, onToggle }: AdminPanelProps) {
  const [critiqueType, setCritiqueType] = useState('usability');
  const [isLoading, setIsLoading] = useState(false);
  const [critique, setCritique] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetCritique = async () => {
    setIsLoading(true);
    setError(null);

    const critiquePrompts = {
      usability: `Analyze the usability of this Interview Practice App:

**App Features:**
- Next.js + TypeScript interview practice application
- Two-column layout: form left, questions/results right  
- Users generate AI questions by job role, type (technical/behavioral/industry), difficulty 1-10
- Users answer questions and get AI evaluation with scoring
- Real-time feedback with strengths and improvement suggestions

**Current UX:**
- Form stays on left, results flow on right
- Loading states during AI generation
- Character counter on answer textarea
- Color-coded scoring (green ≥8, yellow ≥6, red <6)
- Copy buttons for questions and feedback

**Please critique USABILITY specifically:**
1. User interface design and layout effectiveness
2. User workflow and navigation clarity
3. Accessibility considerations
4. Mobile responsiveness concerns
5. Error messaging and user feedback quality
6. Areas where users might get confused
7. Specific UX improvements to implement

Be detailed and actionable in your feedback.`,

      security: `Analyze the security of this Interview Practice App:

**Current Security Implementation:**
- OpenAI API key stored in environment variables
- Basic input validation (required fields, empty checks)
- TypeScript for type safety
- Error handling for API failures
- No user authentication currently

**Architecture:**
- Next.js API routes: /api/interview and /api/interview/evaluate
- Frontend form sends data to backend APIs
- Backend calls OpenAI API with user inputs
- Responses displayed directly to user

**Please critique SECURITY specifically:**
1. Prompt injection vulnerability risks
2. Input validation gaps and attack vectors
3. API security concerns and rate limiting needs
4. Data handling and privacy considerations
5. Potential for abuse or misuse
6. Missing security headers or protections
7. Specific security measures to implement immediately

Identify real vulnerabilities and provide actionable security improvements.`,

      promptEngineering: `Analyze the prompt engineering of this Interview Practice App:

**Current Prompt Strategy:**
- System prompt: "You are an expert interview coach with 10+ years experience"
- Difficulty scaling: 1-3 simple, 4-6 moderate, 7-10 complex
- Token limits: 100-300 based on difficulty
- Interview types: technical, behavioral, industry-specific
- Evaluation format: SCORE, STRENGTHS, AREAS FOR IMPROVEMENT, DETAILED FEEDBACK

**Sample System Prompt:**
"You are an expert interview coach with 10+ years of experience. Generate realistic, professional interview questions that test actual job skills. Match the complexity to the difficulty level specified."

**Sample Evaluation Prompt:**
"Please evaluate this interview answer: [question/answer] Context: Role: [role], Type: [type], Difficulty: [level]/10. Provide evaluation in this exact format: SCORE: [1-10], STRENGTHS: [list], AREAS FOR IMPROVEMENT: [list], DETAILED FEEDBACK: [feedback]"

**Please critique PROMPT ENGINEERING specifically:**
1. Effectiveness of current prompt structure
2. Consistency and reliability of AI responses
3. Bias considerations in question generation
4. Quality of evaluation criteria and scoring
5. Prompt optimization opportunities
6. Missing context or instructions
7. Specific prompt improvements to implement

Provide actionable prompt engineering improvements.`,

      overall: `Provide an overall critique of this Interview Practice App:

**Complete Feature Set:**
- AI-powered interview question generation
- User answer collection and evaluation
- Difficulty scaling (1-10 levels)
- Multiple interview types (technical/behavioral/industry)
- Real-time AI feedback with scoring
- Professional UI with Tailwind CSS

**Technology Stack:**
- Frontend: Next.js 15 + TypeScript + Tailwind CSS
- Backend: Next.js API routes
- AI: OpenAI GPT-4o-mini integration
- Deployment ready with environment variables

**Please provide OVERALL CRITIQUE:**
1. Top 3 priority improvements needed
2. Missing features that would add significant value
3. Industry best practices we should implement
4. Scalability and maintainability concerns
5. Feature suggestions for enhanced user experience
6. Technical debt or architectural improvements
7. Roadmap for making this production-ready

Focus on actionable recommendations that would make the biggest impact.`
    };

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobRole: 'Software Architect',
          interviewType: 'technical',
          difficulty: 10,
          adminCritique: true,
          critiquePrompt: critiquePrompts[critiqueType as keyof typeof critiquePrompts]
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCritique(data.question);
      } else {
        setError(data.error || 'Failed to get critique');
      }
    } catch (err) {
      setError('Network error during critique request');
      console.error('Critique Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4">
        <button
          onClick={onToggle}
          className="bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        >
          🔧 Admin
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🔧 Admin: App Critique Panel</h2>
            <button
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Critique Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Critique Focus Area:
              </label>
              <select
                value={critiqueType}
                onChange={(e) => setCritiqueType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              >
                <option value="usability">🎨 Usability & UX Design</option>
                <option value="security">🔒 Security & Vulnerabilities</option>
                <option value="promptEngineering">🤖 Prompt Engineering Quality</option>
                <option value="overall">📊 Overall App Assessment</option>
              </select>
            </div>

            {/* Get Critique Button */}
            <button
              onClick={handleGetCritique}
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Getting AI Critique...
                </span>
              ) : (
                '🔍 Get AI Critique of App'
              )}
            </button>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-400 text-xl mr-3">❌</span>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Critique Results */}
            {critique && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-800 mb-4">
                  🤖 AI Critique Results
                </h3>
                <div className="bg-white border border-purple-200 rounded p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                    {critique}
                  </pre>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(critique)}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    📋 Copy Critique
                  </button>
                  <button
                    onClick={() => setCritique(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    🔄 Clear Results
                  </button>
                </div>
              </div>
            )}

            {/* Info Panel */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">ℹ️ How This Works:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Uses your own interview app API to generate critique</li>
                <li>• Sends specialized prompts for different analysis areas</li>
                <li>• Provides actionable feedback for app improvements</li>
                <li>• Admin panel only visible when toggled on</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
