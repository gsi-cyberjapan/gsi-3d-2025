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

describe("drawState", () => {
  let store: TestStore;

  beforeEach(() => {
    store = createTestStore();
  });

  describe("toggleSourceVisibility", () => {
    it("ソースキーを追加・削除できる", () => {
      store.getState().toggleSourceVisibility("main:terradraw");
      expect(store.getState().hiddenSources.has("main:terradraw")).toBe(true);

      store.getState().toggleSourceVisibility("main:terradraw");
      expect(store.getState().hiddenSources.has("main:terradraw")).toBe(false);
    });

    it("複数のソースキーを管理できる", () => {
      store.getState().toggleSourceVisibility("main:terradraw");
      store.getState().toggleSourceVisibility("sub:sample.geojson");
      expect(store.getState().hiddenSources.size).toBe(2);
    });
  });

  describe("setIsDrawWindowOpen", () => {
    it("true にすると isMeasureWindowOpen が false になる", () => {
      store.getState().setIsMeasureWindowOpen(true);
      expect(store.getState().isMeasureWindowOpen).toBe(true);

      store.getState().setIsDrawWindowOpen(true);
      expect(store.getState().isDrawWindowOpen).toBe(true);
      expect(store.getState().isMeasureWindowOpen).toBe(false);
    });

    it("false にしても isMeasureWindowOpen には影響しない", () => {
      store.getState().setIsMeasureWindowOpen(true);
      store.getState().setIsDrawWindowOpen(false);
      expect(store.getState().isDrawWindowOpen).toBe(false);
      expect(store.getState().isMeasureWindowOpen).toBe(true);
    });
  });

  describe("setDrawMode", () => {
    it("作図モードを変更できる", () => {
      store.getState().setDrawMode("polygon");
      expect(store.getState().drawMode).toBe("polygon");
    });
  });

  describe("setEditingFeature", () => {
    it("編集対象フィーチャーを設定できる", () => {
      const feature = { featureId: "feat-1", mapId: "main" as const };
      store.getState().setEditingFeature(feature);
      expect(store.getState().editingFeature).toEqual(feature);
    });

    it("undefined でクリアできる", () => {
      store
        .getState()
        .setEditingFeature({ featureId: "feat-1", mapId: "main" });
      store.getState().setEditingFeature(undefined);
      expect(store.getState().editingFeature).toBeUndefined();
    });
  });

  describe("setSelectedFeature", () => {
    it("選択中フィーチャーを設定できる", () => {
      const feature = { featureId: "feat-2", mapId: "sub" as const };
      store.getState().setSelectedFeature(feature);
      expect(store.getState().selectedFeature).toEqual(feature);
    });

    it("null でクリアできる", () => {
      store
        .getState()
        .setSelectedFeature({ featureId: "feat-2", mapId: "sub" });
      store.getState().setSelectedFeature(null);
      expect(store.getState().selectedFeature).toBeNull();
    });
  });

  describe("setDraggingPosition", () => {
    it("ドラッグ位置を設定できる", () => {
      const pos = {
        featureId: "feat-1",
        mapId: "main" as const,
        longitude: 139.76,
        latitude: 35.68,
      };
      store.getState().setDraggingPosition(pos);
      expect(store.getState().draggingPosition).toEqual(pos);
    });

    it("null でクリアできる", () => {
      store.getState().setDraggingPosition(null);
      expect(store.getState().draggingPosition).toBeNull();
    });
  });

  describe("setSelectedMarkerSymbol", () => {
    it("マーカーシンボルを変更できる", () => {
      store.getState().setSelectedMarkerSymbol("001.png");
      expect(store.getState().selectedMarkerSymbol).toBe("001.png");
    });
  });
});
