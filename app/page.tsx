"use client";

import ChatInterface from "@/components/chat/ChatInterface";

export default function Home(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Technical Interview Practice
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI-powered conversational interview practice designed specifically for software engineering roles
          </p>
        </div>

        <ChatInterface />
      </div>
    </div>
  );
}
