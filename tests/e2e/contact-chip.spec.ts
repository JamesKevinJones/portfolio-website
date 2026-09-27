import { expect, test } from "@playwright/test";

// The floating chip that copies the email between the hero and the footer.
// Scoped to .fixed: the footer's own button shares the accessible name.
const chip = (page: import("@playwright/test").Page) =>
  page.locator(".fixed").getByRole("button", { name: /copy email address|email copied/i });

async function hydrated(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("local-time")).toHaveText(/\d/);
}

test("chip is hidden on the hero, shows over the work, and hides at contact", async ({ page }) => {
  await page.goto("/");
  await hydrated(page);
  await expect(chip(page)).toBeHidden();

  await page.evaluate(() => {
    const y = document.querySelector("#work")!.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, y + 200);
  });
  await expect(chip(page)).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(chip(page)).toBeHidden();
});

test("chip copies the email and says so", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await hydrated(page);
  await page.evaluate(() => {
    const y = document.querySelector("#work")!.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, y + 200);
  });
  await chip(page).click();
  await expect(page.locator(".fixed").getByRole("button", { name: "Email copied" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("kj6384647@gmail.com");
});
