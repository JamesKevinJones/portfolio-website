import { test, expect, type Page } from "@playwright/test";
import { PROJECTS } from "../../lib/projects";

// The header clock renders "--:--" on the server and real digits once React has
// hydrated, so it doubles as a "clicks will be handled" signal.
async function hydrated(page: Page) {
  await expect(page.getByTestId("local-time").first()).toHaveText(/\d{2}:\d{2}/);
}

// Phone viewport: stacked list mode, so every panel is reachable by normal scrolling.
test.use({ viewport: { width: 390, height: 844 } });

test("six panels, each with its quoted refusal and its own scene", async ({ page }) => {
  await page.goto("/");
  const panels = page.locator("#work article.wk-panel");
  await expect(panels).toHaveCount(6);
  for (const [i, p] of PROJECTS.entries()) {
    const panel = panels.nth(i);
    await expect(panel.getByRole("heading", { level: 3 })).toHaveText(p.name);
    await expect(panel).toContainText(p.refuses.headline);
    await expect(panel).toContainText(p.refuses.detail);
    const stage = panel.locator("[data-stage]");
    await expect(stage).toHaveAttribute("data-scene", p.slug);
    await expect(stage.locator("svg[aria-hidden='true']")).toHaveCount(1);
  }
  // The hazard stripe lives on refusal bands only: exactly one per panel, none elsewhere.
  await expect(page.locator(".hazard")).toHaveCount(6);
  await expect(page.locator("#work .wk-panel .hazard")).toHaveCount(6);
});

test("pressing Try replays the refusal and announces it", async ({ page }) => {
  await page.goto("/");
  await hydrated(page);
  const panel = page.locator("#work article.wk-panel").first();
  const status = panel.getByRole("status");
  await expect(status).toHaveText("");

  await panel.getByRole("button", { name: "Upload my photo" }).click();
  await expect(status).toHaveText("Refused. It won’t upload your photo.");
  await expect(panel.locator("[data-stage]")).toHaveAttribute("data-state", "playing");
  await expect(panel.locator("[data-stage]")).toHaveAttribute("data-state", "refused", {
    timeout: 5000,
  });
});

test("mashing Try never stacks timelines", async ({ page }) => {
  await page.goto("/");
  await hydrated(page);
  const panel = page.locator("#work article.wk-panel").nth(2); // Job Autopilot
  const button = panel.getByRole("button", { name: "Submit it for me" });
  for (let i = 0; i < 5; i++) await button.click({ delay: 20 });

  await expect(panel.getByRole("status")).toHaveText("Refused ×5. It won’t submit the application.");
  const stage = panel.locator("[data-stage]");
  await expect(stage).toHaveAttribute("data-state", "refused", { timeout: 5000 });
  // Final pose: the card sits in the review queue with no leftover transform.
  const cardTransform = await stage
    .locator(".ja-card")
    .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform));
  expect(Math.abs(cardTransform.e)).toBeLessThan(0.5);
  expect(Math.abs(cardTransform.f)).toBeLessThan(0.5);
});

test("reduced motion: Try still answers, scene stays in its final pose", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await hydrated(page);
  const panel = page.locator("#work article.wk-panel").nth(3); // CodeAuto
  await panel.getByRole("button", { name: "Run the workflow" }).click();
  await expect(panel.getByRole("status")).toHaveText(
    "Refused. It won’t run a workflow that doesn’t check out.",
  );
  await expect(panel.locator("[data-stage]")).toHaveAttribute("data-state", "refused");
  await expect(panel.locator(".ca-issue")).toBeVisible();
});

for (const [w, h] of [[375, 667], [1024, 700]]) {
  test(`${w}×${h}: pressing Try never changes the panel's height`, async ({ page }) => {
    // A taller row after the first press would shift every scroll trigger below it.
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    await expect(page.getByTestId("local-time").first()).toHaveText(/\d/);
    const rows = page.locator("#work [data-stage-footer]");
    await expect(rows).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      const row = rows.nth(i);
      const before = (await row.boundingBox())!.height;
      // Ten presses without waiting out the "no" shake each time. "Refused ×10." is the longest.
      await row.getByRole("button").evaluate((b: HTMLButtonElement) => {
        for (let k = 0; k < 10; k++) b.click();
      });
      await expect(row.getByRole("status")).toContainText("×10");
      expect((await row.boundingBox())!.height).toBe(before);
    }
  });
}
