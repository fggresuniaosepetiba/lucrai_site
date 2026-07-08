import { test, expect } from "@playwright/test";
import { mockLogin, mockAuthMe, cleanIndexedDB, performLogin } from "./helpers";

test.describe("Fluxo: Gerenciar categorias", () => {
  test("deve abrir o formulário de nova categoria e criar", async ({ page }) => {
    await cleanIndexedDB(page);
    await mockLogin(page);
    await mockAuthMe(page);

    await performLogin(page);

    await page.goto("/categories", { waitUntil: "networkidle" });
    await page.waitForTimeout(5000);

    await expect(page.locator("h2")).toContainText("Categorias", { timeout: 15000 });

    await page.click("text=Criar Nova Categoria");
    await page.waitForTimeout(800);

    await expect(page.locator('[role="dialog"] h2')).toContainText("Nova Categoria");

    await page.locator("#cat-name").fill("Categoria E2E Teste");

    await page.locator('[role="dialog"] button:has-text("Saída")').click();
    await page.waitForTimeout(200);

    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
  });
});
