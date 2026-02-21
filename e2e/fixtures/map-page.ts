import { test as base, expect, Page } from "@playwright/test";

async function waitForMapReady(page: Page) {
  // canvas が DOM に存在するまで待機（MapLibre GL の JS が読み込まれた証拠）
  await expect(page.locator(".maplibregl-canvas").first()).toBeAttached({
    timeout: 30_000,
  });

  // マップの onLoad 完了を待機
  // ローディングオーバーレイの親要素に pointer-events-none クラスが付くことで判定
  // （Playwright は opacity:0 を visible 扱いするため、クラスで確認）
  const loadingOverlay = page
    .getByText("地図を読み込み中")
    .first()
    .locator("xpath=ancestor::div[contains(@class, 'absolute')]")
    .first();

  await expect(loadingOverlay).toHaveClass(/pointer-events-none/, {
    timeout: 50_000,
  });
}

export const test = base.extend<{ mapPage: Page }>({
  mapPage: async ({ page }, use) => {
    await page.goto("/");
    await waitForMapReady(page);
    await use(page);
  },
});

export { expect, waitForMapReady };
