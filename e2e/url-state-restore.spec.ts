import { test, expect, waitForMapReady } from "./fixtures/map-page";

test.describe("URL状態復元", () => {
  test("ハッシュ付き URL で座標が復元される", async ({ page }) => {
    // 富士山付近の座標を直接指定
    await page.goto("/#12.000/35.360600/138.727000/");
    await waitForMapReady(page);

    // URL にその座標が保持されている
    const hash = new URL(page.url()).hash;
    expect(hash).toContain("35.3");
    expect(hash).toContain("138.7");
  });

  test("split ハッシュで 2 画面が復元される", async ({ page }) => {
    await page.goto("/#8.000/35.681000/139.767000/&lm=sp");
    await waitForMapReady(page);

    // canvas が 2 つ表示される
    await expect(page.locator(".maplibregl-canvas")).toHaveCount(2, {
      timeout: 30_000,
    });

    // URL に split パラメータが保持されている
    await expect(page).toHaveURL(/lm=sp/);
  });
});
