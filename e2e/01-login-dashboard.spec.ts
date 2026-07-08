import { test, expect } from "@playwright/test";
import { mockLogin, mockAuthMe, mockApiGet, cleanIndexedDB, performLogin } from "./helpers";

test.describe("Fluxo: Login → Dashboard", () => {
  test("deve fazer login e visualizar indicadores do dashboard", async ({ page }) => {
    await cleanIndexedDB(page);
    await mockLogin(page);
    await mockAuthMe(page);
    await mockApiGet(page, "**/api/transactions", []);
    await mockApiGet(page, "**/api/forecasts/totals", {
      predictedIncomes: 0,
      predictedExpenses: 0,
      allIncomes: 0,
      allExpenses: 0,
    });
    await mockApiGet(page, "**/api/pricing", []);

    await performLogin(page);

    await expect(page.locator("h1")).toContainText("Dashboard", { timeout: 15000 });
  });
});
