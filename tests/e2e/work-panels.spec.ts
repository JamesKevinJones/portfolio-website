import { test, expect, type Page } from "@playwright/test";
import { PROJECTS } from "../../lib/projects";

// The header clock renders "--:--" on the server and real digits once React has
// hydrated, so it doubles as a "clicks will be handled" signal.
async function hydrated(page: Page) {
  await expect(page.getByTestId("local-time").first()).toHaveText(/\d{2}:\d{2}/);
}

// Phone viewport: stacked list mode, so every panel is reachable by normal scrolling.
test.use({ viewport: { width: 390, height: 844 } });

test("one panel per project, each with its quoted refusal and its own scene", async ({ page }) => {
  await page.goto("/");
  const panels = page.locator("#work article.wk-panel");
  await expect(panels).toHaveCount(PROJECTS.length);
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
  await expect(page.locator(".hazard")).toHaveCount(PROJECTS.length);
  await expect(page.locator("#work .wk-panel .hazard")).toHaveCount(PROJECTS.length);
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
    await expect(rows).toHaveCount(PROJECTS.length);
    for (let i = 0; i < PROJECTS.length; i++) {
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

test("a scene waits in its opening pose, then plays forward (no snap back)", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await expect(page.getByTestId("local-time").first()).toHaveText(/\d/);
  const stage = page.locator("#work article.wk-panel").nth(2).locator("[data-stage]");
  // Computed opacity and transform of every shape in the scene.
  const pose = () =>
    stage.evaluate((s) =>
      [...s.querySelectorAll("svg *")]
        // "none" and the identity matrix are the same pose.
        .map((el) => `${getComputedStyle(el).opacity}|${getComputedStyle(el).transform.replace("none", "matrix(1, 0, 0, 1, 0, 0)")}`)
        .join(";"),
    );
  // Stage top at 95% of the screen: in view, but short of its 70% play trigger.
  await stage.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * 0.95));
  await page.waitForTimeout(500);
  const waiting = await pose();
  // Job Autopilot opens with the gate up and hidden; it drops only once the scene plays.
  expect(await stage.locator(".ja-gate").evaluate((g) => getComputedStyle(g).opacity)).toBe("0");
  await stage.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * 0.3));
  await expect(stage).toHaveAttribute("data-state", "refused", { timeout: 6000 });
  await page.waitForTimeout(300);
  expect(waiting).not.toBe(await pose());
});

test("Frontier's meters grow up from their base while the scene plays", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await expect(page.getByTestId("local-time").first()).toHaveText(/\d/);
  const panel = page.locator("#work article.wk-panel").nth(1);
  await panel.locator("[data-stage]").scrollIntoViewIfNeeded();
  await panel.getByRole("button", { name: "Answer anyway" }).evaluate((b: HTMLButtonElement) => b.click());
  await page.waitForTimeout(250); // mid-fill
  // Each fill's bottom edge must sit on its meter's bottom edge (the rect before it).
  const gaps = await panel.locator(".fr-fill").evaluateAll((fills) =>
    fills.map((f) => Math.abs(f.getBoundingClientRect().bottom - f.previousElementSibling!.getBoundingClientRect().bottom)),
  );
  for (const g of gaps) expect(g).toBeLessThan(1.5);
});

test("MemoryVault's facts land exactly where the markup draws them", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await expect(page.getByTestId("local-time").first()).toHaveText(/\d/);
  const stage = page.locator("#work article.wk-panel").nth(5).locator("[data-stage]");
  await stage.scrollIntoViewIfNeeded();
  const boxes = () => stage.locator(".mv-fact").evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y]; }));
  await page.locator("#work article.wk-panel").nth(5).getByRole("button", { name: "Save the scrollback" }).evaluate((b: HTMLButtonElement) => b.click());
  await expect(stage).toHaveAttribute("data-state", "refused", { timeout: 6000 });
  const played = await boxes();
  // Clear GSAP's inline transforms: what remains is the markup's own final pose.
  await stage.locator(".mv-fact").evaluateAll((els) => els.forEach((e) => { e.removeAttribute("transform"); (e as HTMLElement).style.transform = ""; }));
  const markup = await boxes();
  played.forEach(([x, y], i) => {
    expect(Math.abs(x - markup[i][0])).toBeLessThan(1);
    expect(Math.abs(y - markup[i][1])).toBeLessThan(1);
  });
});

test("agentshell: the proposal lands in the input buffer and the key is never pressed", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await expect(page.getByTestId("local-time").first()).toHaveText(/\d/);
  const panel = page.locator("#work article.wk-panel").nth(PROJECTS.findIndex((p) => p.slug === "agentshell"));
  const stage = panel.locator("[data-stage]");
  await stage.scrollIntoViewIfNeeded();
  await panel.getByRole("button", { name: "Run the proposal" }).evaluate((b: HTMLButtonElement) => b.click());
  await expect(stage).toHaveAttribute("data-state", "refused", { timeout: 6000 });
  // Final pose is the markup's own: no leftover offset on the proposal, the key back at
  // rest size, the cursor visible again after its blinks.
  const settled = await stage.evaluate((s) => {
    const m = (sel: string) => new DOMMatrix(getComputedStyle(s.querySelector(sel)!).transform);
    return {
      dx: m(".as-proposal").e,
      dy: m(".as-proposal").f,
      enterScale: m(".as-enter").a,
      cursor: getComputedStyle(s.querySelector(".as-cursor")!).opacity,
    };
  });
  expect(Math.abs(settled.dx)).toBeLessThan(0.5);
  expect(Math.abs(settled.dy)).toBeLessThan(0.5);
  expect(settled.enterScale).toBeCloseTo(1, 2);
  expect(settled.cursor).toBe("1");
});
