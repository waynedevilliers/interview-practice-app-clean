import { useState, useCallback } from 'react';
import { ConversationState, ChatMessage, ChatResponse } from '@/types/chat';

const initialState: ConversationState = {
  stage: 'greeting',
  userData: {},
  messages: [],
  currentQuestionCount: 0,
  maxQuestions: 5,
  isLoading: false,
};

export function useChat() {
  const [state, setState] = useState<ConversationState>(initialState);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  const sendMessage = useCallback(async (userMessage: string) => {
    // Add user message immediately
    addMessage('user', userMessage);
    
    // Set loading state
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          stage: state.stage,
          userData: state.userData,
          questionCount: state.currentQuestionCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data: ChatResponse = await response.json();
      
      // Add assistant response
      addMessage('assistant', data.message);
      
      // Update conversation state
      setState(prev => ({
        ...prev,
        stage: data.stage,
        userData: data.userData,
        currentQuestionCount: data.questionCount,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.stage, state.userData, state.currentQuestionCount, addMessage]);

  const startConversation = useCallback(() => {
    addMessage('assistant', 'Hello! I\'m your technical interview assistant. What\'s your name?');
  }, [addMessage]);

  const resetConversation = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    sendMessage,
    startConversation,
    resetConversation,
  };
}