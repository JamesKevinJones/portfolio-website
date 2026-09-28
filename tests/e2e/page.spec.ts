import { test, expect, type Page } from "@playwright/test";
import { PROJECTS } from "../../lib/projects";

async function lowContrast(page: Page) {
  return page.evaluate(() => {
    // Resolve any CSS colour (rgb, oklab from Tailwind's /alpha, color-mix…) to sRGB bytes
    // by painting one pixel. A regex over the numbers misreads oklab as rgb.
    const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
    const rgba = (c: string) => {
      px.clearRect(0, 0, 1, 1);
      px.fillStyle = c;
      px.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = px.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a / 255];
    };
    const lin = (v: number) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const lum = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const backdrop = (el: Element | null): number[] => {
      for (; el; el = el.parentElement) {
        const c = rgba(getComputedStyle(el).backgroundColor);
        if (c[3] === 1) return c;
      }
      return [10, 10, 11];
    };
    const out: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("body *")) {
      const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      if (!ownText || el.closest("[aria-hidden='true'], .sr-only, svg, script, style")) continue;
      const cs = getComputedStyle(el);
      const fg = rgba(cs.color);
      const a = fg[3] ?? 1;
      if (a === 0 || cs.display === "none" || cs.visibility === "hidden") continue;
      const bg = backdrop(el);
      const mixed = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
      const [hi, lo] = [lum(mixed), lum(bg)].sort((x, y) => y - x);
      const ratio = (hi + 0.05) / (lo + 0.05);
      const floor = parseFloat(cs.fontSize) >= 24 ? 3 : 4.5;
      if (ratio < floor) out.push(`${ratio.toFixed(2)}:1 <${el.tagName.toLowerCase()}> "${el.textContent!.trim().slice(0, 40)}"`);
    }
    return out;
  });
}

test("every visible text clears its contrast floor", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" }); // final state, nothing mid-fade
  await page.goto("/");
  expect(await lowContrast(page)).toEqual([]);
});

test("reduced motion: whole page, nothing pinned, no Lenis, all sections present", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator("html.lenis")).toHaveCount(0);
  for (const id of ["top", "work", "approach", "about", "contact"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
});

for (const [w, h] of [[375, 667], [768, 1024], [1280, 700]]) {
  test(`${w}×${h}: the contact chip never covers a Try button or its refusal line`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    await expect(page.getByTestId("local-time").first()).toHaveText(/\d/);
    const chip = page.locator(".fixed").getByRole("button", { name: /copy email address|email copied/i });
    const rows = page.locator("#work [data-stage-footer]");
    await expect(rows).toHaveCount(PROJECTS.length);
    for (let i = 0; i < PROJECTS.length; i++) {
      await rows.nth(i).getByRole("button", { name: PROJECTS[i].attempt }).click(); // status line now has text
      // Walk the row up through the bottom of the screen, where a bottom-right chip sits.
      for (const lift of [-20, 10, 40, 70, 100]) {
        await rows.nth(i).evaluate((el, d) => {
          window.scrollTo(0, el.getBoundingClientRect().bottom + scrollY - innerHeight + d);
        }, lift);
        await page.waitForTimeout(350);
        if (!(await chip.isVisible())) continue;
        const [a, b] = [(await rows.nth(i).boundingBox())!, (await chip.boundingBox())!];
        const overlap = a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
        expect(overlap, `chip covers ${PROJECTS[i].name}'s Try row (lift ${lift})`).toBe(false);
      }
    }
  });
}

for (const width of [375, 768, 1024, 1440]) {
  test(`${width}px: the page never scrolls sideways, top to bottom`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 700) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(80);
      const extra = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(extra, `horizontal overflow at scrollY=${y}`).toBe(0);
    }
  });
}
