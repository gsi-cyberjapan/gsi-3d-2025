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

describe("mapManagerState", () => {
  let store: TestStore;

  beforeEach(() => {
    store = createTestStore();
  });

  describe("setLayoutMode", () => {
    it("single: activeMapIds=[main], focusMapId=main, isSyncPosition=false", () => {
      store.getState().setLayoutMode("single");
      const s = store.getState();
      expect(s.layoutMode).toBe("single");
      expect(s.activeMapIds).toEqual(["main"]);
      expect(s.focusMapId).toBe("main");
      expect(s.isSyncPosition).toBe(false);
    });

    it("split: activeMapIds=[main,sub], focusMapId=sub, isSyncPosition=true", () => {
      store.getState().setLayoutMode("split");
      const s = store.getState();
      expect(s.layoutMode).toBe("split");
      expect(s.activeMapIds).toEqual(["main", "sub"]);
      expect(s.focusMapId).toBe("sub");
      expect(s.isSyncPosition).toBe(true);
    });

    it("overlay: activeMapIds=[main,sub], focusMapId=sub, isSyncPosition=true", () => {
      store.getState().setLayoutMode("overlay");
      const s = store.getState();
      expect(s.layoutMode).toBe("overlay");
      expect(s.activeMapIds).toEqual(["main", "sub"]);
      expect(s.focusMapId).toBe("sub");
      expect(s.isSyncPosition).toBe(true);
    });
  });

  describe("setFocusMapId", () => {
    it("focusMapId を変更できる", () => {
      store.getState().setFocusMapId("sub");
      expect(store.getState().focusMapId).toBe("sub");
    });
  });

  describe("setViewState", () => {
    it("指定した mapId の viewState を設定できる", () => {
      const viewState = {
        latitude: 35.68,
        longitude: 139.76,
        zoom: 10,
        bearing: 0,
        pitch: 0,
      };
      store.getState().setViewState("main", viewState);
      expect(store.getState().viewStates.main).toEqual(viewState);
      expect(store.getState().viewStates.sub).toBeNull();
    });
  });

  describe("setIsSyncPosition", () => {
    it("isSyncPosition を変更できる", () => {
      store.getState().setIsSyncPosition(true);
      expect(store.getState().isSyncPosition).toBe(true);
    });
  });

  describe("setSubMapOpacityOnOverlay", () => {
    it("透過度を変更できる", () => {
      store.getState().setSubMapOpacityOnOverlay(0.8);
      expect(store.getState().subMapOpacityOnOverlay).toBe(0.8);
    });
  });

  describe("setIsDisplayCenterLine", () => {
    it("中心線の表示を切り替えられる", () => {
      store.getState().setIsDisplayCenterLine(false);
      expect(store.getState().isDisplayCenterLine).toBe(false);
    });
  });

  describe("setIsDisplayOverview", () => {
    it("広域図の表示を切り替えられる", () => {
      store.getState().setIsDisplayOverview(true);
      expect(store.getState().isDisplayOverview).toBe(true);
    });
  });

  describe("setIsClickToMoveEnabled", () => {
    it("クリック移動を切り替えられる", () => {
      store.getState().setIsClickToMoveEnabled(true);
      expect(store.getState().isClickToMoveEnabled).toBe(true);
    });
  });

  describe("setIsDisplayMagneticNorth", () => {
    it("磁北線の表示を切り替えられる", () => {
      store.getState().setIsDisplayMagneticNorth(true);
      expect(store.getState().isDisplayMagneticNorth).toBe(true);
    });
  });

  describe("setFooterDisplayMode", () => {
    it("フッター表示モードを変更できる", () => {
      store.getState().setFooterDisplayMode("closed");
      expect(store.getState().footerDisplayMode).toBe("closed");
    });
  });

  describe("hydrateMapManagerState", () => {
    it("layoutMode=split でハイドレーション", () => {
      store.getState().hydrateMapManagerState({ layoutMode: "split" });
      const s = store.getState();
      expect(s.layoutMode).toBe("split");
      expect(s.activeMapIds).toEqual(["main", "sub"]);
      expect(s.focusMapId).toBe("sub");
    });

    it("layoutMode=single でハイドレーション", () => {
      store.getState().hydrateMapManagerState({ layoutMode: "single" });
      const s = store.getState();
      expect(s.layoutMode).toBe("single");
      expect(s.activeMapIds).toEqual(["main"]);
      expect(s.focusMapId).toBe("main");
    });

    it("各フィールドの選択的復元", () => {
      store.getState().hydrateMapManagerState({
        isSyncPosition: true,
        subMapOpacityOnOverlay: 0.7,
        isDisplayCenterLine: false,
        isDisplayOverview: true,
        isClickToMoveEnabled: true,
        isDisplayMagneticNorth: true,
        footerDisplayMode: "closed",
      });
      const s = store.getState();
      expect(s.isSyncPosition).toBe(true);
      expect(s.subMapOpacityOnOverlay).toBe(0.7);
      expect(s.isDisplayCenterLine).toBe(false);
      expect(s.isDisplayOverview).toBe(true);
      expect(s.isClickToMoveEnabled).toBe(true);
      expect(s.isDisplayMagneticNorth).toBe(true);
      expect(s.footerDisplayMode).toBe("closed");
    });

    it("viewState のハイドレーション", () => {
      const vs = {
        latitude: 35,
        longitude: 135,
        zoom: 8,
        bearing: 0,
        pitch: 0,
      };
      store.getState().hydrateMapManagerState({ mainViewState: vs });
      expect(store.getState().viewStates.main).toEqual(vs);
    });
  });
});
