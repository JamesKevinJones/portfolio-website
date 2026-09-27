import { test, expect } from "@playwright/test";

test("portrait swaps from the keyboard and the stack is listed", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const swap = page.getByRole("button", { name: /swap photo/i });
  await expect(swap).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByTestId("portrait-mural")).toHaveCSS("opacity", "0");

  await swap.focus();
  await page.keyboard.press("Enter");
  await expect(swap).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("portrait-mural")).toHaveCSS("opacity", "1");

  await expect(page.locator("#about dt")).toHaveText(["Languages", "Frontend", "Backend", "AI", "Infra"]);
  await expect(page.locator("#about")).toContainText("SRM Institute of Science and Technology, Ramapuram");
});

test("photos are revealed by scrolling, not left hidden", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("local-time").first()).toHaveText(/\d/); // scrolls before hydration are lost
  await page.locator("#about").scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 600);
  const curtain = page.locator("#about .ab-curtain").first();
  await expect
    .poll(async () => curtain.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).f))
    .toBeLessThan(5);
});

test("fine pointer: a lens opens over the portrait and closes when you leave", async ({ page }) => {
  await page.goto("/#about");
  await expect(page.getByTestId("local-time").first()).toHaveText(/\d/); // hydrated
  const frame = page.getByRole("button", { name: /swap photo/i });
  const lens = frame.locator("div.rounded-full[aria-hidden='true']");
  await frame.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2400); // let the one-off hint sweep finish
  const box = (await frame.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
  await expect(lens).toBeVisible();
  await page.mouse.move(box.x - 60, box.y - 60, { steps: 4 });
  await expect(lens).toBeHidden();
  // Hovering alone never swaps the whole photo; only a press does.
  await expect(page.getByTestId("portrait-mural")).toHaveCSS("opacity", "0");
});

test("about copy is bone and brightens word by word as it scrolls", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("local-time").first()).toHaveText(/\d/);
  const first = page.locator("#about .ab-copy p").first();
  await expect(first).toHaveCSS("color", "rgb(237, 237, 234)");
  await first.scrollIntoViewIfNeeded();
  const words = first.locator("div");
  await expect.poll(() => words.count()).toBeGreaterThan(10);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => words.last().evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
});

test("the portrait's accessible name starts with its visible label (voice control)", async ({ page }) => {
  await page.goto("/");
  const swap = page.getByRole("button", { name: /swap photo/i });
  const visible = (await swap.locator(".label").textContent())!.trim().toLowerCase();
  const name = (await swap.getAttribute("aria-label"))!.toLowerCase();
  expect(name.startsWith(visible)).toBe(true);
});
