'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { Button } from '@/components/ui/Button';

export default function ChatInterface() {
  const { state, sendMessage, startConversation, resetConversation } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, state.isLoading]);

  useEffect(() => {
    if (state.messages.length === 0) {
      startConversation();
    }
  }, [startConversation, state.messages.length]);

  const getInputPlaceholder = () => {
    switch (state.stage) {
      case 'name':
        return 'Enter your name...';
      case 'job':
        return 'Enter the job role you\'re preparing for...';
      case 'ai_specialization':
        return 'Choose 1, 2, or 3...';
      case 'job_description':
        return 'Describe the job or type "skip" to continue...';
      case 'difficulty':
        return 'Enter difficulty level (1-10)...';
      case 'interviewing':
        return 'Type your answer...';
      default:
        return 'Type your message...';
    }
  };

  const getProgressInfo = () => {
    if (state.stage === 'interviewing') {
      return `Question ${state.currentQuestionCount} of ${state.maxQuestions}`;
    }
    return null;
  };

  return (
    <div className="flex flex-col h-[700px] max-w-4xl mx-auto bg-gray-50 rounded-2xl shadow-xl border border-gray-200">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 rounded-t-2xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Technical Interview Practice</h2>
            {getProgressInfo() && (
              <p className="text-gray-600 text-sm mt-1 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                {getProgressInfo()}
              </p>
            )}
          </div>
          <Button
            onClick={resetConversation}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm border border-gray-300"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {state.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {state.isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-200 bg-white rounded-b-2xl">
        <ChatInput
          onSendMessage={sendMessage}
          isLoading={state.isLoading}
          placeholder={getInputPlaceholder()}
        />
      </div>
    </div>
  );
}