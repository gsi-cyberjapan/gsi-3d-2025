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
import { DEFAULT_PATTERN_ID } from "@/lib/relief/colorPatterns";

type TestStore = ReturnType<typeof createTestStore>;

describe("reliefState", () => {
  let store: TestStore;

  beforeEach(() => {
    store = createTestStore();
  });

  describe("addElevationRange", () => {
    it("最小値-5の新レンジが追加され、selectedPatternId がクリアされる", () => {
      const initialCount = store.getState().elevationRanges.length;
      store.getState().addElevationRange();
      const s = store.getState();

      expect(s.elevationRanges.length).toBe(initialCount + 1);
      expect(s.selectedPatternId).toBe("");

      const newRange = s.elevationRanges[s.elevationRanges.length - 1];
      expect(newRange.color).toBe("#808080");
    });
  });

  describe("removeElevationRange", () => {
    it("最小2件制約: 2件以下では削除できない", () => {
      // まず2件だけにする
      store.getState().setElevationRanges([
        { id: "r1", minElevation: 0, color: "#000" },
        { id: "r2", minElevation: 100, color: "#fff" },
      ]);

      store.getState().removeElevationRange("r1");
      expect(store.getState().elevationRanges.length).toBe(2);
    });

    it("3件以上の場合は削除できる", () => {
      store.getState().setElevationRanges([
        { id: "r1", minElevation: 0, color: "#000" },
        { id: "r2", minElevation: 100, color: "#fff" },
        { id: "r3", minElevation: 200, color: "#aaa" },
      ]);

      store.getState().removeElevationRange("r2");
      expect(store.getState().elevationRanges.length).toBe(2);
      expect(
        store.getState().elevationRanges.find((r) => r.id === "r2"),
      ).toBeUndefined();
      expect(store.getState().selectedPatternId).toBe("");
    });
  });

  describe("updateElevationRange", () => {
    it("更新後に minElevation でソートされる", () => {
      store.getState().setElevationRanges([
        { id: "r1", minElevation: 0, color: "#000" },
        { id: "r2", minElevation: 100, color: "#fff" },
        { id: "r3", minElevation: 200, color: "#aaa" },
      ]);

      store.getState().updateElevationRange("r3", { minElevation: 50 });
      const ranges = store.getState().elevationRanges;
      expect(ranges[0].id).toBe("r1");
      expect(ranges[1].id).toBe("r3");
      expect(ranges[1].minElevation).toBe(50);
      expect(ranges[2].id).toBe("r2");
      expect(store.getState().selectedPatternId).toBe("");
    });
  });

  describe("applyColorPattern", () => {
    it("パターン適用でレンジが生成される", () => {
      store.getState().applyColorPattern("topographic");
      const s = store.getState();
      expect(s.selectedPatternId).toBe("topographic");
      expect(s.elevationRanges.length).toBeGreaterThan(0);
      expect(s.elevationRanges[0].id).toContain("pattern-topographic-");
    });

    it("存在しないパターンでは何も変わらない", () => {
      const before = store.getState().elevationRanges;
      store.getState().applyColorPattern("non-existent");
      expect(store.getState().elevationRanges).toBe(before);
    });
  });

  describe("resetToDefaults", () => {
    it("デフォルト値にリセットされる", () => {
      store.getState().applyColorPattern("topographic");
      store.getState().setIsHillshadeEnabled(true);

      store.getState().resetToDefaults();
      const s = store.getState();
      expect(s.selectedPatternId).toBe(DEFAULT_PATTERN_ID);
      expect(s.isHillshadeEnabled).toBe(false);
      expect(s.elevationRanges.length).toBe(7);
    });
  });

  describe("hydrateReliefState", () => {
    it("各フィールドを選択的に復元できる", () => {
      store.getState().hydrateReliefState({
        isReliefWindowOpen: true,
        isHillshadeEnabled: true,
        selectedPatternId: "elevation",
      });
      const s = store.getState();
      expect(s.isReliefWindowOpen).toBe(true);
      expect(s.isHillshadeEnabled).toBe(true);
      expect(s.selectedPatternId).toBe("elevation");
    });
  });
});
