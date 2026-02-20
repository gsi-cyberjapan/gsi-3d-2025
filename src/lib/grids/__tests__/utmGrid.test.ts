import { describe, expect, it } from "vitest";
import {
  getUtmGridIntervalMeters,
  getUtmLatBand,
  lngToUtmZone,
  utmZoneCentralMeridian,
} from "../utmGrid";

describe("lngToUtmZone", () => {
  it("東京(139.69)はゾーン54", () => {
    expect(lngToUtmZone(139.69)).toBe(54);
  });

  it("グリニッジ(0)はゾーン31", () => {
    expect(lngToUtmZone(0)).toBe(31);
  });

  it("ニューヨーク(-74)はゾーン18", () => {
    expect(lngToUtmZone(-74)).toBe(18);
  });
});

describe("utmZoneCentralMeridian", () => {
  it("ゾーン54の中央経線は141°", () => {
    expect(utmZoneCentralMeridian(54)).toBe(141);
  });

  it("ゾーン31の中央経線は3°", () => {
    expect(utmZoneCentralMeridian(31)).toBe(3);
  });

  it("ゾーン1の中央経線は-177°", () => {
    expect(utmZoneCentralMeridian(1)).toBe(-177);
  });
});

describe("getUtmLatBand", () => {
  it("東京(35.68)はバンドS", () => {
    expect(getUtmLatBand(35.68)).toBe("S");
  });

  it("赤道(0)はバンドN", () => {
    expect(getUtmLatBand(0)).toBe("N");
  });

  it("南極付近(-80)はバンドC", () => {
    expect(getUtmLatBand(-80)).toBe("C");
  });

  it("北極付近(84)はバンドX", () => {
    expect(getUtmLatBand(84)).toBe("X");
  });
});

describe("getUtmGridIntervalMeters", () => {
  it("zoom<=7 は0（ゾーン表示のみ）", () => {
    expect(getUtmGridIntervalMeters(5)).toBe(0);
    expect(getUtmGridIntervalMeters(7)).toBe(0);
  });

  it("zoom=8~10 は100000m", () => {
    expect(getUtmGridIntervalMeters(8)).toBe(100000);
    expect(getUtmGridIntervalMeters(10)).toBe(100000);
  });

  it("zoom=15 は1000m", () => {
    expect(getUtmGridIntervalMeters(15)).toBe(1000);
  });

  it("zoom>=18 は100m", () => {
    expect(getUtmGridIntervalMeters(18)).toBe(100);
    expect(getUtmGridIntervalMeters(20)).toBe(100);
  });
});
