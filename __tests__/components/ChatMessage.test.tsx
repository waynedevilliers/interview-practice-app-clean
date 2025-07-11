import { render, screen } from '@testing-library/react';
import ChatMessage from '@/components/chat/ChatMessage';
import { ChatMessage as ChatMessageType } from '@/types/chat';

describe('ChatMessage', () => {
  const mockTimestamp = new Date('2023-01-01T10:00:00Z');

  it('should render user message correctly', () => {
    const userMessage: ChatMessageType = {
      id: '1',
      role: 'user',
      content: 'Hello, I am John',
      timestamp: mockTimestamp,
    };

    render(<ChatMessage message={userMessage} />);

    expect(screen.getByText('Hello, I am John')).toBeInTheDocument();
    expect(screen.getByText(mockTimestamp.toLocaleTimeString())).toBeInTheDocument();
    expect(screen.queryByText('🤖 AI Interviewer')).not.toBeInTheDocument();
  });

  it('should render assistant message correctly', () => {
    const assistantMessage: ChatMessageType = {
      id: '2',
      role: 'assistant',
      content: 'Nice to meet you, John! What technical role are you preparing for?',
      timestamp: mockTimestamp,
    };

    render(<ChatMessage message={assistantMessage} />);

    expect(screen.getByText('Nice to meet you, John! What technical role are you preparing for?')).toBeInTheDocument();
    expect(screen.getByText('🤖 AI Interviewer')).toBeInTheDocument();
    expect(screen.getByText(mockTimestamp.toLocaleTimeString())).toBeInTheDocument();
  });

  it('should apply correct styling for user messages', () => {
    const userMessage: ChatMessageType = {
      id: '1',
      role: 'user',
      content: 'Test message',
      timestamp: mockTimestamp,
    };

    const { container } = render(<ChatMessage message={userMessage} />);
    const messageContainer = container.querySelector('.justify-end');
    const messageBox = container.querySelector('.bg-blue-500');

    expect(messageContainer).toBeInTheDocument();
    expect(messageBox).toBeInTheDocument();
  });

  it('should apply correct styling for assistant messages', () => {
    const assistantMessage: ChatMessageType = {
      id: '2',
      role: 'assistant',
      content: 'Test message',
      timestamp: mockTimestamp,
    };

    const { container } = render(<ChatMessage message={assistantMessage} />);
    const messageContainer = container.querySelector('.justify-start');
    const messageBox = container.querySelector('.bg-gray-100');

    expect(messageContainer).toBeInTheDocument();
    expect(messageBox).toBeInTheDocument();
  });

  it('should preserve line breaks in message content', () => {
    const messageWithLineBreaks: ChatMessageType = {
      id: '3',
      role: 'assistant',
      content: 'Line 1\nLine 2\nLine 3',
      timestamp: mockTimestamp,
    };

    const { container } = render(<ChatMessage message={messageWithLineBreaks} />);
    const messageContent = container.querySelector('.whitespace-pre-wrap');

    expect(messageContent).toBeInTheDocument();
    expect(messageContent?.textContent).toBe('Line 1\nLine 2\nLine 3');
  });
});