import { test, expect } from "./fixtures/map-page";

test.describe("住所検索", () => {
  test("住所を検索してサジェストから選択できる", async ({ mapPage: page }) => {
    const searchInput =
      page.getByPlaceholder("地名・住所・緯度経度・UTMで検索");
    await searchInput.fill("東京都千代田区");
    await searchInput.press("Enter");

    // サジェストリスト（Popover）が表示されるまで待機
    const popover = page.locator("[data-radix-popper-content-wrapper]");
    await expect(popover.first()).toBeVisible({ timeout: 15_000 });

    // 候補ボタンをクリック（フィルター用 select を除外し、候補ボタンのみ取得）
    const resultButtons = popover.locator(
      "button.justify-start, button:has(> div.flex.items-center.gap-4)",
    );
    await expect(resultButtons.first()).toBeVisible({ timeout: 10_000 });
    await resultButtons.first().click();

    // URL が変化する（座標が更新される）
    await expect(page).not.toHaveURL(/#4\.000\/36\.104611\/140\.084556/, {
      timeout: 10_000,
    });
  });
});
