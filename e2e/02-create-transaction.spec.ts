import { test, expect } from "@playwright/test";
import { mockLogin, mockAuthMe, mockApiGet, mockApiPost, cleanIndexedDB, performLogin } from "./helpers";

test.describe("Fluxo: Criar transação → ver no financeiro", () => {
  test("deve abrir o formulário de novo lançamento e criar via categoria inline", async ({ page }) => {
    await cleanIndexedDB(page);
    await mockLogin(page);
    await mockAuthMe(page);
    await mockApiGet(page, "**/api/transactions", []);
    await mockApiGet(page, "**/api/categories", []);
    await mockApiPost(page, "**/api/categories", {
      id: "cat-e2e-1",
      name: "Vendas",
      color: "#22c55e",
      icon: "tag",
      type: "Income",
      company: "Lucraí",
      createdAt: "2026-07-15T00:00:00.000Z",
    });
    await mockApiPost(page, "**/api/transactions", {
      id: "tx-e2e-1",
      displayId: "LAN-001",
      type: "Income",
      value: 25,
      categoryId: "cat-e2e-1",
      categoryName: "Vendas",
      description: "Venda de produto E2E",
      date: "2026-07-15",
      observation: "Teste automatizado",
      company: "Lucraí",
      createdAt: "2026-07-15T00:00:00.000Z",
      updatedAt: "2026-07-15T00:00:00.000Z",
    });

    await performLogin(page);

    await page.goto("/financial");
    await page.waitForTimeout(3000);

    await page.click("text=Novo Lançamento");
    await page.waitForTimeout(500);

    await expect(page.locator('[role="dialog"] h2')).toContainText("Novo Lançamento");

    await page.fill("#value", "2500");
    await page.fill("#date", "2026-07-15");
    await page.fill("#description", "Venda de produto E2E");

    await page.click("text=+ Criar nova categoria");
    await page.waitForTimeout(200);
    const catInput = page.locator('[role="dialog"] input[placeholder="Nome da nova categoria"]');
    await catInput.fill("Vendas");
    await page.locator('[role="dialog"] button:has-text("Criar")').first().click();
    await page.waitForTimeout(500);

    await page.fill("#observation", "Teste automatizado");

    await page.locator('button[type="submit"]:has-text("Salvar")').click();
    await page.waitForTimeout(2000);
  });
});
