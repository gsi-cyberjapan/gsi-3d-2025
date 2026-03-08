import { describe, expect, it } from "vitest";
import {
  COLOR_PATTERNS,
  getDefaultRanges,
  getPatternById,
} from "@/lib/relief/colorPatterns";

describe("getPatternById", () => {
  it("defaultパターンを取得する", () => {
    const pattern = getPatternById("default");
    expect(pattern).toBeDefined();
    expect(pattern?.id).toBe("default");
    expect(pattern?.title).toBe("デフォルト");
    expect(pattern?.ranges.length).toBeGreaterThan(0);
  });

  it("grayscaleパターンを取得する", () => {
    const pattern = getPatternById("grayscale");
    expect(pattern).toBeDefined();
    expect(pattern?.id).toBe("grayscale");
  });

  it("存在しないIDはundefinedを返す", () => {
    expect(getPatternById("nonexistent")).toBeUndefined();
  });
});

describe("getDefaultRanges", () => {
  it("配列を返す", () => {
    const ranges = getDefaultRanges();
    expect(Array.isArray(ranges)).toBe(true);
    expect(ranges.length).toBeGreaterThan(0);
  });

  it("各要素にid, minElevation, colorがある", () => {
    const ranges = getDefaultRanges();
    for (const range of ranges) {
      expect(range).toHaveProperty("id");
      expect(range).toHaveProperty("minElevation");
      expect(range).toHaveProperty("color");
      expect(typeof range.id).toBe("string");
      expect(typeof range.minElevation).toBe("number");
      expect(typeof range.color).toBe("string");
    }
  });

  it("idはrange-{index}形式", () => {
    const ranges = getDefaultRanges();
    ranges.forEach((range, index) => {
      expect(range.id).toBe(`range-${String(index)}`);
    });
  });
});

describe("COLOR_PATTERNS", () => {
  it("全パターンにid, title, rangesがある", () => {
    for (const pattern of COLOR_PATTERNS) {
      expect(pattern).toHaveProperty("id");
      expect(pattern).toHaveProperty("title");
      expect(pattern).toHaveProperty("ranges");
      expect(typeof pattern.id).toBe("string");
      expect(typeof pattern.title).toBe("string");
      expect(Array.isArray(pattern.ranges)).toBe(true);
      expect(pattern.ranges.length).toBeGreaterThan(0);
    }
  });

  it("少なくとも4パターンある", () => {
    expect(COLOR_PATTERNS.length).toBeGreaterThanOrEqual(4);
  });

  it("全パターンのrangesにminElevationとcolorがある", () => {
    for (const pattern of COLOR_PATTERNS) {
      for (const range of pattern.ranges) {
        expect(typeof range.minElevation).toBe("number");
        expect(typeof range.color).toBe("string");
        expect(range.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });
});
