import { test, expect } from "@playwright/test";

test("header is fixed, links only to sections that exist, and shows Chennai time", async ({ page }) => {
  await page.goto("/");
  const header = page.locator("header").first();
  await expect(header).toHaveCSS("position", "fixed");

  const nav = header.getByRole("navigation", { name: "Sections" });
  const hrefs = await nav.getByRole("link").evaluateAll((links) =>
    links.map((a) => a.getAttribute("href")),
  );
  expect(hrefs).toEqual(["#work", "#approach", "#about", "#contact"]);
  for (const href of hrefs) {
    await expect(page.locator(href!)).toHaveCount(1);
  }

  await expect(header.getByTestId("local-time")).toHaveText(/^\d{2}:\d{2} IST$/);
});

test("scroll progress hairline scales with the page", async ({ page }) => {
  await page.goto("/");
  const bar = page.getByTestId("scroll-progress");
  await page.mouse.wheel(0, 2000);
  await expect
    .poll(async () => bar.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a))
    .toBeGreaterThan(0.05);
});

test("a deep link to a section stays there after Lenis mounts", async ({ page }) => {
  await page.goto("/#about");
  await page.waitForTimeout(1500);
  const top = await page.locator("#about").evaluate((el) => el.getBoundingClientRect().top);
  expect(Math.abs(top)).toBeLessThan(200);
});

test("the logo and Back to top land on the hero at rest, not the faded pin end", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("local-time").first()).toHaveText(/\d/);
  await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: "About" }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(2000);
  await page.locator("header a[href='#top']").click();
  await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBeLessThan(5);
  await expect.poll(() => page.locator(".hero-meta").evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
});
