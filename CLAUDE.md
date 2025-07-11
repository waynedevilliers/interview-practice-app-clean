# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Basic Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm test:watch
```

### Testing
- Uses Jest with jsdom environment
- Test files are in `__tests__/` directory
- Setup file: `__tests__/setup.ts`
- Test patterns: `*.test.ts`, `*.test.tsx`

## Project Architecture

This is a Next.js 15 interview practice application with a **conversational chat interface** designed around natural AI interaction.

### Core Architecture Principles

1. **Conversational Interface**: Single chat component with natural conversation flow (like ChatGPT/Claude)
2. **Proper System Prompts**: Configuration and behavior instructions in system prompts, not user prompts
3. **Conversation State Management**: Tracks conversation stages and user data through custom hooks
4. **AI Provider Support**: Supports OpenAI and Anthropic (Claude) APIs with unified interfaces

### Chat-Based Architecture

#### **Main Components**
- **ChatInterface**: Main conversation component with message history
- **ChatMessage**: Individual message bubbles (user/assistant)
- **ChatInput**: Input field with send functionality
- **useChat**: Custom hook managing conversation state

### Key Architectural Components

#### AI Integration Layer
- **Multi-LLM Support**: Unified interface for OpenAI and Claude APIs
- **Cost Tracking**: Real-time cost estimation and actual usage tracking
- **Parameter Control**: Full control over temperature, tokens, penalties, etc.
- **Prompt Engineering**: Multiple prompting strategies (zero-shot, few-shot, chain-of-thought)

#### Component Structure
```
components/
├── chat/            # Chat interface components (4 components)
│   ├── ChatInterface.tsx       # Main chat container
│   ├── ChatMessage.tsx         # Message bubbles
│   ├── ChatInput.tsx           # Input field
│   └── TypingIndicator.tsx     # Loading indicator
├── admin/           # Admin panel components (legacy - being removed)
├── interview/       # Interview components (legacy - being removed)
└── ui/             # Shared UI components
```

#### Type System
- **chat.ts**: Chat interface types, conversation state, message types
- **interview.ts**: Legacy interview types (being simplified)
- **admin.ts**: Admin panel types (legacy)

#### Security & Validation
- **Input Validation**: Joi schema validation with security patterns
- **Prompt Injection Protection**: Advanced filtering in `lib/security.ts`
- **Rate Limiting**: API endpoint protection
- **Error Handling**: Safe error messages without information leakage

### Conversational Interview System

#### **Conversation Flow**
1. **Greeting**: Bot welcomes user and asks for name
2. **Job Role**: Ask what technical role they're preparing for
3. **Job Description**: Optional job details/technologies
4. **Difficulty**: Ask for difficulty level (1-10)
5. **Interview**: Ask exactly 5 technical questions
6. **Assessment**: Provide final evaluation and feedback

#### **Features**
- **Natural Conversation**: No button clicks, continuous chat flow
- **Proper System Prompts**: Configuration in system prompts, not user prompts
- **Technical Focus**: Focused on technical interviews only (initially)
- **Real-time Feedback**: Brief feedback after each answer
- **Progress Tracking**: Shows question count and progress

### Legacy Features (Being Removed)

#### Admin Panel (Legacy)
- Complex form-based admin interface
- GitHub repository analysis
- Multiple analysis types
- These features are being removed to focus on core chat functionality

## Development Guidelines

### Chat Interface Development
- Keep chat components simple and focused
- Use conversation state management via useChat hook
- Implement proper message flow and error handling
- Focus on natural conversation experience

### System Prompt Best Practices
- Put ALL configuration in system prompts (role, difficulty, behavior)
- Keep user prompts for actual user responses only
- Use separate prompt configuration files (`config/prompts.ts`)
- Test prompt effectiveness with different scenarios

### Conversation Flow
- Each stage should have clear transitions
- Handle invalid inputs gracefully
- Provide helpful prompts to guide user
- Track conversation state properly

### AI Integration
- Use OpenAI client for question generation and feedback
- Implement proper error handling for API failures
- Keep responses natural and conversational
- Separate concerns: generation vs evaluation

## Common Development Patterns

### Adding New Conversation Stages
1. Update `types/chat.ts` ConversationStage type
2. Add stage handling in `app/api/chat/route.ts`
3. Update conversation flow logic
4. Add appropriate prompts in `config/prompts.ts`

### Extending Question Types
1. Modify system prompts to include new question categories
2. Update difficulty scaling if needed
3. Add new question generation templates
4. Test conversation flow with new types

### Adding New AI Providers
1. Create client in `lib/` directory (following OpenAI pattern)
2. Update chat API to support new provider
3. Add provider selection (future feature)
4. Implement unified response format

## Environment Variables

Required:
- `OPENAI_API_KEY`: OpenAI API key
- `ANTHROPIC_API_KEY`: Anthropic API key (optional)
- `GITHUB_TOKEN`: GitHub token for repository analysis (optional)

## API Structure

### Chat API (`/api/chat/`)
- `POST /api/chat/` - Handle conversational flow
  - Takes: message, stage, userData, questionCount
  - Returns: message, stage, userData, questionCount, isComplete

### Legacy APIs (Being Removed)
- `/api/interview/` - Legacy form-based question generation
- `/api/admin/` - Legacy admin panel functionality

## File Organization

- **Components**: `components/chat/` - Chat interface components
- **Hooks**: `hooks/useChat.ts` - Chat state management
- **Config**: `config/prompts.ts` - System and conversation prompts
- **Types**: `types/chat.ts` - Chat interface types
- **API Routes**: `app/api/chat/` - Conversational API endpoint
- **Legacy**: Other directories contain legacy components being removed

## Key Dependencies

- **AI**: `openai` (primary), `@anthropic-ai/sdk` (optional)
- **UI**: `lucide-react`, `react-hot-toast`, Next.js 15
- **Testing**: `jest`, `@testing-library/react`
- **Legacy**: `joi`, `helmet` (will be simplified)