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

describe("measureState", () => {
  let store: TestStore;

  beforeEach(() => {
    store = createTestStore();
  });

  describe("setIsMeasureWindowOpen", () => {
    it("true にすると isDrawWindowOpen が false になる", () => {
      store.getState().setIsDrawWindowOpen(true);
      expect(store.getState().isDrawWindowOpen).toBe(true);

      store.getState().setIsMeasureWindowOpen(true);
      expect(store.getState().isMeasureWindowOpen).toBe(true);
      expect(store.getState().isDrawWindowOpen).toBe(false);
    });

    it("false にすると currentMeasurement が null になる", () => {
      store.getState().setIsMeasureWindowOpen(true);
      store.getState().setCurrentMeasurement(123.45);
      expect(store.getState().currentMeasurement).toBe(123.45);

      store.getState().setIsMeasureWindowOpen(false);
      expect(store.getState().isMeasureWindowOpen).toBe(false);
      expect(store.getState().currentMeasurement).toBeNull();
    });
  });

  describe("setMeasureMode", () => {
    it("測定モード変更で currentMeasurement がリセットされる", () => {
      store.getState().setIsMeasureWindowOpen(true);
      store.getState().setCurrentMeasurement(500);

      store.getState().setMeasureMode("area");
      expect(store.getState().measureMode).toBe("area");
      expect(store.getState().currentMeasurement).toBeNull();
    });
  });

  describe("setCurrentMeasurement", () => {
    it("測定値を設定できる", () => {
      store.getState().setCurrentMeasurement(999);
      expect(store.getState().currentMeasurement).toBe(999);
    });

    it("null でクリアできる", () => {
      store.getState().setCurrentMeasurement(100);
      store.getState().setCurrentMeasurement(null);
      expect(store.getState().currentMeasurement).toBeNull();
    });
  });
});
