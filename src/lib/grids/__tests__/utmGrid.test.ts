import { describe, expect, it } from "vitest";
import {
  getUtmGridIntervalMeters,
  getUtmLatBand,
  lngToUtmZone,
  utmZoneCentralMeridian,
  latLngToUtm,
  utmToLatLng,
  getUtmGridLabel,
  getIntermediateStepMeters,
} from "@/lib/grids/utmGrid";

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

  it("zoom=11 は20000m", () => {
    expect(getUtmGridIntervalMeters(11)).toBe(20000);
  });

  it("zoom=12 は10000m", () => {
    expect(getUtmGridIntervalMeters(12)).toBe(10000);
  });

  it("zoom=13 は5000m", () => {
    expect(getUtmGridIntervalMeters(13)).toBe(5000);
  });

  it("zoom=14 は3000m", () => {
    expect(getUtmGridIntervalMeters(14)).toBe(3000);
  });

  it("zoom=16 は500m", () => {
    expect(getUtmGridIntervalMeters(16)).toBe(500);
  });

  it("zoom=17 は250m", () => {
    expect(getUtmGridIntervalMeters(17)).toBe(250);
  });

  it("zoom>=18 は100m", () => {
    expect(getUtmGridIntervalMeters(18)).toBe(100);
    expect(getUtmGridIntervalMeters(20)).toBe(100);
  });
});

describe("latLngToUtm / utmToLatLng", () => {
  it("東京(zone 54)でラウンドトリップ変換", () => {
    const lng = 139.6917;
    const lat = 35.6895;
    const zone = 54;

    const utm = latLngToUtm(lng, lat, zone);
    expect(utm.southern).toBe(false);
    expect(utm.easting).toBeGreaterThan(0);
    expect(utm.northing).toBeGreaterThan(0);

    const result = utmToLatLng(utm.easting, utm.northing, zone, utm.southern);
    expect(result.lng).toBeCloseTo(lng, 5);
    expect(result.lat).toBeCloseTo(lat, 5);
  });

  it("南半球(-33.86, 151.21 シドニー zone 56)でラウンドトリップ変換", () => {
    const lng = 151.21;
    const lat = -33.86;
    const zone = 56;

    const utm = latLngToUtm(lng, lat, zone);
    expect(utm.southern).toBe(true);

    const result = utmToLatLng(utm.easting, utm.northing, zone, utm.southern);
    expect(result.lng).toBeCloseTo(lng, 5);
    expect(result.lat).toBeCloseTo(lat, 5);
  });
});

describe("getUtmGridLabel", () => {
  it("100kmグリッドで5文字のMGRSラベルを返す", () => {
    const label = getUtmGridLabel(139.69, 35.68, 100000);
    expect(label).not.toBeNull();
    expect(label).toHaveLength(5);
    expect(label).toMatch(/^\d{2}[A-Z]{3}$/);
  });

  it("サブグリッドでMGRS精度4ラベルを返す", () => {
    const label = getUtmGridLabel(139.69, 35.68, 10000);
    expect(label).not.toBeNull();
    // ゾーン(2桁) + バンド(1文字) + 100km(2文字) + easting(4桁) + northing(4桁) = 13文字
    expect(label).toHaveLength(13);
  });

  it("極域ではnullを返す", () => {
    expect(getUtmGridLabel(0, 85, 100000)).toBeNull();
    expect(getUtmGridLabel(0, -81, 100000)).toBeNull();
  });
});

describe("getIntermediateStepMeters", () => {
  it("100km間隔は10km刻み", () => {
    expect(getIntermediateStepMeters(100000)).toBe(10000);
  });

  it("20km間隔は10km刻み", () => {
    expect(getIntermediateStepMeters(20000)).toBe(10000);
  });

  it("10km間隔はそのまま10km", () => {
    expect(getIntermediateStepMeters(10000)).toBe(10000);
  });

  it("5km間隔はそのまま5km", () => {
    expect(getIntermediateStepMeters(5000)).toBe(5000);
  });

  it("1km間隔はそのまま1km", () => {
    expect(getIntermediateStepMeters(1000)).toBe(1000);
  });
});
