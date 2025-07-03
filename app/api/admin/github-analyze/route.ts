import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { repoUrl, analysisType } = await request.json();
    
    // Extract owner and repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid GitHub URL. Use format: https://github.com/username/repository' 
      });
    }
    
    const [, owner, repo] = match;
    
    console.log(`Analyzing GitHub repo: ${owner}/${repo}`);
    
    // Fetch key files from GitHub API
    const files = await fetchRepositoryFiles(owner, repo);
    
    if (Object.keys(files).length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No accessible files found. Repository might be private or not exist.' 
      });
    }
    
    // Analyze based on actual code
    const analysis = await analyzeCodeWithAI(files, analysisType);
    
    return NextResponse.json({
      success: true,
      analysis,
      metadata: { 
        repo: `${owner}/${repo}`, 
        filesAnalyzed: Object.keys(files).length,
        timestamp: new Date().toISOString() 
      }
    });
    
  } catch (error) {
    console.error('GitHub Analysis Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to analyze repository. Check URL and try again.' 
    });
  }
}

async function fetchRepositoryFiles(owner: string, repo: string) {
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
  
  // Key files to analyze for interview app
  const filesToFetch = [
    'app/page.tsx',
    'app/layout.tsx',
    'app/api/interview/route.ts',
    'app/api/interview/evaluate/route.ts',
    'components/interview/QuestionGenerator.tsx',
    'components/interview/InterviewForm.tsx',
    'components/interview/AdminPanel.tsx',
    'lib/openai.ts',
    'lib/utils.ts',
    'types/interview.ts',
    'package.json',
    '.env.example',
    'README.md'
  ];
  
  const files: Record<string, string> = {};
  
  for (const filePath of filesToFetch) {
    try {
      const response = await fetch(`${baseUrl}/${filePath}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Interview-App-Analyzer',
          // Add GitHub token if available: 'Authorization': `token ${process.env.GITHUB_TOKEN}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Decode base64 content
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        files[filePath] = content;
        console.log(`✅ Fetched ${filePath} (${content.length} chars)`);
      } else if (response.status === 404) {
        console.log(`⚠️ File not found: ${filePath}`);
      } else {
        console.log(`❌ Error fetching ${filePath}: ${response.status}`);
      }
    } catch (err) {
      console.warn(`Could not fetch ${filePath}:`, err);
    }
  }
  
  return files;
}

async function analyzeCodeWithAI(files: Record<string, string>, analysisType: string) {
  // Create a summary of the codebase
  const codeStructure = Object.entries(files)
    .map(([path, content]) => {
      if (path === 'package.json') {
        return `=== ${path} ===\n${content}\n`;
      }
      // Truncate very long files to avoid token limits
      const truncated = content.length > 3000 ? 
        content.substring(0, 3000) + '\n... (truncated)' : 
        content;
      return `=== ${path} ===\n${truncated}\n`;
    })
    .join('\n');

  const prompts = {
    security: `🔒 SECURITY ANALYSIS - Interview Practice App

Analyze this real codebase for security vulnerabilities:

${codeStructure}

FOCUS ON:
1. **Input Validation**: Check form inputs, API parameters
2. **API Security**: Rate limiting, authentication, authorization  
3. **Environment Variables**: Proper handling of API keys
4. **Prompt Injection**: OpenAI API call security
5. **XSS/CSRF**: Frontend security vulnerabilities
6. **Data Exposure**: Logging, error messages, response data

PROVIDE:
- Specific file and line references where possible
- Severity rating (Critical/High/Medium/Low) for each issue
- Exact code fixes with examples
- Missing security measures that should be implemented

Be thorough and practical.`,

    codeQuality: `✨ CODE QUALITY REVIEW - Interview Practice App

Review this real codebase for quality and best practices:

${codeStructure}

ANALYZE:
1. **TypeScript Usage**: Type safety, interfaces, proper typing
2. **React Patterns**: Component structure, hooks usage, state management
3. **API Design**: RESTful patterns, error handling, response structure
4. **Code Organization**: File structure, separation of concerns
5. **Error Handling**: Try-catch blocks, user feedback, graceful failures
6. **Performance**: Unnecessary re-renders, optimization opportunities

PROVIDE:
- Specific code examples of issues
- Recommended improvements with code snippets
- Best practices that should be implemented
- Architecture patterns that could be improved

Focus on actionable improvements.`,

    architecture: `🏗️ ARCHITECTURE ANALYSIS - Interview Practice App

Evaluate the architecture of this real codebase:

${codeStructure}

ASSESS:
1. **Overall Architecture**: Next.js App Router usage, project structure
2. **Component Design**: Separation of concerns, reusability
3. **State Management**: How data flows through the application
4. **API Architecture**: Endpoint design, data flow patterns
5. **Scalability**: How well would this scale with more features
6. **Maintainability**: Code organization for future development

PROVIDE:
- Architecture strengths and weaknesses
- Missing patterns or layers that should be added
- Scalability concerns and solutions
- Refactoring recommendations with reasoning
- Future-proofing suggestions

Think like a senior architect reviewing this codebase.`,

    performance: `⚡ PERFORMANCE ANALYSIS - Interview Practice App

Analyze this real codebase for performance issues:

${codeStructure}

EXAMINE:
1. **Client-Side Performance**: React rendering, bundle size, lazy loading
2. **API Performance**: Response times, caching, optimization
3. **Database/External Calls**: OpenAI API usage efficiency
4. **Bundle Analysis**: Import patterns, code splitting opportunities
5. **Loading States**: User experience during async operations
6. **Memory Management**: Potential memory leaks, cleanup

PROVIDE:
- Specific performance bottlenecks found
- Optimization strategies with code examples
- Caching recommendations
- Bundle size optimization opportunities
- User experience improvements for loading states

Focus on measurable performance improvements.`
  };

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',  // Use GPT-4 for better code analysis
    messages: [
      {
        role: 'system',
        content: 'You are a senior software architect and security expert. Analyze the provided real codebase thoroughly and provide specific, actionable recommendations with file/line references where possible.'
      },
      {
        role: 'user',
        content: prompts[analysisType as keyof typeof prompts] || prompts.codeQuality
      }
    ],
    temperature: 0.2,  // Lower temperature for more focused analysis
    max_tokens: 2000,  // More tokens for detailed analysis
  });

  return response.choices[0].message.content;
}

// Health check
export async function GET() {
  return NextResponse.json({ 
    status: 'GitHub Analysis API is running!',
    features: ['Security Analysis', 'Code Quality', 'Architecture Review', 'Performance Analysis'],
    timestamp: new Date().toISOString()
  });
}
