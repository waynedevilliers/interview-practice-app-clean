import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '@/hooks/useChat';

// Mock fetch
global.fetch = jest.fn();

describe('useChat', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.state).toEqual({
      stage: 'greeting',
      userData: {},
      messages: [],
      currentQuestionCount: 0,
      maxQuestions: 5,
      isLoading: false,
    });
  });

  it('should start conversation by adding welcome message', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.startConversation();
    });

    expect(result.current.state.messages).toHaveLength(1);
    expect(result.current.state.messages[0]).toMatchObject({
      role: 'assistant',
      content: 'Hello! I\'m your AI technical interviewer. What\'s your name?',
    });
  });

  it('should reset conversation to initial state', () => {
    const { result } = renderHook(() => useChat());

    // Start conversation and add some messages
    act(() => {
      result.current.startConversation();
    });

    // Reset conversation
    act(() => {
      result.current.resetConversation();
    });

    expect(result.current.state).toEqual({
      stage: 'greeting',
      userData: {},
      messages: [],
      currentQuestionCount: 0,
      maxQuestions: 5,
      isLoading: false,
    });
  });

  it('should send message and handle successful response', async () => {
    const mockResponse = {
      message: 'Nice to meet you, John!',
      stage: 'job',
      userData: { name: 'John' },
      questionCount: 0,
      isComplete: false,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('John');
    });

    expect(result.current.state.messages).toHaveLength(2);
    expect(result.current.state.messages[0]).toMatchObject({
      role: 'user',
      content: 'John',
    });
    expect(result.current.state.messages[1]).toMatchObject({
      role: 'assistant',
      content: 'Nice to meet you, John!',
    });
    expect(result.current.state.stage).toBe('job');
    expect(result.current.state.userData).toEqual({ name: 'John' });
    expect(result.current.state.isLoading).toBe(false);
  });

  it('should set loading state during message sending', async () => {
    const mockResponse = {
      message: 'Test response',
      stage: 'job',
      userData: {},
      questionCount: 0,
      isComplete: false,
    };

    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(promise as any);

    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.sendMessage('Test message');
    });

    expect(result.current.state.isLoading).toBe(true);

    await act(async () => {
      resolvePromise!({
        ok: true,
        json: async () => mockResponse,
      });
      await promise;
    });

    expect(result.current.state.isLoading).toBe(false);
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    expect(result.current.state.messages).toHaveLength(2);
    expect(result.current.state.messages[0]).toMatchObject({
      role: 'user',
      content: 'Test message',
    });
    expect(result.current.state.messages[1]).toMatchObject({
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please try again.',
    });
    expect(result.current.state.isLoading).toBe(false);
  });

  it('should handle non-ok response status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    expect(result.current.state.messages).toHaveLength(2);
    expect(result.current.state.messages[1]).toMatchObject({
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please try again.',
    });
  });

  it('should send correct request payload', async () => {
    const mockResponse = {
      message: 'Test response',
      stage: 'job',
      userData: { name: 'John' },
      questionCount: 1,
      isComplete: false,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Frontend Developer');
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Frontend Developer',
        stage: 'greeting', // Initial stage
        userData: {},      // Initial userData
        questionCount: 0,  // Initial questionCount
      }),
    });
  });

  it('should update conversation state correctly', async () => {
    const mockResponse = {
      message: 'Question 1 of 5: What is React?',
      stage: 'interviewing',
      userData: { name: 'John', jobRole: 'Frontend Developer', difficulty: 7 },
      questionCount: 1,
      isComplete: false,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('7');
    });

    expect(result.current.state.stage).toBe('interviewing');
    expect(result.current.state.userData).toEqual({
      name: 'John',
      jobRole: 'Frontend Developer',
      difficulty: 7,
    });
    expect(result.current.state.currentQuestionCount).toBe(1);
  });

  it('should generate unique message IDs', async () => {
    const mockResponse1 = {
      message: 'Response 1',
      stage: 'job',
      userData: {},
      questionCount: 0,
      isComplete: false,
    };

    const mockResponse2 = {
      message: 'Response 2',
      stage: 'job_description',
      userData: {},
      questionCount: 0,
      isComplete: false,
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse1,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse2,
      } as Response);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Message 1');
    });

    await act(async () => {
      await result.current.sendMessage('Message 2');
    });

    const messageIds = result.current.state.messages.map(msg => msg.id);
    const uniqueIds = new Set(messageIds);
    
    expect(uniqueIds.size).toBe(messageIds.length);
    expect(messageIds.length).toBe(4); // 2 user messages + 2 assistant messages
  });

  it('should add timestamps to messages', async () => {
    const mockResponse = {
      message: 'Test response',
      stage: 'job',
      userData: {},
      questionCount: 0,
      isComplete: false,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    expect(result.current.state.messages[0].timestamp).toBeInstanceOf(Date);
    expect(result.current.state.messages[1].timestamp).toBeInstanceOf(Date);
  });
});