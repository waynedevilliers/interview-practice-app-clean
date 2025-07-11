import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInput from '@/components/chat/ChatInput';

describe('ChatInput', () => {
  const mockOnSendMessage = jest.fn();

  beforeEach(() => {
    mockOnSendMessage.mockClear();
  });

  it('should render input field and send button', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);

    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('should use custom placeholder', () => {
    render(
      <ChatInput
        onSendMessage={mockOnSendMessage}
        isLoading={false}
        placeholder="Enter your name..."
      />
    );

    expect(screen.getByPlaceholderText('Enter your name...')).toBeInTheDocument();
  });

  it('should call onSendMessage when form is submitted', async () => {
    const user = userEvent.setup();
    
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    await user.type(input, 'Hello, world!');
    await user.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello, world!');
  });

  it('should call onSendMessage when Enter key is pressed', async () => {
    const user = userEvent.setup();
    
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);

    const input = screen.getByPlaceholderText('Type your message...');

    await user.type(input, 'Hello, world!');
    await user.keyboard('{Enter}');

    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello, world!');
  });

  it('should not call onSendMessage when Shift+Enter is pressed', async () => {
    const user = userEvent.setup();
    
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);

    const input = screen.getByPlaceholderText('Type your message...');

    await user.type(input, 'Hello, world!');
    await user.keyboard('{Shift>}{Enter}{/Shift}');

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('should clear input after sending message', async () => {
    const user = userEvent.setup();
    
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    await user.type(input, 'Hello, world!');
    await user.click(sendButton);

    expect(input).toHaveValue('');
  });

  it('should not send empty or whitespace-only messages', async () => {
    const user = userEvent.setup();
    
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    // Test empty message
    await user.click(sendButton);
    expect(mockOnSendMessage).not.toHaveBeenCalled();

    // Test whitespace-only message
    await user.type(input, '   ');
    await user.click(sendButton);
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('should disable input and button when loading', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={true} />);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: '...' });

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('should disable send button when message is empty', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);

    const sendButton = screen.getByRole('button', { name: 'Send' });

    expect(sendButton).toBeDisabled();
  });

  it('should enable send button when message is not empty', async () => {
    const user = userEvent.setup();
    
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    await user.type(input, 'Hello');

    expect(sendButton).toBeEnabled();
  });

  it('should trim whitespace from message before sending', async () => {
    const user = userEvent.setup();
    
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    await user.type(input, '  Hello, world!  ');
    await user.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello, world!');
  });
});