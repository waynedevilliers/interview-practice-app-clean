import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle project criteria validation (WITH GitHub files)
    if (body.adminCritique && body.critiquePrompt) {
      return await handleCritiqueAnalysisWithGitHub(body);
    }
    // Handle direct GitHub analysis
    else if (body.repoUrl && body.analysisType) {
      return await handleGitHubAnalysis(body);
    } else {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid request format. Expected adminCritique with critiquePrompt or repoUrl with analysisType",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during analysis",
      },
      { status: 500 }
    );
  }
}

// Enhanced critique analysis WITH GitHub file fetching
async function handleCritiqueAnalysisWithGitHub(body: any) {
  const { critiquePrompt, llmSettings, jobRole, repoUrl } = body;

  try {
    let codeContext = "";
    let filesAnalyzed = 0;

    // Fetch GitHub files if repoUrl is provided
    if (repoUrl && repoUrl.includes("github.com")) {
      console.log(
        "🔍 Fetching GitHub files for project criteria validation..."
      );

      // Extract owner and repo from URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        const [, owner, repo] = match;
        const files = await fetchRepositoryFiles(owner, repo);

        if (Object.keys(files).length > 0) {
          // Create code context for analysis
          codeContext = `\n\nACTUAL CODEBASE ANALYSIS:
${Object.entries(files)
  .map(([path, content]) => {
    // Truncate very long files
    const truncated =
      content.length > 2000
        ? content.substring(0, 2000) + "\n... (truncated)"
        : content;
    return `=== ${path} ===\n${truncated}`;
  })
  .join("\n\n")}`;

          filesAnalyzed = Object.keys(files).length;
          console.log(
            `✅ Successfully fetched ${filesAnalyzed} files for analysis`
          );
        }
      }
    }

    // Combine critiquePrompt with actual code
    const enhancedPrompt = `${critiquePrompt}${codeContext}

${
  codeContext
    ? `IMPORTANT: Base your analysis on the ACTUAL CODE provided above. Check real implementation, not assumptions.`
    : `Note: Analyzing based on prompt only - no code files available.`
}`;

    let response;

    if (llmSettings.provider === "claude") {
      // Claude API call using official SDK
      const claudeResponse = await anthropic.messages.create({
        model: llmSettings.model,
        max_tokens: llmSettings.maxTokens,
        temperature: llmSettings.temperature,
        system:
          "You are an expert code reviewer and software architect. Analyze the actual codebase thoroughly and provide detailed, actionable analysis based on real implementation.",
        messages: [{ role: "user", content: enhancedPrompt }],
      });

      // Extract text content from Claude's response
      const content = claudeResponse.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");

      response = {
        choices: [
          {
            message: {
              content: content,
            },
          },
        ],
        usage: {
          prompt_tokens: claudeResponse.usage.input_tokens,
          completion_tokens: claudeResponse.usage.output_tokens,
          total_tokens:
            claudeResponse.usage.input_tokens +
            claudeResponse.usage.output_tokens,
        },
      };
    } else {
      // OpenAI API call
      response = await openai.chat.completions.create({
        model: llmSettings.model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert code reviewer and software architect. Analyze the actual codebase thoroughly and provide detailed, actionable analysis based on real implementation.",
          },
          {
            role: "user",
            content: enhancedPrompt,
          },
        ],
        temperature: llmSettings.temperature,
        max_tokens: llmSettings.maxTokens,
        top_p: llmSettings.topP,
        frequency_penalty: llmSettings.frequencyPenalty || 0,
        presence_penalty: llmSettings.presencePenalty || 0,
      });
    }

    return NextResponse.json({
      success: true,
      question: response.choices[0].message.content, // AdminPanel expects 'question' field
      usage: response.usage,
      metadata: {
        provider: llmSettings.provider,
        model: llmSettings.model,
        timestamp: new Date().toISOString(),
        jobRole: jobRole,
        filesAnalyzed: filesAnalyzed,
        repositoryName: repoUrl ? repoUrl.split("/").pop() : "Unknown",
        analysisType: "project_criteria_with_code",
      },
    });
  } catch (error) {
    console.error("Critique Analysis Error:", error);

    // Handle specific Claude errors
    if (
      error instanceof Error &&
      error.message.includes("Claude API error: 404")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `The model "${llmSettings.model}" does not exist or you do not have access to it. Try using "claude-3-sonnet-20240229" or "claude-3-haiku-20240307" instead.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Failed to analyze with ${llmSettings.provider}. ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

// Handle GitHub analysis (existing functionality)
async function handleGitHubAnalysis(body: any) {
  const { repoUrl, analysisType } = body;

  // Extract owner and repo from URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    return NextResponse.json({
      success: false,
      error:
        "Invalid GitHub URL. Use format: https://github.com/username/repository",
    });
  }

  const [, owner, repo] = match;

  console.log(`Analyzing GitHub repo: ${owner}/${repo}`);

  // Fetch key files from GitHub API
  const files = await fetchRepositoryFiles(owner, repo);

  if (Object.keys(files).length === 0) {
    return NextResponse.json({
      success: false,
      error:
        "No accessible files found. Repository might be private or not exist.",
    });
  }

  // Analyze based on actual code
  const analysis = await analyzeCodeWithAI(files, analysisType);

  return NextResponse.json({
    success: true,
    question: analysis, // Change to 'question' for AdminPanel consistency
    usage: null, // GitHub analysis doesn't have usage stats
    metadata: {
      repo: `${owner}/${repo}`,
      filesAnalyzed: Object.keys(files).length,
      timestamp: new Date().toISOString(),
      analysisType: analysisType,
    },
  });
}

// app/api/admin/github-analyze/route.ts - Updated fetchRepositoryFiles function

async function fetchRepositoryFiles(owner: string, repo: string) {
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

  // ✅ ADD GITHUB TOKEN AUTHENTICATION
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Interview-App-Analyzer",
  };

  // Add GitHub token if available
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    console.log("🔑 Using GitHub token for authentication");
  } else {
    console.warn("⚠️ No GitHub token found - using unauthenticated requests");
  }

  // Key files to analyze for interview app (updated for chat-based architecture)
  const filesToFetch = [
    "app/page.tsx",
    "app/layout.tsx",
    "app/api/chat/route.ts",
    "app/api/admin/github-analyze/route.ts",
    "components/chat/ChatInterface.tsx",
    "components/chat/ChatMessage.tsx",
    "components/chat/ChatInput.tsx",
    "components/chat/TypingIndicator.tsx",
    "components/ui/Button.tsx",
    "components/ui/Input.tsx",
    "lib/openai.ts",
    "lib/claud.ts",
    "lib/utils.ts",
    "lib/validation.ts",
    "lib/errorHandler.ts",
    "lib/security.ts",
    "config/prompts.ts",
    "types/chat.ts",
    "types/admin.ts",
    "hooks/useChat.ts",
    "hooks/useAdminPanel.ts",
    "package.json",
    "README.md",
    "assignment.md",
    "next.config.ts",
    "tsconfig.json",
  ];

  const files: Record<string, string> = {};
  let successCount = 0;
  let errorCount = 0;

  for (const filePath of filesToFetch) {
    try {
      console.log(`🔍 Fetching: ${filePath}`);

      const response = await fetch(`${baseUrl}/${filePath}`, {
        headers,
        // Add cache control
        cache: "no-cache",
      });

      if (response.ok) {
        const data = await response.json();

        // Check if it's a file (not a directory)
        if (data.type === "file" && data.content) {
          // Decode base64 content
          const content = Buffer.from(data.content, "base64").toString("utf-8");
          files[filePath] = content;
          successCount++;
          console.log(
            `✅ Successfully fetched ${filePath} (${content.length} chars)`
          );
        } else {
          console.log(`⚠️ ${filePath} is not a file or has no content`);
        }
      } else if (response.status === 404) {
        console.log(`⚠️ File not found: ${filePath}`);
      } else if (response.status === 403) {
        console.log(`❌ Access forbidden for ${filePath} (Status: 403)`);
        errorCount++;

        // Check if it's a rate limit issue
        const rateLimitRemaining = response.headers.get(
          "x-ratelimit-remaining"
        );
        if (rateLimitRemaining === "0") {
          console.error("🚫 GitHub API rate limit exceeded!");
          break; // Stop trying if rate limited
        }
      } else {
        console.log(
          `❌ Error fetching ${filePath}: ${response.status} ${response.statusText}`
        );
        errorCount++;
      }
    } catch (err) {
      console.warn(`Could not fetch ${filePath}:`, err);
      errorCount++;
    }

    // Add small delay to be nice to GitHub API
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(
    `📊 GitHub fetch summary: ${successCount} successful, ${errorCount} errors`
  );

  // If we got no files at all, return empty with helpful error
  if (Object.keys(files).length === 0) {
    console.error("❌ No files were successfully fetched from GitHub");
  }

  return files;
}

async function analyzeCodeWithAI(
  files: Record<string, string>,
  analysisType: string
) {
  // Create a summary of the codebase
  const codeStructure = Object.entries(files)
    .map(([path, content]) => {
      if (path === "package.json") {
        return `=== ${path} ===\n${content}\n`;
      }
      // Truncate very long files to avoid token limits
      const truncated =
        content.length > 3000
          ? content.substring(0, 3000) + "\n... (truncated)"
          : content;
      return `=== ${path} ===\n${truncated}\n`;
    })
    .join("\n");

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

OVERALL SCORE: X/10

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

OVERALL SCORE: X/10

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

OVERALL SCORE: X/10

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

OVERALL SCORE: X/10

Focus on measurable performance improvements.`,
  };

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Use GPT-4o-mini to match your settings
    messages: [
      {
        role: "system",
        content:
          'You are a senior software architect and security expert. Analyze the provided real codebase thoroughly and provide specific, actionable recommendations with file/line references where possible. Always end with "OVERALL SCORE: X/10".',
      },
      {
        role: "user",
        content:
          prompts[analysisType as keyof typeof prompts] || prompts.codeQuality,
      },
    ],
    temperature: 0.2, // Lower temperature for more focused analysis
    max_tokens: 2000, // More tokens for detailed analysis
  });

  return response.choices[0].message.content;
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "Enhanced Admin API is running!",
    features: [
      "Project Criteria Validation WITH GitHub Files",
      "GitHub Security Analysis",
      "Code Quality Review",
      "Architecture Analysis",
      "Performance Analysis",
      "Cross-Validation Support",
      "Multi-LLM Support (OpenAI + Claude)",
      "Real Code Implementation Analysis",
    ],
    timestamp: new Date().toISOString(),
  });
}
