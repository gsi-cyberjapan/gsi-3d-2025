import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("maplibre-gl", () => ({
  LngLat: class LngLat {
    lng: number;
    lat: number;
    constructor(lng: number, lat: number) {
      this.lng = lng;
      this.lat = lat;
    }
  },
}));

vi.mock("mgrs", () => ({
  toPoint: (input: string) => {
    if (input === "54SUE83694920") {
      return [139.7671, 35.6812];
    }
    throw new Error("Invalid MGRS");
  },
}));

vi.mock("../getMuniData", () => ({
  getMuniData: vi.fn().mockResolvedValue(null),
}));

import { geocode } from "../geocode";

describe("geocode", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("緯度経度 (lnglat)", () => {
    it("カンマ区切りの座標", () => {
      const result = geocode("35.68,139.76");
      expect(result.type).toBe("point");
      expect(result.detected.kind).toBe("lnglat");
      if (result.type === "point") {
        expect(result.lnglat.lat).toBeCloseTo(35.68, 2);
        expect(result.lnglat.lng).toBeCloseTo(139.76, 2);
      }
    });

    it("z/lat/lng 形式", () => {
      const result = geocode("15/35.68/139.76");
      expect(result.type).toBe("point");
      expect(result.detected.kind).toBe("lnglat");
      if (result.type === "point") {
        expect(result.lnglat.lat).toBeCloseTo(35.68, 2);
        expect(result.lnglat.lng).toBeCloseTo(139.76, 2);
      }
    });

    it("#z/lat/lng 形式", () => {
      const result = geocode("#15/35.68/139.76");
      expect(result.type).toBe("point");
      expect(result.detected.kind).toBe("lnglat");
    });
  });

  describe("度分秒 (lnglatDms)", () => {
    it("日本語形式の度分秒", () => {
      const result = geocode("35度40分57秒 139度45分10秒");
      expect(result.type).toBe("point");
      expect(result.detected.kind).toBe("lnglatDms");
      if (result.type === "point") {
        expect(result.lnglat.lat).toBeCloseTo(35.6825, 2);
        expect(result.lnglat.lng).toBeCloseTo(139.7528, 2);
      }
    });
  });

  describe("MGRS", () => {
    it("MGRS 座標", () => {
      const result = geocode("54SUE83694920");
      expect(result.type).toBe("point");
      expect(result.detected.kind).toBe("mgrs");
      if (result.type === "point") {
        expect(result.lnglat.lat).toBeCloseTo(35.6812, 2);
        expect(result.lnglat.lng).toBeCloseTo(139.7671, 2);
      }
    });
  });

  describe("住所 (address)", () => {
    it("日本語住所は address として検出される", () => {
      const result = geocode("東京都千代田区");
      expect(result.type).toBe("address");
      expect(result.detected.kind).toBe("address");
    });
  });
});
