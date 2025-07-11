export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-6">
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl px-6 py-4 mr-12">
        <div className="flex items-center text-sm font-medium text-gray-600 mb-3">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Technical Interviewer
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-gray-500">Thinking</div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}