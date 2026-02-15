import { expect, type Page } from "@playwright/test";

export async function openWorkspace(page: Page) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await expect(page.locator(".boot-overlay")).toBeHidden({ timeout: 15_000 });
}

export async function clickMenuAction(page: Page, menu: "file" | "view", actionTestId: string) {
  await page.getByTestId(`menu-trigger-${menu}`).click();
  await page.getByTestId(actionTestId).click();
}
