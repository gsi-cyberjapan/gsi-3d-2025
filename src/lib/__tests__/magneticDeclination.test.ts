import { describe, expect, it } from "vitest";
import {
  getMagneticDeclination,
  isValidForMagneticDeclination,
} from "../magneticDeclination";

describe("getMagneticDeclination", () => {
  it("東京の座標で数値を返す", () => {
    const result = getMagneticDeclination(35.68, 139.69);
    expect(result).toBeTypeOf("number");
  });

  it("東京は西偏（負の値）を返す", () => {
    const result = getMagneticDeclination(35.68, 139.69);
    expect(result).not.toBeNull();
    expect(result).toBeLessThan(0);
  });

  it("東京の偏角は妥当な範囲内", () => {
    const result = getMagneticDeclination(35.68, 139.69);
    expect(result).not.toBeNull();
    // 日本の磁気偏角は概ね -6° ～ -10° 程度
    expect(result).toBeGreaterThan(-15);
    expect(result).toBeLessThan(0);
  });

  it("海外座標(0, 0)はnullを返す", () => {
    expect(getMagneticDeclination(0, 0)).toBeNull();
  });

  it("範囲外の座標はnullを返す", () => {
    expect(getMagneticDeclination(60, 139)).toBeNull();
  });
});

describe("isValidForMagneticDeclination", () => {
  it("日本範囲内の座標はtrueを返す", () => {
    expect(isValidForMagneticDeclination(35, 140)).toBe(true);
  });

  it("範囲外の座標はfalseを返す", () => {
    expect(isValidForMagneticDeclination(0, 0)).toBe(false);
  });

  it("境界値(20, 122)はtrueを返す", () => {
    expect(isValidForMagneticDeclination(20, 122)).toBe(true);
  });

  it("境界値(46, 154)はtrueを返す", () => {
    expect(isValidForMagneticDeclination(46, 154)).toBe(true);
  });

  it("境界外(19, 122)はfalseを返す", () => {
    expect(isValidForMagneticDeclination(19, 122)).toBe(false);
  });

  it("境界外(20, 121)はfalseを返す", () => {
    expect(isValidForMagneticDeclination(20, 121)).toBe(false);
  });

  it("境界外(47, 154)はfalseを返す", () => {
    expect(isValidForMagneticDeclination(47, 154)).toBe(false);
  });

  it("境界外(46, 155)はfalseを返す", () => {
    expect(isValidForMagneticDeclination(46, 155)).toBe(false);
  });
});
