import { describe, expect, it } from "vitest";
import { get1stMeshCode, get2ndMeshCode, getMeshConfig } from "../regionalMesh";

describe("getMeshConfig", () => {
  it("zoom<=3 はnullを返す", () => {
    expect(getMeshConfig(1)).toBeNull();
    expect(getMeshConfig(3)).toBeNull();
  });

  it("zoom=4~7 は1次メッシュ", () => {
    for (let z = 4; z <= 7; z++) {
      const config = getMeshConfig(z);
      expect(config).not.toBeNull();
      expect(config?.level).toBe("1次");
      expect(config?.latInterval).toBeCloseTo(40 / 60);
      expect(config?.lngInterval).toBe(1);
    }
  });

  it("zoom=8~11 は2次メッシュ", () => {
    for (let z = 8; z <= 11; z++) {
      const config = getMeshConfig(z);
      expect(config).not.toBeNull();
      expect(config?.level).toBe("2次");
      expect(config?.latInterval).toBeCloseTo(5 / 60);
      expect(config?.lngInterval).toBeCloseTo(7.5 / 60);
    }
  });

  it("zoom>=12 は3次メッシュ", () => {
    const config = getMeshConfig(12);
    expect(config).not.toBeNull();
    expect(config?.level).toBe("3次");
    expect(config?.latInterval).toBeCloseTo(30 / 3600);
    expect(config?.lngInterval).toBeCloseTo(45 / 3600);
  });
});

describe("get1stMeshCode", () => {
  it("東京(35.68, 139.69)の1次メッシュコード", () => {
    const code = get1stMeshCode(35.68, 139.69);
    expect(code).toBe("5339");
  });

  it("札幌(43.06, 141.35)の1次メッシュコード", () => {
    const code = get1stMeshCode(43.06, 141.35);
    expect(code).toBe("6441");
  });
});

describe("get2ndMeshCode", () => {
  it("東京(35.68, 139.69)の2次メッシュコード", () => {
    const code = get2ndMeshCode(35.68, 139.69);
    // lat: floor(35.68*60/40)=53, lng: floor(139.69-100)=39
    // latRem: (35.68*60)%40 = 2140.8%40 = 20.8, m2lat: floor(20.8/5) = 4
    // lngRem: 139.69-100-39 = 0.69, m2lng: floor(0.69*60/7.5) = floor(5.52) = 5
    expect(code).toBe("533945");
  });

  it("札幌(43.06, 141.35)の2次メッシュコード", () => {
    const code = get2ndMeshCode(43.06, 141.35);
    // lat: floor(43.06*60/40)=64, lng: floor(141.35-100)=41
    // latRem: (43.06*60)%40 = 2583.6%40 = 23.6, m2lat: floor(23.6/5) = 4
    // lngRem: 141.35-100-41 = 0.35, m2lng: floor(0.35*60/7.5) = floor(2.8) = 2
    expect(code).toBe("644142");
  });
});
