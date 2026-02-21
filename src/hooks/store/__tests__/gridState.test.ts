import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/getBaseLayers", () => ({
  getBaseLayers: () => [
    {
      id: "std-vector",
      type: "vector",
      label: "標準地図",
      legendImageUrl: "",
      styleUrl: "",
      minZoom: 4,
      maxZoom: 16,
    },
  ],
}));

import { createTestStore } from "../../../../tests/helpers/createTestStore";

type TestStore = ReturnType<typeof createTestStore>;

describe("gridState", () => {
  let store: TestStore;

  beforeEach(() => {
    store = createTestStore();
  });

  describe("各トグルセッター", () => {
    it("緯度経度グリッドを切り替えられる", () => {
      store.getState().setIsDisplayLatLngGrid(true);
      expect(store.getState().isDisplayLatLngGrid).toBe(true);
      store.getState().setIsDisplayLatLngGrid(false);
      expect(store.getState().isDisplayLatLngGrid).toBe(false);
    });

    it("UTMグリッドを切り替えられる", () => {
      store.getState().setIsDisplayUtmGrid(true);
      expect(store.getState().isDisplayUtmGrid).toBe(true);
    });

    it("タイル座標を切り替えられる", () => {
      store.getState().setIsDisplayTileGrid(true);
      expect(store.getState().isDisplayTileGrid).toBe(true);
    });

    it("地域メッシュを切り替えられる", () => {
      store.getState().setIsDisplayRegionalMesh(true);
      expect(store.getState().isDisplayRegionalMesh).toBe(true);
    });

    it("図郭番号を切り替えられる", () => {
      store.getState().setIsDisplayMapSheetNumbers(true);
      expect(store.getState().isDisplayMapSheetNumbers).toBe(true);
    });
  });

  describe("hydrateGridState", () => {
    it("各フィールドを選択的に復元できる", () => {
      store.getState().hydrateGridState({
        isDisplayLatLngGrid: true,
        isDisplayUtmGrid: true,
        isDisplayTileGrid: true,
      });
      const s = store.getState();
      expect(s.isDisplayLatLngGrid).toBe(true);
      expect(s.isDisplayUtmGrid).toBe(true);
      expect(s.isDisplayTileGrid).toBe(true);
      expect(s.isDisplayRegionalMesh).toBe(false);
      expect(s.isDisplayMapSheetNumbers).toBe(false);
    });

    it("未指定フィールドは変更されない", () => {
      store.getState().setIsDisplayRegionalMesh(true);
      store.getState().hydrateGridState({ isDisplayLatLngGrid: true });
      expect(store.getState().isDisplayRegionalMesh).toBe(true);
    });
  });
});
