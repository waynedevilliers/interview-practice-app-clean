# Interview Practice Assistant

A modern, AI-powered interview preparation application built with Next.js and OpenAI API. Practice technical, behavioral, and industry-specific interview questions with real-time AI feedback and cost tracking.

## Features

### Core Functionality

- **AI-Generated Questions**: Customized interview questions based on job role, type, and difficulty
- **Multiple Interview Types**: Technical, behavioral, system design, coding challenges, leadership, and cultural fit
- **Intelligent Difficulty Scaling**: 10-level difficulty system with smart question complexity
- **Real-time Answer Evaluation**: AI-powered feedback with scoring and improvement suggestions

### Advanced Features

- **User-Controlled AI Settings**: Adjust temperature, model selection, token limits, and more
- **Cost Tracking**: Real-time cost estimation and actual usage tracking
- **Job Description Integration**: Paste job descriptions for targeted, relevant questions
- **Admin Panel**: GitHub repository analysis and code review tools
- **Security**: Input validation, rate limiting, and prompt injection protection

### Supported Models

- GPT-4o Mini (Recommended)
- GPT-4 Turbo
- GPT-4
- GPT-3.5 Turbo

## Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- OpenAI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd interview-practice-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to start using the app.

## How to Use

### Basic Interview Practice

1. **Configure Interview Settings**

   - Enter your target job role
   - Select interview type (technical, behavioral, etc.)
   - Set difficulty level (1-10)
   - Optionally add job description for targeted questions

2. **Customize AI Settings** (Optional)

   - Choose AI model
   - Adjust creativity/temperature
   - Set response length
   - Configure advanced parameters

3. **Generate Questions**

   - Click "Generate Question"
   - Review the AI-generated interview question
   - See real-time cost information

4. **Practice and Get Feedback**
   - Type your answer in the provided text area
   - Submit for AI evaluation
   - Receive detailed feedback with scoring
   - Get specific improvement suggestions

### Admin Features

- Access advanced GitHub repository analysis
- Perform security, code quality, and architecture reviews
- Get AI-powered project critiques

## Project Structure

```
interview-practice-app/
├── app/
│   ├── api/
│   │   ├── interview/         # Main interview API endpoint
│   │   └── admin/            # Admin panel APIs
│   ├── components/
│   │   ├── interview/        # Interview-related components
│   │   └── ui/              # Shared UI components
│   ├── lib/                 # Utility functions and configs
│   ├── services/            # Business logic services
│   ├── types/               # TypeScript type definitions
│   └── page.tsx             # Main application page
├── hooks/                   # Custom React hooks
└── public/                  # Static assets
```

## Technology Stack

### Frontend

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Tailwind

### Backend

- **API**: Next.js API routes
- **AI Integration**: OpenAI API (GPT models)
- **Validation**: Joi schema validation
- **Security**: Rate limiting, input sanitization

### Development

- **Package Manager**: npm/yarn/pnpm/bun
- **Environment**: Node.js 18+
- **Code Quality**: TypeScript strict mode

## Configuration

### Environment Variables

```env
# Required
OPENAI_API_KEY=your_openai_api_key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### AI Model Settings

The app supports various OpenAI models with different pricing:

- **GPT-4o Mini**: $0.00015/1K input tokens, $0.0006/1K output tokens
- **GPT-4 Turbo**: $0.01/1K input tokens, $0.03/1K output tokens
- **GPT-4**: $0.03/1K input tokens, $0.06/1K output tokens
- **GPT-3.5 Turbo**: $0.0015/1K input tokens, $0.002/1K output tokens

## Security Features

- **Input Validation**: Comprehensive validation with security patterns
- **Rate Limiting**: API endpoint protection against abuse
- **Sanitization**: User input cleaning to prevent injection attacks
- **Error Handling**: Safe error messages without information leakage

## Development

### Local Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Adding New Interview Types

1. Update the `InterviewFormData` interface in `types/interview.ts`
2. Add validation in `lib/validation.ts`
3. Update prompt logic in `services/interviewService.ts`
4. Add UI options in the form component

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment

1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Ensure environment variables are set

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Common Issues

**API Key Errors**

- Ensure `OPENAI_API_KEY` is set in `.env.local`
- Verify the API key is valid and has sufficient credits

**Build Errors**

- Check TypeScript errors: `npm run type-check`
- Ensure all dependencies are installed: `npm install`

**Performance Issues**

- Adjust AI model settings for faster responses
- Use GPT-3.5 Turbo for quicker generation
- Reduce max tokens for shorter responses

## License

This project is for educational and personal use. Please respect OpenAI's usage policies when using their API.

## Support

For questions or issues:

1. Check the troubleshooting section
2. Review the assignment documentation
3. Open an issue in the repository

---

Built with ❤️ using Next.js and OpenAI API

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
