import { expect, test } from "@playwright/test";

test("first-run customer sees welcome, required setup, and ready state", async ({ page, baseURL }) => {
  test.skip(!baseURL, "BASE_URL is required for smoke tests.");

  await page.goto("/welcome");
  await expect(page.getByRole("heading", { name: /keon control makes ai-driven work accountable/i })).toBeVisible();
  await page.getByRole("button", { name: /set up workspace/i }).click();

  await expect(page.getByRole("heading", { name: /what do you want to use keon for first/i })).toBeVisible();
  await page.getByRole("button", { name: /review important ai actions/i }).click();
  await page.getByRole("button", { name: /^continue$/i }).click();

  await expect(page.getByRole("heading", { name: /confirm your workspace access/i })).toBeVisible();
  await page.getByRole("button", { name: /confirm and continue/i }).click();

  await expect(page.getByRole("heading", { name: /choose your starter guardrails/i })).toBeVisible();
  await page.getByRole("button", { name: /balanced/i }).click();
  await page.getByRole("button", { name: /review ready state/i }).click();

  await expect(page.getByRole("heading", { name: /your workspace is ready/i })).toBeVisible();
  await expect(page.getByText(/optional later/i)).toBeVisible();
});
