import { test, expect } from "@playwright/test";
import { PRINCIPLES } from "../../lib/projects";

// Clicks before hydration are lost; the header clock gets real digits once React is live.
async function hydrated(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("local-time").first()).toHaveText(/\d/);
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

for (const reduce of [false, true]) {
test(`toggling a rule re-measures every trigger below it${reduce ? " (reduced motion)" : ""}`, async ({ page }) => {
  if (reduce) await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByTestId("local-time").first()).toHaveText(/\d/);
  await page.locator("#approach").scrollIntoViewIfNeeded();
  await page.locator("#approach [data-rule-head]").nth(0).click(); // close R/01: the page shrinks
  await page.waitForTimeout(900); // Flip runs 0.6s
  // The contact chip hides once #contact's top reaches 85% of the screen. Park it at 70%:
  // with stale triggers (measured before the page shrank) the chip would still be showing.
  await page.evaluate(() => {
    const top = document.querySelector("#contact")!.getBoundingClientRect().top + scrollY;
    window.scrollTo(0, top - innerHeight * 0.7);
  });
  await page.waitForTimeout(500);
  await expect(page.locator(".fixed").getByRole("button", { name: /copy email address|email copied/i })).toBeHidden();
});
}
