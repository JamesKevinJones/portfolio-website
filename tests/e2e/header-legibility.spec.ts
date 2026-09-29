import { test, expect, type Page } from "@playwright/test";

// The header has no bar, so it sits over whatever scrolls beneath it. The CSS-colour
// contrast test in page.spec.ts reads it as bone on ink and cannot see that. This one
// measures composited pixels: it screenshots each header label and compares the box's
// brightest and darkest pixels with its median. Text that has dissolved into its
// backdrop has almost no spread, so the ratio collapses toward 1.
async function pixelContrast(page: Page, clip: { x: number; y: number; width: number; height: number }) {
  const png = (await page.screenshot({ clip })).toString("base64");
  return page.evaluate(async (data) => {
    const img = new Image();
    img.src = `data:image/png;base64,${data}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const px = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const lin = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    const lums: number[] = [];
    for (let i = 0; i < px.length; i += 4) {
      lums.push(0.2126 * lin(px[i]) + 0.7152 * lin(px[i + 1]) + 0.0722 * lin(px[i + 2]));
    }
    lums.sort((a, b) => a - b);
    const at = (p: number) => lums[Math.min(lums.length - 1, Math.floor(p * lums.length))];
    const [lo, mid, hi] = [at(0.03), at(0.5), at(0.97)];
    return Math.max((hi + 0.05) / (mid + 0.05), (mid + 0.05) / (lo + 0.05));
  }, png);
}

for (const [w, h] of [[1440, 900], [375, 667]]) {
  test(`${w}×${h}: header labels stay legible over the About portrait`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    await expect(page.getByTestId("local-time").first()).toHaveText(/\d/);
    // Park the portrait, the brightest thing on the page, under the header row.
    await page
      .locator("#about img")
      .first()
      .evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY + 120));
    await page.waitForTimeout(600);

    const boxes = await page.evaluate(() =>
      [...document.querySelectorAll("header a, header .label > span")]
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { text: el.textContent!.trim(), x: Math.floor(r.x), y: Math.floor(r.y), width: Math.ceil(r.width), height: Math.ceil(r.height) };
        })
        .filter((b) => b.width > 4 && b.height > 4 && b.y >= 0),
    );
    expect(boxes.length).toBeGreaterThan(3);
    for (const { text, ...clip } of boxes) {
      const ratio = await pixelContrast(page, clip);
      expect(ratio, `"${text}" over the portrait`).toBeGreaterThanOrEqual(4.5);
    }
  });
}
