import type { Page } from "@playwright/test";

export async function cleanIndexedDB(page: Page) {
  await page.goto("/login");
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    return new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase("lucrai-core");
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      req.onblocked = () => {
        const conn = indexedDB.open("lucrai-core");
        conn.onsuccess = (e) => {
          (e.target as IDBOpenDBRequest).result.close();
          indexedDB.deleteDatabase("lucrai-core");
          resolve();
        };
        conn.onerror = () => reject(conn.error);
      };
    });
  });
  await page.waitForTimeout(500);
}

export async function mockLogin(page: Page) {
  await page.route("**/api/auth/login", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        accessToken: "eyJhbGciOiJIUzI1NiJ9.mock",
        refreshToken: "mock-refresh-token",
        expiresIn: 3600,
        user: {
          id: "user-1",
          email: "joao.ribeiro",
          name: "João Ribeiro",
          role: "owner",
          company: "Lucraí",
          plan: "professional",
          mustChangePassword: false,
        },
      }),
    });
  });
}

export async function mockAuthMe(page: Page) {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "user-1",
        email: "joao.ribeiro",
        name: "João Ribeiro",
        role: "owner",
        company: "Lucraí",
        plan: "professional",
        mustChangePassword: false,
        avatar: null,
        active: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      }),
    });
  });
}

export async function mockApiGet(
  page: Page,
  urlPattern: string,
  responseBody: unknown,
) {
  await page.route(urlPattern, async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(responseBody),
    });
  });
}

export async function mockApiPost(
  page: Page,
  urlPattern: string,
  responseBody: unknown,
  status = 201,
) {
  await page.route(urlPattern, async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(responseBody),
    });
  });
}

export async function performLogin(page: Page) {
  await page.goto("/login");
  await page.waitForTimeout(1500);

  await page.fill("#username", "joao.ribeiro");
  await page.fill("#password", "123");
  await page.click("button[type=submit]");

  await page.waitForURL(/\/dashboard/, { timeout: 30000 });
}
