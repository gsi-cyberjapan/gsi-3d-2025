import { test, expect } from "./fixtures/map-page";

test.describe("初期表示", () => {
  test("地図の canvas が表示される", async ({ mapPage: page }) => {
    const canvas = page.locator(".maplibregl-canvas").first();
    await expect(canvas).toBeVisible();
  });

  test("ヘッダーと検索ボックスが表示される", async ({ mapPage: page }) => {
    await expect(
      page.getByPlaceholder("地名・住所・緯度経度・UTMで検索"),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "作図" })).toBeVisible();
    await expect(page.getByRole("button", { name: "計測" })).toBeVisible();
  });

  test("デフォルト座標が URL ハッシュに反映される", async ({
    mapPage: page,
  }) => {
    // デフォルト座標: zoom=4, lat=36.104611, lng=140.084556
    const hash = new URL(page.url()).hash;
    expect(hash).toContain("36.1");
    expect(hash).toContain("140.0");
  });
});
