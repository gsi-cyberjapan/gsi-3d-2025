import { describe, expect, it } from "vitest";
import {
  getLatLngGridIntervalSeconds,
  secondsToDms,
} from "@/lib/grids/latLngGrid";

describe("getLatLngGridIntervalSeconds", () => {
  it("zoom<=3 は 144000秒(40°)", () => {
    expect(getLatLngGridIntervalSeconds(1)).toBe(144000);
    expect(getLatLngGridIntervalSeconds(3)).toBe(144000);
  });

  it("zoom=4 は 72000秒(20°)", () => {
    expect(getLatLngGridIntervalSeconds(4)).toBe(72000);
  });

  it("zoom=5 は 36000秒(10°)", () => {
    expect(getLatLngGridIntervalSeconds(5)).toBe(36000);
  });

  it("zoom=9 は 3600秒(1°)", () => {
    expect(getLatLngGridIntervalSeconds(9)).toBe(3600);
  });

  it("zoom=10 は 1800秒(30')", () => {
    expect(getLatLngGridIntervalSeconds(10)).toBe(1800);
  });

  it("zoom=15 は 60秒(1')", () => {
    expect(getLatLngGridIntervalSeconds(15)).toBe(60);
  });

  it("zoom>=18 は 10秒", () => {
    expect(getLatLngGridIntervalSeconds(18)).toBe(10);
    expect(getLatLngGridIntervalSeconds(20)).toBe(10);
  });
});

describe("secondsToDms", () => {
  it("度のみの表示", () => {
    expect(secondsToDms(3600, true)).toBe("1°");
  });

  it("度と分の表示", () => {
    expect(secondsToDms(5400, true)).toBe("1°30′");
  });

  it("度・分・秒の表示", () => {
    expect(secondsToDms(3661, true)).toBe("1°1′1″");
  });

  it("0秒", () => {
    expect(secondsToDms(0, true)).toBe("0°");
  });

  it("負の値", () => {
    expect(secondsToDms(-3600, false)).toBe("-1°");
  });

  it("大きな値(40°)", () => {
    expect(secondsToDms(144000, true)).toBe("40°");
  });
});
