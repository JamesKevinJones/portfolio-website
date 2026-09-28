import { test, expect } from "@playwright/test";
import { PROJECTS, PRINCIPLES, STACK } from "../../lib/projects";

test("every project has a quoted refusal, a short attempt verb and a unique slug", () => {
  expect(PROJECTS).toHaveLength(6);
  expect(new Set(PROJECTS.map((p) => p.slug)).size).toBe(PROJECTS.length);
  for (const p of PROJECTS) {
    // Refusal headlines are quoted from source repos and all share this shape.
    expect(p.refuses.headline).toMatch(/^It won’t .+\.$/);
    expect(p.attempt.length).toBeGreaterThan(0);
    // The Try pill has to fit beside the status line on a 375px phone.
    expect(p.attempt.length).toBeLessThanOrEqual(22);
    expect(p).not.toHaveProperty("accent");
  }
});

test("principles and stack survive the move", () => {
  expect(PRINCIPLES).toHaveLength(4);
  expect(STACK.map(([term]) => term)).toEqual(["Languages", "Frontend", "Backend", "AI", "Infra"]);
});
