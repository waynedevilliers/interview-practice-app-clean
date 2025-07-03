"use client";

import { useState } from "react";
import QuestionGenerator from "@/components/interview/QuestionGenerator";
import AdminPanel from "@/components/interview/AdminPanel";

export default function Home(): JSX.Element {
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎯 Interview Practice Assistant
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered interview questions tailored to your role and experience
          </p>
        </div>

        <QuestionGenerator />
      </div>

      <AdminPanel
        isVisible={showAdminPanel}
        onToggle={() => setShowAdminPanel(!showAdminPanel)}
      />
    </div>
  );
}
