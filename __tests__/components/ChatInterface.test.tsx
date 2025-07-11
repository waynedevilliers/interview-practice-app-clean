import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from '@/components/chat/ChatInterface';

// Mock the useChat hook
jest.mock('@/hooks/useChat', () => ({
  useChat: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('ChatInterface', () => {
  const mockUseChat = require('@/hooks/useChat').useChat;
  const mockSendMessage = jest.fn();
  const mockStartConversation = jest.fn();
  const mockResetConversation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseChat.mockReturnValue({
      state: {
        stage: 'greeting',
        userData: {},
        messages: [],
        currentQuestionCount: 0,
        maxQuestions: 5,
        isLoading: false,
      },
      sendMessage: mockSendMessage,
      startConversation: mockStartConversation,
      resetConversation: mockResetConversation,
    });
  });

  it('should render chat interface with header', () => {
    render(<ChatInterface />);

    expect(screen.getByText('🎯 Technical Interview Practice')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });

  it('should start conversation when component mounts with no messages', () => {
    render(<ChatInterface />);

    expect(mockStartConversation).toHaveBeenCalledTimes(1);
  });

  it('should not start conversation when messages exist', () => {
    mockUseChat.mockReturnValue({
      state: {
        stage: 'interviewing',
        userData: { name: 'John' },
        messages: [
          {
            id: '1',
            role: 'assistant',
            content: 'Hello!',
            timestamp: new Date(),
          },
        ],
        currentQuestionCount: 1,
        maxQuestions: 5,
        isLoading: false,
      },
      sendMessage: mockSendMessage,
      startConversation: mockStartConversation,
      resetConversation: mockResetConversation,
    });

    render(<ChatInterface />);

    expect(mockStartConversation).not.toHaveBeenCalled();
  });

  it('should display messages from state', () => {
    mockUseChat.mockReturnValue({
      state: {
        stage: 'job',
        userData: { name: 'John' },
        messages: [
          {
            id: '1',
            role: 'assistant',
            content: 'Hello! What\'s your name?',
            timestamp: new Date(),
          },
          {
            id: '2',
            role: 'user',
            content: 'John',
            timestamp: new Date(),
          },
        ],
        currentQuestionCount: 0,
        maxQuestions: 5,
        isLoading: false,
      },
      sendMessage: mockSendMessage,
      startConversation: mockStartConversation,
      resetConversation: mockResetConversation,
    });

    render(<ChatInterface />);

    expect(screen.getByText('Hello! What\'s your name?')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('should show typing indicator when loading', () => {
    mockUseChat.mockReturnValue({
      state: {
        stage: 'greeting',
        userData: {},
        messages: [],
        currentQuestionCount: 0,
        maxQuestions: 5,
        isLoading: true,
      },
      sendMessage: mockSendMessage,
      startConversation: mockStartConversation,
      resetConversation: mockResetConversation,
    });

    render(<ChatInterface />);

    expect(screen.getByText('Typing')).toBeInTheDocument();
  });

  it('should show progress info during interviewing', () => {
    mockUseChat.mockReturnValue({
      state: {
        stage: 'interviewing',
        userData: { name: 'John' },
        messages: [],
        currentQuestionCount: 3,
        maxQuestions: 5,
        isLoading: false,
      },
      sendMessage: mockSendMessage,
      startConversation: mockStartConversation,
      resetConversation: mockResetConversation,
    });

    render(<ChatInterface />);

    expect(screen.getByText('Question 3 of 5')).toBeInTheDocument();
  });

  it('should call sendMessage when user sends a message', async () => {
    const user = userEvent.setup();
    
    render(<ChatInterface />);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    await user.type(input, 'Hello, world!');
    await user.click(sendButton);

    expect(mockSendMessage).toHaveBeenCalledWith('Hello, world!');
  });

  it('should call resetConversation when reset button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<ChatInterface />);

    const resetButton = screen.getByRole('button', { name: 'Reset' });
    await user.click(resetButton);

    expect(mockResetConversation).toHaveBeenCalledTimes(1);
  });

  it('should show appropriate placeholder for different stages', () => {
    const testCases = [
      { stage: 'name', placeholder: 'Enter your name...' },
      { stage: 'job', placeholder: 'Enter the job role you\'re preparing for...' },
      { stage: 'job_description', placeholder: 'Describe the job or type "skip" to continue...' },
      { stage: 'difficulty', placeholder: 'Enter difficulty level (1-10)...' },
      { stage: 'interviewing', placeholder: 'Type your answer...' },
    ];

    testCases.forEach(({ stage, placeholder }) => {
      mockUseChat.mockReturnValue({
        state: {
          stage,
          userData: {},
          messages: [],
          currentQuestionCount: 0,
          maxQuestions: 5,
          isLoading: false,
        },
        sendMessage: mockSendMessage,
        startConversation: mockStartConversation,
        resetConversation: mockResetConversation,
      });

      const { unmount } = render(<ChatInterface />);
      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
      unmount();
    });
  });

  it('should disable input when loading', () => {
    mockUseChat.mockReturnValue({
      state: {
        stage: 'greeting',
        userData: {},
        messages: [],
        currentQuestionCount: 0,
        maxQuestions: 5,
        isLoading: true,
      },
      sendMessage: mockSendMessage,
      startConversation: mockStartConversation,
      resetConversation: mockResetConversation,
    });

    render(<ChatInterface />);

    const input = screen.getByPlaceholderText('Type your message...');
    expect(input).toBeDisabled();
  });
});