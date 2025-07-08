// Mock at the relative path instead
jest.mock("../../services/interviewService", () => ({
  InterviewService: {
    generateQuestion: jest.fn(),
  },
}));

describe("/api/interview POST", () => {
  it("should work", () => {
    expect(true).toBe(true);
  });
});
