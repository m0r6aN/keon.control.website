import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WelcomePage } from "@/components/onboarding/welcome-page";

const mockPush = vi.fn();
const mockStartSetup = vi.fn();
const mockUseOnboardingState = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/onboarding/store", () => ({
  useOnboardingState: () => mockUseOnboardingState(),
}));

describe("WelcomePage", () => {
  it("explains the product and starts setup for a first-time customer", async () => {
    mockUseOnboardingState.mockReturnValue({
      state: {
        currentStep: "WELCOME",
        selectedGoals: [],
        workspaceId: null,
        guardrailPreset: null,
        completed: false,
      },
      startSetup: mockStartSetup,
    });

    const user = userEvent.setup();
    render(<WelcomePage />);

    expect(screen.getByRole("heading", { name: /keon control makes ai-driven work accountable/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /set up workspace/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /set up workspace/i }));

    expect(mockStartSetup).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/setup?step=goals");
  });
});
