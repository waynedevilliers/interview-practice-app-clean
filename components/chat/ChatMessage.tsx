import { ChatMessage as ChatMessageType } from '@/types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div
        className={`max-w-[85%] rounded-2xl px-6 py-4 ${
          isUser
            ? 'bg-blue-600 text-white ml-12'
            : 'bg-white text-gray-800 border border-gray-200 shadow-sm mr-12'
        }`}
      >
        {!isUser && (
          <div className="flex items-center text-sm font-medium text-gray-600 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Technical Interviewer
          </div>
        )}
        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
        <div className={`text-xs mt-3 ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}