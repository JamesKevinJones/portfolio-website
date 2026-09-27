import { test, expect, type Page } from "@playwright/test";

const workPinned = (page: Page) => page.locator("#work .pin-spacer");

test.describe("desktop 1440×900", () => {
  test("work pins and vertical scroll drives the track sideways", async ({ page }) => {
    await page.goto("/");
    await expect(workPinned(page)).toHaveCount(1);
    await page.locator("#work").scrollIntoViewIfNeeded();
    const track = page.locator("#work .wk-track");
    const x0 = await track.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).e);
    await page.mouse.wheel(0, 1500);
    await expect
      .poll(async () => track.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).e))
      .toBeLessThan(x0 - 300);
  });

  test("tabbing into panel six brings it on screen", async ({ page }) => {
    await page.goto("/");
    // Wait for hydration: the header clock only shows digits once React is live.
    await expect(page.getByTestId("local-time").first()).toHaveText(/\d{2}:\d{2}/);
    const source = page.locator("#work article.wk-panel").nth(5).getByRole("link", { name: /Source/ });
    await source.focus();
    await expect(source).toBeFocused();
    await expect(source).toBeInViewport({ ratio: 1 });
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(page.locator("#work article.wk-panel").nth(5).getByRole("button")).toBeInViewport();
  });
});

test("1024×760: every panel's content fits its screen", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 760 });
  await page.goto("/");
  await expect(workPinned(page)).toHaveCount(1);
  const overflows = await page
    .locator("#work article.wk-panel")
    .evaluateAll((panels) => panels.map((p) => p.scrollHeight - p.clientHeight));
  for (const o of overflows) expect(o).toBeLessThanOrEqual(1);
});

test("1280×700: too short to pin, so it falls back to the list", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto("/");
  await expect(workPinned(page)).toHaveCount(0);
  await expect(page.locator("#work article.wk-panel")).toHaveCount(6);
});

test("reduced motion: plain list, nothing pinned anywhere", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  const tops = await page
    .locator("#work article.wk-panel")
    .evaluateAll((panels) => panels.map((p) => p.getBoundingClientRect().top));
  for (let i = 1; i < tops.length; i++) expect(tops[i]).toBeGreaterThan(tops[i - 1]);
});

test("no JavaScript: every refusal is still on the page", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("#work article.wk-panel")).toHaveCount(6);
  await expect(page.getByText("It won’t upload your photo.").first()).toBeVisible();
  await context.close();
});
