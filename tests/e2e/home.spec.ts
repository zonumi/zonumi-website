import { expect, test } from "@playwright/test";
import { clickMenuAction, openWorkspace } from "./helpers/workspace";

test.describe("Zonumi desktop workspace", () => {
  test.beforeEach(async ({ page }) => {
    await openWorkspace(page);
  });

  test("shows core about windows after boot", async ({ page }) => {
    await expect(page.getByTestId("window-about-profile")).toBeVisible();
    await expect(page.getByTestId("window-about-project")).toBeVisible();
    await expect(page.getByTestId("window-about-skills")).toBeVisible();
  });

  test("closes and reopens Certifications window via View menu", async ({ page }) => {
    await expect(page.getByTestId("window-about-certs")).toBeVisible();

    await page.getByLabel("Close Education").click();
    await expect(page.getByTestId("window-about-certs")).toHaveCount(0);

    await clickMenuAction(page, "view", "menu-action-certifications");
    await expect(page.getByTestId("window-about-certs")).toBeVisible();
  });

  test("updates project details when selecting a project from the finder", async ({ page }) => {
    const projectButtons = page.locator('[data-testid^="project-selector-"]');
    const total = await projectButtons.count();
    expect(total).toBeGreaterThan(1);

    const secondProjectButton = projectButtons.nth(1);
    const secondProjectClient = (await secondProjectButton.locator("span").first().innerText()).trim();

    await secondProjectButton.click();

    await expect(page.locator('[data-testid="window-about-project"] h3').first()).toHaveText(secondProjectClient);
  });

  test("keeps dragged windows inside desktop canvas bounds", async ({ page }) => {
    const canvas = page.getByTestId("desktop-canvas");
    const windowSection = page.getByTestId("window-about-profile");
    const titlebar = windowSection.locator(".desktop-titlebar");

    const canvasBefore = await canvas.boundingBox();
    expect(canvasBefore).not.toBeNull();

    const titlebarBefore = await titlebar.boundingBox();
    expect(titlebarBefore).not.toBeNull();
    if (!canvasBefore || !titlebarBefore) return;

    await page.mouse.move(titlebarBefore.x + 20, titlebarBefore.y + 10);
    await page.mouse.down();
    await page.mouse.move(canvasBefore.x - 200, canvasBefore.y - 200);
    await page.mouse.up();

    const windowAfterTopLeftDrag = await windowSection.boundingBox();
    expect(windowAfterTopLeftDrag).not.toBeNull();
    if (!windowAfterTopLeftDrag) return;
    expect(windowAfterTopLeftDrag.x).toBeGreaterThanOrEqual(canvasBefore.x - 1);
    expect(windowAfterTopLeftDrag.y).toBeGreaterThanOrEqual(canvasBefore.y - 1);

    const titlebarAfter = await titlebar.boundingBox();
    expect(titlebarAfter).not.toBeNull();
    if (!titlebarAfter) return;

    await page.mouse.move(titlebarAfter.x + 20, titlebarAfter.y + 10);
    await page.mouse.down();
    await page.mouse.move(canvasBefore.x + canvasBefore.width + 300, canvasBefore.y + canvasBefore.height + 300);
    await page.mouse.up();

    const canvasAfter = await canvas.boundingBox();
    const windowAfterBottomRightDrag = await windowSection.boundingBox();
    expect(canvasAfter).not.toBeNull();
    expect(windowAfterBottomRightDrag).not.toBeNull();
    if (!canvasAfter || !windowAfterBottomRightDrag) return;
    expect(windowAfterBottomRightDrag.x + windowAfterBottomRightDrag.width).toBeLessThanOrEqual(canvasAfter.x + canvasAfter.width + 1);
    expect(windowAfterBottomRightDrag.y + windowAfterBottomRightDrag.height).toBeLessThanOrEqual(canvasAfter.y + canvasAfter.height + 1);
  });

  test("does not render File menu", async ({ page }) => {
    await expect(page.getByTestId("menu-trigger-file")).toHaveCount(0);
  });
});
