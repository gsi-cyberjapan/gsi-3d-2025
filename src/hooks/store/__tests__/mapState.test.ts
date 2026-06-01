import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/getBaseLayers", () => ({
  getBaseLayers: () => [
    {
      id: "std-vector",
      type: "vector",
      label: "標準地図",
      legendImageUrl: "http://example.com/std.png",
      styleUrl: "https://example.com/std.json",
      minZoom: 4,
      maxZoom: 16,
    },
    {
      id: "pale-vector",
      type: "vector",
      label: "淡色地図",
      legendImageUrl: "http://example.com/pale.png",
      styleUrl: "https://example.com/pale.json",
      minZoom: 4,
      maxZoom: 16,
    },
  ],
}));

import { createTestStore } from "../../../../tests/helpers/createTestStore";
import type { BaseLayer } from "@/lib/getBaseLayers";

type TestStore = ReturnType<typeof createTestStore>;

describe("mapState", () => {
  let store: TestStore;

  beforeEach(() => {
    store = createTestStore();
  });

  describe("setBaseLayer", () => {
    it("指定 mapId のみベースレイヤーが更新される", () => {
      const newLayer: BaseLayer = {
        id: "pale-vector",
        type: "vector",
        label: "淡色地図",
        legendImageUrl: "http://example.com/pale.png",
        styleUrl: "https://example.com/pale.json",
        minZoom: 4,
        maxZoom: 16,
      };
      store.getState().setBaseLayer({ mapId: "main", baseLayer: newLayer });

      expect(store.getState().maps.main.baseLayer.id).toBe("pale-vector");
      expect(store.getState().maps.sub.baseLayer.id).toBe("std-vector");
    });
  });

  describe("setProjection", () => {
    it("投影モードを変更できる", () => {
      store.getState().setProjection({ mapId: "main", mode: "globe" });
      expect(store.getState().maps.main.projection).toBe("globe");
      expect(store.getState().maps.sub.projection).toBe("mercator");
    });
  });

  describe("setTerraDraw", () => {
    it("TerraDraw インスタンスを設定できる", () => {
      const mockTd = { id: "mock-td" } as never;
      store.getState().setTerraDraw({ mapId: "main", td: mockTd });
      expect(store.getState().maps.main.td).toBe(mockTd);
    });

    it("2回目の呼び出しは無視される", () => {
      const td1 = { id: "td-1" } as never;
      const td2 = { id: "td-2" } as never;
      store.getState().setTerraDraw({ mapId: "main", td: td1 });
      store.getState().setTerraDraw({ mapId: "main", td: td2 });
      expect(store.getState().maps.main.td).toBe(td1);
    });
  });

  describe("setOptionalLayer", () => {
    it("オプションレイヤーを設定できる", () => {
      const layers = [
        {
          layerId: "layer-1",
          title: "テスト",
          opacity: 1,
          visible: true,
          tileUrl: "https://example.com/{z}/{x}/{y}.png",
        },
      ];
      store.getState().setOptionalLayer({ mapId: "main", layers });
      expect(store.getState().maps.main.optionalLayers).toEqual(layers);
      expect(store.getState().maps.sub.optionalLayers).toEqual([]);
    });
  });

  describe("setHillshadeEnabled", () => {
    it("陰影表示を切り替えられる", () => {
      store.getState().setHillshadeEnabled({ mapId: "main", enabled: true });
      expect(store.getState().maps.main.isHillshadeEnabled).toBe(true);
    });
  });

  describe("setTerrainEnabled", () => {
    it("立体表示を切り替えられる", () => {
      store.getState().setTerrainEnabled({ mapId: "sub", enabled: true });
      expect(store.getState().maps.sub.isTerrainEnabled).toBe(true);
      expect(store.getState().maps.main.isTerrainEnabled).toBe(true);
    });
  });

  describe("setPointCloudEnabled", () => {
    it("点群表示を切り替えられる", () => {
      store.getState().setPointCloudEnabled({ mapId: "main", enabled: true });
      expect(store.getState().maps.main.isPointCloudEnabled).toBe(true);
    });
  });

  describe("setDenshi3dEnabled", () => {
    it("3次元基本図表示を切り替えられる", () => {
      store.getState().setDenshi3dEnabled({ mapId: "main", enabled: true });
      expect(store.getState().maps.main.isDenshi3dEnabled).toBe(true);
    });
  });

  describe("hydrateMapState", () => {
    it("main のベースレイヤーと投影を選択的に復元できる", () => {
      const layer: BaseLayer = {
        id: "pale-vector",
        type: "vector",
        label: "淡色地図",
        legendImageUrl: "http://example.com/pale.png",
        styleUrl: "https://example.com/pale.json",
        minZoom: 4,
        maxZoom: 16,
      };
      store.getState().hydrateMapState({
        mainBaseLayer: layer,
        mainProjection: "globe",
        mainHillshade: true,
      });

      expect(store.getState().maps.main.baseLayer.id).toBe("pale-vector");
      expect(store.getState().maps.main.projection).toBe("globe");
      expect(store.getState().maps.main.isHillshadeEnabled).toBe(true);
    });

    it("sub の状態も独立して復元できる", () => {
      store.getState().hydrateMapState({
        subTerrain: true,
        subPointCloud: true,
        subDenshi3d: true,
      });

      expect(store.getState().maps.sub.isTerrainEnabled).toBe(true);
      expect(store.getState().maps.sub.isPointCloudEnabled).toBe(true);
      expect(store.getState().maps.sub.isDenshi3dEnabled).toBe(true);
      expect(store.getState().maps.main.isTerrainEnabled).toBe(true);
    });
  });
});
