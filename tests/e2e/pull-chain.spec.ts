import { test, expect, type Page } from "@playwright/test";

// Headless Chromium has no GPU, and Chrome no longer falls back to SwiftShader on its
// own, so WebGL fails and the chain (correctly) never renders. Opt in for this file.
test.use({ launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] } });

// Painted-pixel checksum of the particle field: changes whenever the dots move.
const fieldSum = (page: Page) =>
  page.locator("#top .hero-bg canvas").evaluate((c: HTMLCanvasElement) => {
    const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    let sum = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i]) sum = (sum + i * d[i]) % 1e9;
    return sum;
  });

test("the pull chain renders and keeps its handle over the tag, clear of the headline", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("pull-chain")).toHaveAttribute("data-state", "live", { timeout: 20_000 });
  await page.waitForTimeout(2500); // drop-in and settle
  const tag = (await page.getByTestId("pull-chain-handle").boundingBox())!;
  const h1 = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
  expect(tag.width).toBeGreaterThan(80);
  // Hangs in the empty space above the headline, and never covers "stop." (last row).
  const stop = (await page.locator(".hero-stop").boundingBox())!;
  expect(tag.y + tag.height).toBeLessThan(stop.y);
  expect(tag.y).toBeLessThan(h1.y + h1.height);
});

test("pulling the tag down stops the particle field, pulling again restarts it", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("pull-chain")).toHaveAttribute("data-state", "live", { timeout: 20_000 });
  await page.waitForTimeout(2500);

  const pull = async () => {
    const box = (await page.getByTestId("pull-chain-handle").boundingBox())!;
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 420, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(1500); // spring back and settle
  };
  const wiggle = async () => {
    await page.mouse.move(300, 300, { steps: 8 });
    await page.mouse.move(600, 420, { steps: 8 });
  };

  await pull();
  const before = await fieldSum(page);
  await wiggle();
  expect(await fieldSum(page)).toBe(before); // stopped: the pointer no longer moves the dots

  await pull();
  const again = await fieldSum(page);
  await wiggle();
  await expect.poll(() => fieldSum(page)).not.toBe(again);
});

test("reduced motion: no chain, no handle", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForTimeout(1000);
  await expect(page.getByTestId("pull-chain")).not.toHaveAttribute("data-state", "live", { timeout: 20_000 });
  await expect(page.getByTestId("pull-chain-handle")).toBeHidden();
});
