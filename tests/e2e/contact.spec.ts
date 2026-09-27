import { test, expect } from "@playwright/test";
import { PROFILE } from "../../lib/site";

test("copy email puts the address on the clipboard and says so", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await expect(page.getByTestId("local-time").first()).toHaveText(/\d/); // hydrated
  // Scoped to the footer: the floating contact chip's button shares this name.
  const footer = page.locator("footer#contact");
  await footer.getByRole("button", { name: "Copy email address" }).click();
  await expect(footer.getByRole("button", { name: "Email copied" })).toBeVisible();
  await expect(page.locator("#contact [role='status']")).toHaveText("Email address copied to clipboard");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(PROFILE.email);
});

test("contact links point at the real profiles", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer#contact");
  await expect(footer.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", PROFILE.github);
  await expect(footer.getByRole("link", { name: /LinkedIn/ })).toHaveAttribute("href", PROFILE.linkedin);
  await expect(footer.getByRole("link", { name: PROFILE.email })).toHaveAttribute("href", `mailto:${PROFILE.email}`);
  await expect(footer.getByRole("heading", { level: 2 })).toHaveText("Open to internships and graduate roles.");
});
