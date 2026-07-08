import { test, expect } from "@playwright/test";
import { mockLogin, mockAuthMe, cleanIndexedDB, performLogin } from "./helpers";

test.describe("Fluxo: Lixeira", () => {
  test("deve exibir a página de lixeira", async ({ page }) => {
    await cleanIndexedDB(page);
    await mockLogin(page);
    await mockAuthMe(page);

    await performLogin(page);

    await page.goto("/trash");
    await page.waitForTimeout(3000);

    await expect(page.locator("h2")).toContainText("Lixeira", { timeout: 15000 });
  });
});
