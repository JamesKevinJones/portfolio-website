import { test, expect } from "@playwright/test";

test("page sits on Motion Kit ink with grain and no theme toggle", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(10, 10, 11)");
  await expect(page.locator("body")).toHaveCSS("color", "rgb(237, 237, 234)");
  await expect(page.locator(".grain")).toHaveCount(1);
  await expect(page.getByRole("button", { name: /theme/i })).toHaveCount(0);
});

test("display type is Space Grotesk and labels are JetBrains Mono", async ({ page }) => {
  await page.goto("/");
  const h1Font = await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily);
  expect(h1Font).toContain("Space Grotesk");
  const monoFont = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.className = "label";
    document.body.append(probe);
    const family = getComputedStyle(probe).fontFamily;
    probe.remove();
    return family;
  });
  expect(monoFont).toContain("JetBrains Mono");
});
