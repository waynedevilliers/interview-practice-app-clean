// __tests__/components/JobRoleInput.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { JobRoleInput } from "@/components/interview/JobRoleInput";

describe("JobRoleInput", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders input with label", () => {
    render(<JobRoleInput value="" onChange={mockOnChange} />);

    expect(screen.getByLabelText("Job Role *")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Frontend Developer/)
    ).toBeInTheDocument();
  });

  it("displays current value", () => {
    render(<JobRoleInput value="Software Engineer" onChange={mockOnChange} />);

    expect(screen.getByDisplayValue("Software Engineer")).toBeInTheDocument();
  });

  it("calls onChange when typing", () => {
    render(<JobRoleInput value="" onChange={mockOnChange} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Data Scientist" },
    });

    expect(mockOnChange).toHaveBeenCalledWith("Data Scientist");
  });

  it("disables input when disabled prop is true", () => {
    render(<JobRoleInput value="" onChange={mockOnChange} disabled />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("shows required field indicator", () => {
    render(<JobRoleInput value="" onChange={mockOnChange} />);

    expect(screen.getByText(/Job Role \*/)).toBeInTheDocument();
  });
});
