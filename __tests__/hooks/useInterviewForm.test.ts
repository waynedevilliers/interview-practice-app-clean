import { renderHook, act } from "@testing-library/react";
import { useInterviewForm } from "@/hooks/useInterviewForm";

describe("useInterviewForm", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it("initializes with default values", () => {
    const { result } = renderHook(() =>
      useInterviewForm({ onSubmit: mockOnSubmit })
    );

    expect(result.current.formData.jobRole).toBe("");
    expect(result.current.formData.interviewType).toBe("technical");
    expect(result.current.formData.difficulty).toBe(5);
    expect(result.current.openAISettings.temperature).toBe(0.7);
  });

  it("calculates cost correctly", () => {
    const { result } = renderHook(() =>
      useInterviewForm({ onSubmit: mockOnSubmit })
    );

    expect(result.current.costInfo).toBeDefined();
    expect(result.current.costInfo?.estimatedCost).toBeGreaterThan(0);
    expect(result.current.costInfo?.estimatedTokens).toBeGreaterThan(0);
  });
});
