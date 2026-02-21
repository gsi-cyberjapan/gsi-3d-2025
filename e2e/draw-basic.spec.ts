import { test, expect } from "./fixtures/map-page";

test.describe("作図基本操作", () => {
  test("作図ウィンドウの表示・タブ切替・閉じる", async ({ mapPage: page }) => {
    // 「作図」ボタンをクリック
    await page.getByRole("button", { name: "作図" }).click();

    // 作図ウィンドウのタイトルが表示される
    const windowTitle = page.getByRole("heading", { name: "作図" });
    await expect(windowTitle).toBeVisible();

    // 作図ウィンドウ内のタブリスト（描画モード）を特定
    const drawWindow = windowTitle.locator(
      "xpath=ancestor::div[contains(@class, 'fixed')]",
    );
    const tabs = drawWindow.locator('[role="tablist"]').first();
    await expect(tabs).toBeVisible();

    // タブが7つ存在する（point, circle, linestring, freehand, polygon, text, select）
    await expect(tabs.locator('[role="tab"]')).toHaveCount(7);

    // タブをクリックして切替が動作することを確認
    const polygonTab = tabs.locator('[role="tab"]').nth(4);
    await polygonTab.click();

    // 閉じるボタンをクリック（exact: true でドラッグハンドルと区別）
    await drawWindow
      .getByRole("button", { name: "Close", exact: true })
      .click();

    // 作図ウィンドウが閉じる
    await expect(windowTitle).not.toBeVisible();
  });
});
