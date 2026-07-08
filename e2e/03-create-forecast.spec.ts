import { test, expect } from "@playwright/test";
import { mockLogin, mockAuthMe, mockApiGet, mockApiPost, cleanIndexedDB, performLogin } from "./helpers";

test.describe("Fluxo: Criar previsão de caixa", () => {
  test("deve abrir o formulário de nova previsão e criar via categoria inline", async ({ page }) => {
    await cleanIndexedDB(page);
    await mockLogin(page);
    await mockAuthMe(page);
    await mockApiGet(page, "**/api/forecasts", []);
    await mockApiGet(page, "**/api/forecasts/totals", {
      predictedIncomes: 0,
      predictedExpenses: 0,
      allIncomes: 0,
      allExpenses: 0,
    });
    await mockApiGet(page, "**/api/transactions/balance", {
      incomes: 50000,
      expenses: 30000,
      balance: 20000,
    });
    await mockApiGet(page, "**/api/categories", []);
    await mockApiPost(page, "**/api/categories", {
      id: "cat-e2e-2",
      name: "Vendas",
      color: "#22c55e",
      icon: "tag",
      type: "Income",
      company: "Lucraí",
      createdAt: "2026-08-20T00:00:00.000Z",
    });
    await mockApiPost(page, "**/api/forecasts", {
      id: "fc-e2e-1",
      displayId: "PRE-001",
      type: "Income",
      description: "Pagamento cliente XYZ",
      amount: 3200,
      category: "Vendas",
      expectedDate: "2026-08-20",
      status: "Predicted",
      notes: "Contrato mensal",
      company: "Lucraí",
      createdAt: "2026-08-20T00:00:00.000Z",
      updatedAt: "2026-08-20T00:00:00.000Z",
      isRecurring: false,
      recurrenceType: null,
      recurrenceEndDate: null,
    });

    await performLogin(page);

    await page.goto("/cash-forecast");
    await page.waitForTimeout(3000);

    await page.locator("text=Novo Lançamento Previsto").first().click();
    await page.waitForTimeout(800);

    await expect(page.locator('[role="dialog"] h2')).toContainText("Novo Lançamento Previsto");

    await page.locator("#desc").fill("Pagamento cliente XYZ");
    await page.locator("#amount").click();
    await page.locator("#amount").fill("320000");
    await page.locator("#date").first().fill("2026-08-20");

    await page.click("text=+ Criar nova categoria");
    await page.waitForTimeout(200);
    const catInput = page.locator('[role="dialog"] input[placeholder="Nome da nova categoria"]');
    await catInput.fill("Vendas");
    await page.locator('[role="dialog"] button:has-text("Criar")').first().click();
    await page.waitForTimeout(500);

    await page.locator("#notes").fill("Contrato mensal");

    await page.locator('[role="dialog"] button:has-text("Criar")').last().click();
    await page.waitForTimeout(2000);
  });
});
