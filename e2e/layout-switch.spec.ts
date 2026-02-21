import { test, expect } from "./fixtures/map-page";

test.describe("レイアウト切替", () => {
  test("通常 → 分割 → 重ねる でレイアウトが変わる", async ({
    mapPage: page,
  }) => {
    // 初期状態: canvas は 1 つ
    await expect(page.locator(".maplibregl-canvas")).toHaveCount(1);

    // サイドバーを開く
    await page.locator("button[data-sidebar='trigger']").click();

    // サイドバーフッター内のレイアウトセレクタ
    // viewport 外にある可能性があるため dispatchEvent で操作
    const layoutCombobox = page
      .getByRole("combobox")
      .filter({ hasText: "通常" });
    await layoutCombobox.dispatchEvent("click");
    await page.getByRole("option", { name: "分割" }).click();

    // canvas が 2 つに増える
    await expect(page.locator(".maplibregl-canvas")).toHaveCount(2, {
      timeout: 30_000,
    });

    // URL に split パラメータが含まれる
    await expect(page).toHaveURL(/lm=sp/);

    // 「重ねる」を選択
    const splitCombobox = page
      .getByRole("combobox")
      .filter({ hasText: "分割" });
    await splitCombobox.dispatchEvent("click");
    await page.getByRole("option", { name: "重ねる" }).click();

    // canvas は 2 つのまま
    await expect(page.locator(".maplibregl-canvas")).toHaveCount(2, {
      timeout: 30_000,
    });

    // URL に overlay パラメータが含まれる
    await expect(page).toHaveURL(/lm=o/);

    // 「通常」に戻す
    const overlayCombobox = page
      .getByRole("combobox")
      .filter({ hasText: "重ねる" });
    await overlayCombobox.dispatchEvent("click");
    await page.getByRole("option", { name: "通常" }).click();

    // canvas が 1 つに戻る
    await expect(page.locator(".maplibregl-canvas")).toHaveCount(1, {
      timeout: 30_000,
    });
  });
});
