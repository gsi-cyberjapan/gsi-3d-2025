import { test, expect } from "./fixtures/map-page";

test.describe("緯度経度検索", () => {
  test("座標入力で地図が移動する", async ({ mapPage: page }) => {
    const searchInput =
      page.getByPlaceholder("地名・住所・緯度経度・UTMで検索");
    // カンマ区切り（スペースなし）で入力
    await searchInput.fill("35.360,138.727");
    await searchInput.press("Enter");

    // 入力した座標付近に URL が変化する（富士山付近）
    await expect(page).toHaveURL(/#.*35\.3/, { timeout: 10_000 });
    await expect(page).toHaveURL(/#.*138\.7/);

    // 緯度経度直接入力時はサジェストリストが表示されない
    const suggestList = page.locator("[data-radix-popper-content-wrapper]");
    await expect(suggestList).not.toBeVisible();
  });
});
