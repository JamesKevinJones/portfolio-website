import { test, expect } from "@playwright/test";
import { PRINCIPLES } from "../../lib/projects";

// Clicks before hydration are lost; the header clock gets real digits once React is live.
async function hydrated(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("local-time")).toHaveText(/\d/);
}

test("rules open one at a time and show their source file", async ({ page }) => {
  await page.goto("/#approach");
  await hydrated(page);
  const heads = page.locator("#approach [data-rule-head]");
  const body = page.locator("#approach [data-rule-body]");
  await expect(heads).toHaveCount(4);
  await expect(heads.nth(0)).toHaveAttribute("aria-expanded", "true");

  await heads.nth(2).click();
  await expect(heads.nth(2)).toHaveAttribute("aria-expanded", "true");
  await expect(heads.nth(0)).toHaveAttribute("aria-expanded", "false");
  await expect(body).toHaveCount(1);
  await expect(body).toContainText(PRINCIPLES[2].body);
  await expect(body).toContainText(PRINCIPLES[2].source);

  await heads.nth(2).click();
  await expect(body).toHaveCount(0);
});

test("keyboard: Enter toggles a rule", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await hydrated(page);
  const head = page.locator("#approach [data-rule-head]").nth(1);
  await head.focus();
  await page.keyboard.press("Enter");
  await expect(head).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(`#${await head.getAttribute("aria-controls")}`)).toBeVisible();
});

test("rule heads keep their size while the list re-flows", async ({ page }) => {
  await page.goto("/#approach");
  await hydrated(page);
  const heads = page.locator("#approach [data-rule-head]");
  const before = await heads.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
  await heads.nth(3).click();
  await page.waitForTimeout(150); // mid-Flip
  const during = await heads.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
  during.forEach((h, i) => expect(Math.abs(h - before[i])).toBeLessThan(1));
});
