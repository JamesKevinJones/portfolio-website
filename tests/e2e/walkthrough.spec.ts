import { test, expect, type Page } from "@playwright/test";
import { PROJECTS } from "../../lib/projects";

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

  test("the HUD counter rolls to the panel on screen", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("local-time").first()).toHaveText(/\d/);
    // The digit whose top sits at the clip window's top is the one a visitor can read.
    const shown = () =>
      page.locator(".wk-digits").evaluate((col) => {
        const top = col.parentElement!.getBoundingClientRect().top;
        const hit = [...col.children].find((d) => Math.abs(d.getBoundingClientRect().top - top) < 1);
        return hit?.textContent ?? "none";
      });
    for (const i of [3, 1, 5]) {
      await page.locator("#work article.wk-panel").nth(i).getByRole("button").first().focus();
      await expect.poll(shown).toBe(String(i + 1).padStart(2, "0"));
    }
  });

  test("tabbing into the last panel brings it on screen", async ({ page }) => {
    await page.goto("/");
    // Wait for hydration: the header clock only shows digits once React is live.
    await expect(page.getByTestId("local-time").first()).toHaveText(/\d{2}:\d{2}/);
    // The last panel is the end of the track, the case most likely to be left off screen.
    const last = page.locator("#work article.wk-panel").nth(PROJECTS.length - 1);
    const source = last.getByRole("link", { name: /Source/ });
    await source.focus();
    await expect(source).toBeFocused();
    await expect(source).toBeInViewport({ ratio: 1 });
    // Back to its Try button: past the Live link when it has one, straight there when not.
    for (let i = 0; i < (PROJECTS[PROJECTS.length - 1].live ? 2 : 1); i++) await page.keyboard.press("Shift+Tab");
    await expect(last.getByRole("button")).toBeFocused();
    await expect(last.getByRole("button")).toBeInViewport();
  });
});

// Narrow-and-short is the obvious squeeze; very wide-and-short squeezes too, because the
// stage's height follows its width.
for (const [w, h] of [[1024, 760], [1920, 760], [2200, 800], [2560, 760], [2560, 900], [3000, 900]]) {
test(`${w}×${h}: every panel's content fits its screen`, async ({ page }) => {
  await page.setViewportSize({ width: w, height: h });
  await page.goto("/");
  await expect(workPinned(page)).toHaveCount(1);
  const overflows = await page
    .locator("#work article.wk-panel")
    .evaluateAll((panels) => panels.map((p) => p.scrollHeight - p.clientHeight));
  for (const o of overflows) expect(o).toBeLessThanOrEqual(1);
});
}

test("1280×700: too short to pin, so it falls back to the list", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto("/");
  await expect(workPinned(page)).toHaveCount(0);
  await expect(page.locator("#work article.wk-panel")).toHaveCount(PROJECTS.length);
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
  await expect(page.locator("#work article.wk-panel")).toHaveCount(PROJECTS.length);
  await expect(page.getByText("It won’t upload your photo.").first()).toBeVisible();
  await context.close();
});
