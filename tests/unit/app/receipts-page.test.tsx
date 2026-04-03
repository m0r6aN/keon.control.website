import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ReceiptsPage from "@/app/receipts/page";

vi.mock("@/components/layout", () => ({
  Shell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DataSourceNotice: ({ title, description }: { title: string; description: string }) => (
    <div>
      <span>{title}</span>
      <span>{description}</span>
    </div>
  ),
}));

vi.mock("@/components/layout/page-container", () => ({
  PageContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PageHeader: ({ title, description }: { title: ReactNode; description?: ReactNode }) => (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardHeader: ({ title, description }: { title: ReactNode; description?: ReactNode }) => (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  ),
  CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("next/link", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ entries: [] }),
    }))
  );
});

describe("ReceiptsPage", () => {
  it("labels sample data clearly", async () => {
    render(<ReceiptsPage />);

    expect(screen.getByText(/sample receipts/i)).toBeInTheDocument();
    expect(screen.getByText(/not from your connected systems/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/no receipts match this search/i)).toBeInTheDocument();
    });
  });
});
