"use client";

import { useState } from "react";

interface FormData {
  jobRole: string;
  interviewType: string;
  difficulty: number;
}

interface InterviewFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export default function InterviewForm({
  onSubmit,
  isLoading = false,
}: InterviewFormProps) {
  const [formData, setFormData] = useState<FormData>({
    jobRole: "",
    interviewType: "technical",
    difficulty: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        🎯 Interview Setup
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="jobRole"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Job Role *
          </label>
          <input
            type="text"
            id="jobRole"
            value={formData.jobRole}
            onChange={(e) =>
              setFormData({ ...formData, jobRole: e.target.value })
            }
            placeholder="e.g., Frontend Developer, Data Scientist"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="interviewType"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Interview Type
          </label>
          <select
            id="interviewType"
            value={formData.interviewType}
            onChange={(e) =>
              setFormData({ ...formData, interviewType: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="technical">💻 Technical</option>
            <option value="behavioral">🧠 Behavioral</option>
            <option value="industry">🏢 Industry-Specific</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="difficulty"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Difficulty:{" "}
            <span className="font-bold text-blue-600">
              {formData.difficulty}/10
            </span>
          </label>
          <input
            type="range"
            id="difficulty"
            min="1"
            max="10"
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: Number(e.target.value) })
            }
            className="w-full"
            disabled={isLoading}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Entry Level</span>
            <span>Senior Expert</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.jobRole.trim()}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? "Generating..." : "🚀 Generate Question"}
        </button>
      </form>
    </div>
  );
}
