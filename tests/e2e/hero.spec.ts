import { test, expect } from "@playwright/test";

test("hero reads as one sentence to assistive tech", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    "Systems that know when to stop.",
  );
  await expect(page.locator("section#top .hero-stop")).toHaveText("stop.");
});

test("scrolling moves every row except the word stop.", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1600); // let the character intro finish
  const stop = page.locator(".hero-stop");
  const drift = page.locator(".hero-drift").first();
  const before = { stop: await stop.boundingBox(), drift: await drift.boundingBox() };

  await page.mouse.wheel(0, 350);
  await page.waitForTimeout(1200); // Lenis + scrub catch-up

  const after = { stop: await stop.boundingBox(), drift: await drift.boundingBox() };
  // The hero is pinned while this happens, so "stop." holds its screen position...
  expect(Math.abs(after.stop!.x - before.stop!.x)).toBeLessThan(2);
  expect(Math.abs(after.stop!.y - before.stop!.y)).toBeLessThan(2);
  // ...while the first row has slid sideways.
  expect(Math.abs(after.drift!.x - before.drift!.x)).toBeGreaterThan(20);
});

test("reduced motion: no pin, no Lenis, final composition", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("section#top")).toBeVisible();
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator("html.lenis")).toHaveCount(0);
  // Marquee shows one copy only; the duplicate used for looping is hidden.
  await expect(page.locator("[data-marquee] [data-copy='loop']")).toBeHidden();
});

test("375px: hero rows and ticker never push the page sideways", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.waitForTimeout(1600);
  const overflow = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    rows: [...document.querySelectorAll<HTMLElement>(".hero-row")].map(
      (row) => row.scrollWidth - row.clientWidth,
    ),
  }));
  expect(overflow.page).toBe(0);
  for (const r of overflow.rows) expect(r).toBeLessThanOrEqual(0);
});

test("the particle field keeps drawing after the hero pin is measured", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("local-time").first()).toHaveText(/\d/);
  // Painted pixels plus a position-weighted checksum: changes when the dots move.
  const paint = () =>
    page.locator("#top canvas").evaluate((c: HTMLCanvasElement) => {
      const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      let sum = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i]) (n++, (sum = (sum + i * d[i]) % 1e9));
      return { n, sum };
    });
  await expect.poll(async () => (await paint()).n).toBeGreaterThan(1000);
  const before = await paint();
  await page.mouse.move(400, 300, { steps: 10 });
  await page.mouse.move(700, 450, { steps: 10 });
  await expect.poll(async () => (await paint()).sum).not.toBe(before.sum);
});
