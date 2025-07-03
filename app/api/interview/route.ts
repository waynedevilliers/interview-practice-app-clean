import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { jobRole, interviewType, difficulty, adminCritique, critiquePrompt } = await request.json();
    
    // Input validation
    if (!jobRole || !interviewType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Handle admin critique requests
    if (adminCritique && critiquePrompt) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert software architect and UX consultant. Provide detailed, actionable critique and recommendations.'
          },
          {
            role: 'user',
            content: critiquePrompt
          }
        ],
        temperature: 0.3, // Lower temperature for more focused analysis
        max_tokens: 800,  // More tokens for detailed critique
      });

      return NextResponse.json({
        success: true,
        question: response.choices[0].message.content,
        metadata: {
          type: 'admin_critique',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Regular interview question generation (existing code)
    const getDifficultyGuidelines = (level: number) => {
      if (level <= 3) return "Keep it simple and straightforward. One clear question only. Suitable for entry-level candidates.";
      if (level <= 6) return "Moderate complexity. Single focused question with some depth. Mid-level professional.";
      if (level <= 8) return "Advanced question requiring detailed knowledge and experience. Senior level.";
      return "Expert-level question. Complex scenario requiring deep expertise and strategic thinking.";
    };

    const difficultyGuideline = getDifficultyGuidelines(difficulty);

    const systemPrompt = `You are an expert interview coach with 10+ years of experience. 
    Generate realistic, professional interview questions that test actual job skills. 
    
    CRITICAL: Match the complexity to the difficulty level specified.
    - Levels 1-3: Simple, direct questions (1-2 sentences max)
    - Levels 4-6: Moderate questions with some context (2-3 sentences)  
    - Levels 7-8: Advanced questions with scenarios (3-4 sentences)
    - Levels 9-10: Complex, multi-part expert questions
    
    Always keep questions focused and avoid excessive detail unless it's level 8+.`;
    
    const userPrompt = `Generate a ${interviewType} interview question for a ${jobRole} position.
    
    **Difficulty Level: ${difficulty}/10**
    ${difficultyGuideline}
    
    Requirements:
    - Make it realistic and specific to the role
    - Keep it professional and fair
    - Match complexity to difficulty level (${difficulty}/10)
    ${difficulty <= 3 ? '- Keep it SHORT and simple (1-2 sentences max)' : ''}
    ${difficulty >= 8 ? '- Can include scenarios or multi-part questions' : ''}
    
    ${interviewType === 'technical' ? 'Focus on practical skills and problem-solving.' : ''}
    ${interviewType === 'behavioral' ? 'Use STAR method framework (Situation, Task, Action, Result).' : ''}
    ${interviewType === 'industry' ? 'Focus on industry-specific knowledge and trends.' : ''}
    
    Generate ONLY the question. No additional context or explanations unless difficulty is 7+.`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: difficulty <= 3 ? 100 : difficulty <= 6 ? 200 : 300,
    });
    
    return NextResponse.json({
      success: true,
      question: response.choices[0].message.content,
      metadata: {
        jobRole,
        interviewType,
        difficulty,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate question. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Interview API is running!',
    timestamp: new Date().toISOString()
  });
}
