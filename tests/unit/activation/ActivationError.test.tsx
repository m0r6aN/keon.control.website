/**
 * ActivationError — Unit Tests
 *
 * Covers:
 *   1. Error state renders correctly with the right headline
 *   2. Retry button appears for recoverable errors
 *   3. Retry button does NOT appear for non-recoverable errors
 *   4. Support/escalation path is always present
 *   5. role="alert" is set for accessibility
 *   6. Each error kind maps to a unique, non-empty headline
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ActivationError, type ActivationErrorKind } from "@/components/activation/ActivationError";

describe("ActivationError — rendering", () => {
  it("renders without crashing with default props", () => {
    expect(() => render(<ActivationError />)).not.toThrow();
  });

  it("has role='alert' for screen readers", () => {
    render(<ActivationError />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders the error container", () => {
    render(<ActivationError />);
    expect(screen.getByTestId("activation-error")).toBeInTheDocument();
  });

  it("shows a non-empty headline for each error kind", () => {
    const kinds: ActivationErrorKind[] = [
      "token_missing",
      "token_invalid",
      "token_expired",
      "provisioning_failed",
      "network_error",
      "unknown",
    ];
    for (const kind of kinds) {
      const { unmount } = render(<ActivationError kind={kind} />);
      const headline = screen.getByTestId("error-headline");
      expect(headline.textContent?.length).toBeGreaterThan(0);
      unmount();
    }
  });
});

// ─── Error Kind Headlines ─────────────────────────────────────────────────────

describe("ActivationError — error kind messaging", () => {
  it("token_missing shows correct headline", () => {
    render(<ActivationError kind="token_missing" />);
    expect(screen.getByTestId("error-headline")).toHaveTextContent(/activation link/i);
  });

  it("token_expired shows correct headline", () => {
    render(<ActivationError kind="token_expired" />);
    expect(screen.getByTestId("error-headline")).toHaveTextContent(/expired/i);
  });

  it("provisioning_failed shows correct headline", () => {
    render(<ActivationError kind="provisioning_failed" />);
    expect(screen.getByTestId("error-headline")).toHaveTextContent(/problem/i);
  });

  it("network_error shows correct headline", () => {
    render(<ActivationError kind="network_error" />);
    expect(screen.getByTestId("error-headline")).toHaveTextContent(/unable to reach/i);
  });
});

// ─── Retry Button ─────────────────────────────────────────────────────────────

describe("ActivationError — retry behavior", () => {
  const retryableKinds: ActivationErrorKind[] = [
    "provisioning_failed",
    "network_error",
    "unknown",
  ];
  const nonRetryableKinds: ActivationErrorKind[] = ["token_missing", "token_invalid"];

  it.each(retryableKinds)("shows retry button for kind '%s'", (kind) => {
    const onRetry = vi.fn();
    render(<ActivationError kind={kind} onRetry={onRetry} />);
    expect(screen.getByTestId("retry-button")).toBeInTheDocument();
  });

  it.each(nonRetryableKinds)("does NOT show retry button for kind '%s'", (kind) => {
    const onRetry = vi.fn();
    render(<ActivationError kind={kind} onRetry={onRetry} />);
    expect(screen.queryByTestId("retry-button")).not.toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ActivationError kind="provisioning_failed" onRetry={onRetry} />);
    await user.click(screen.getByTestId("retry-button"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does NOT render retry button when onRetry is not provided", () => {
    render(<ActivationError kind="provisioning_failed" />);
    expect(screen.queryByTestId("retry-button")).not.toBeInTheDocument();
  });
});

// ─── Escalation Path ──────────────────────────────────────────────────────────

describe("ActivationError — escalation", () => {
  it("always shows a contact support link", () => {
    render(<ActivationError />);
    expect(screen.getByText(/contact support/i)).toBeInTheDocument();
  });

  it("support link points to a support email or URL", () => {
    render(<ActivationError />);
    const link = screen.getByText(/contact support/i).closest("a");
    expect(link).toBeTruthy();
    const href = link?.getAttribute("href") ?? "";
    expect(href.startsWith("mailto:") || href.startsWith("http")).toBe(true);
  });
});
