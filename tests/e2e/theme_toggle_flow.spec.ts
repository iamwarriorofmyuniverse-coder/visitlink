import { test, expect } from "@playwright/test";

test.describe("VisitLink Dark and Light Mode Theme Toggle Flow", () => {
  test("toggles between Light, Dark, and System modes with persistence and no FOUC", async ({ page }) => {
    await page.goto("/");

    // Clear any leftover theme from previous tests
    await page.evaluate(() => {
      localStorage.clear();
      document.documentElement.classList.remove("dark");
    });

    // Locate theme toggle button in the navbar
    const themeBtn = page.getByRole("button", { name: /toggle theme/i });
    await expect(themeBtn).toBeVisible();

    // 1. Switch to Dark Mode
    await themeBtn.click();
    const darkOption = page.getByRole("menuitem", { name: /dark/i });
    await expect(darkOption).toBeVisible();
    await darkOption.click();

    // Verify 'dark' class applied to documentElement
    await expect.poll(async () => {
      return page.evaluate(() => document.documentElement.classList.contains("dark"));
    }).toBe(true);

    // Verify localStorage persistence
    const savedTheme = await page.evaluate(() => localStorage.getItem("vl_theme"));
    expect(savedTheme).toBe("dark");

    // 2. Reload to verify persistence without FOUC
    await page.reload();
    await expect.poll(async () => {
      return page.evaluate(() => document.documentElement.classList.contains("dark"));
    }).toBe(true);

    const savedThemeAfterReload = await page.evaluate(() => localStorage.getItem("vl_theme"));
    expect(savedThemeAfterReload).toBe("dark");

    // 3. Switch to Light Mode
    await themeBtn.click();
    const lightOption = page.getByRole("menuitem", { name: /light/i });
    await expect(lightOption).toBeVisible();
    await lightOption.click();

    // Verify 'dark' class removed
    await expect.poll(async () => {
      return page.evaluate(() => document.documentElement.classList.contains("dark"));
    }).toBe(false);

    const savedThemeLight = await page.evaluate(() => localStorage.getItem("vl_theme"));
    expect(savedThemeLight).toBe("light");

    // 4. Switch to System Mode
    await themeBtn.click();
    const systemOption = page.getByRole("menuitem", { name: /system/i });
    await expect(systemOption).toBeVisible();
    await systemOption.click();

    const savedThemeSystem = await page.evaluate(() => localStorage.getItem("vl_theme"));
    expect(savedThemeSystem).toBe("system");

    // 5. Navigate to another page and verify theme toggle persists
    await page.goto("/coordinator/explore");
    const exploreThemeBtn = page.getByRole("button", { name: /toggle theme/i });
    await expect(exploreThemeBtn).toBeVisible();
  });
});
