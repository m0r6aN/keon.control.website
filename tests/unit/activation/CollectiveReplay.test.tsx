/**
 * CollectiveReplay — Unit Tests
 *
 * Covers:
 *   1. Component renders without crashing
 *   2. Demo disclaimer label is ALWAYS present
 *   3. data-testid="collective-replay" is present
 *   4. No real user data is present (no "your data" claims)
 *   5. Replay container renders in the DOM
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CollectiveReplay } from "@/components/activation/CollectiveReplay";

describe("CollectiveReplay", () => {
  it("renders without crashing", () => {
    expect(() => render(<CollectiveReplay />)).not.toThrow();
  });

  it("renders the collective-replay container", () => {
    render(<CollectiveReplay />);
    expect(screen.getByTestId("collective-replay")).toBeInTheDocument();
  });

  it("always shows the example scenario disclaimer", () => {
    render(<CollectiveReplay />);
    const disclaimer = screen.getByTestId("replay-disclaimer");
    expect(disclaimer).toBeInTheDocument();
    expect(disclaimer.textContent).toMatch(/example scenario/i);
    expect(disclaimer.textContent).toMatch(/not from your environment/i);
  });

  it("disclaimer has accessible aria-label", () => {
    render(<CollectiveReplay />);
    const disclaimer = screen.getByTestId("replay-disclaimer");
    expect(disclaimer).toHaveAttribute("aria-label", "Example scenario disclaimer");
  });

  it("SVG canvas is present and aria-hidden", () => {
    render(<CollectiveReplay />);
    const svg = document.querySelector("svg[aria-hidden='true']");
    expect(svg).toBeInTheDocument();
  });

  it("does not claim data is from the user's environment", () => {
    render(<CollectiveReplay />);
    const container = screen.getByTestId("collective-replay");
    // Must not contain language that implies real user data
    expect(container.textContent).not.toMatch(/your data/i);
    expect(container.textContent).not.toMatch(/your environment is/i);
  });

  it("accepts a className prop without error", () => {
    expect(() => render(<CollectiveReplay className="test-class" />)).not.toThrow();
  });
});
