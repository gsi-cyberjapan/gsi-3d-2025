import { describe, expect, it } from "vitest";
import {
  buildColorInterpolation,
  buildColorStep,
} from "@/lib/relief/buildColorInterpolation";
import type { ElevationRange } from "@/lib/relief/colorPatterns";
import { NODATA_ELEVATION } from "@/lib/gsiDemReliefProtocol";

describe("buildColorInterpolation", () => {
  it("正常な入力でinterpolation式を生成する", () => {
    const ranges: ElevationRange[] = [
      { id: "1", minElevation: 0, color: "#87CEEB" },
      { id: "2", minElevation: 100, color: "#FFFF00" },
      { id: "3", minElevation: 500, color: "#FF8C00" },
    ];
    const result = buildColorInterpolation(ranges);

    expect(result[0]).toBe("interpolate");
    expect(result[1]).toEqual(["linear"]);
    expect(result[2]).toEqual(["elevation"]);
    // nodata stops
    expect(result[3]).toBe(NODATA_ELEVATION);
    expect(result[4]).toBe("rgba(0,0,0,0)");
    expect(result[5]).toBe(NODATA_ELEVATION + 1);
    expect(result[6]).toBe("#87CEEB");
    // user stops: 0, "#87CEEB", 100, "#FFFF00", 500, "#FF8C00"
    expect(result[7]).toBe(0);
    expect(result[8]).toBe("#87CEEB");
    expect(result[9]).toBe(100);
    expect(result[10]).toBe("#FFFF00");
    expect(result[11]).toBe(500);
    expect(result[12]).toBe("#FF8C00");
  });

  it("未ソートの入力を正しくソートする", () => {
    const ranges: ElevationRange[] = [
      { id: "1", minElevation: 500, color: "#FF8C00" },
      { id: "2", minElevation: 0, color: "#87CEEB" },
      { id: "3", minElevation: 100, color: "#FFFF00" },
    ];
    const result = buildColorInterpolation(ranges);

    // nodata stops at [3..6], then ソート後: 0, 100, 500
    expect(result[7]).toBe(0);
    expect(result[9]).toBe(100);
    expect(result[11]).toBe(500);
  });

  it("同一標高の重複は後勝ちで排除する", () => {
    const ranges: ElevationRange[] = [
      { id: "1", minElevation: 0, color: "#000000" },
      { id: "2", minElevation: 100, color: "#FF0000" },
      { id: "3", minElevation: 100, color: "#00FF00" },
    ];
    const result = buildColorInterpolation(ranges);

    // header(3) + nodata(4) + 2 user stops * 2
    expect(result.length).toBe(3 + 4 + 4);
    expect(result[9]).toBe(100);
    expect(result[10]).toBe("#00FF00"); // 後勝ち
  });

  it("1つのrangeでも動作する", () => {
    const ranges: ElevationRange[] = [
      { id: "1", minElevation: 0, color: "#87CEEB" },
    ];
    const result = buildColorInterpolation(ranges);

    expect(result[0]).toBe("interpolate");
    // header(3) + nodata(4) + 1 user stop * 2
    expect(result.length).toBe(3 + 4 + 2);
  });
});

describe("buildColorStep", () => {
  it("interpolate式で離散的な色境界を生成する", () => {
    const ranges: ElevationRange[] = [
      { id: "1", minElevation: 0, color: "#87CEEB" },
      { id: "2", minElevation: 100, color: "#FFFF00" },
      { id: "3", minElevation: 500, color: "#FF8C00" },
    ];
    const result = buildColorStep(ranges);

    // Uses interpolate (not step) because color-relief only supports interpolate
    expect(result[0]).toBe("interpolate");
    expect(result[1]).toEqual(["linear"]);
    expect(result[2]).toEqual(["elevation"]);

    // Nodata stops
    expect(result[3]).toBe(NODATA_ELEVATION);
    expect(result[4]).toBe("rgba(0,0,0,0)");
    expect(result[5]).toBe(NODATA_ELEVATION + 1);
    expect(result[6]).toBe("#87CEEB");

    // First user stop: 0, "#87CEEB"
    expect(result[7]).toBe(0);
    expect(result[8]).toBe("#87CEEB");
    // Transition stop just before 100: 99.99, "#87CEEB"
    expect(result[9]).toBe(99.99);
    expect(result[10]).toBe("#87CEEB");
    // Second stop: 100, "#FFFF00"
    expect(result[11]).toBe(100);
    expect(result[12]).toBe("#FFFF00");
    // Transition stop just before 500: 499.99, "#FFFF00"
    expect(result[13]).toBe(499.99);
    expect(result[14]).toBe("#FFFF00");
    // Third stop: 500, "#FF8C00"
    expect(result[15]).toBe(500);
    expect(result[16]).toBe("#FF8C00");
  });

  it("未ソートの入力を正しくソートする", () => {
    const ranges: ElevationRange[] = [
      { id: "1", minElevation: 500, color: "#FF8C00" },
      { id: "2", minElevation: 0, color: "#87CEEB" },
      { id: "3", minElevation: 100, color: "#FFFF00" },
    ];
    const result = buildColorStep(ranges);

    // nodata stops at [3..6], first user stop is 0 (sorted)
    expect(result[7]).toBe(0);
    expect(result[8]).toBe("#87CEEB");
  });

  it("同一標高の重複は後勝ちで排除する", () => {
    const ranges: ElevationRange[] = [
      { id: "1", minElevation: 0, color: "#000000" },
      { id: "2", minElevation: 100, color: "#FF0000" },
      { id: "3", minElevation: 100, color: "#00FF00" },
    ];
    const result = buildColorStep(ranges);

    // Deduped to 2 ranges: 0 and 100
    // nodata stops at [3..6], then: 0, "#000000", 99.99, "#000000", 100, "#00FF00"
    expect(result[7]).toBe(0);
    expect(result[8]).toBe("#000000");
    expect(result[9]).toBe(99.99);
    expect(result[10]).toBe("#000000");
    expect(result[11]).toBe(100);
    expect(result[12]).toBe("#00FF00"); // 後勝ち
  });

  it("1つのrangeでも動作する", () => {
    const ranges: ElevationRange[] = [
      { id: "1", minElevation: 0, color: "#87CEEB" },
    ];
    const result = buildColorStep(ranges);

    expect(result[0]).toBe("interpolate");
    // header(3) + nodata(4) + 1 user stop * 2
    expect(result.length).toBe(3 + 4 + 2);
    expect(result[7]).toBe(0);
    expect(result[8]).toBe("#87CEEB");
  });

  it("近接する標高ではepsilonストップを省略する", () => {
    const ranges: ElevationRange[] = [
      { id: "1", minElevation: 0, color: "#000000" },
      { id: "2", minElevation: 0.005, color: "#FFFFFF" },
    ];
    const result = buildColorStep(ranges);

    // nodata stops at [3..6]
    // 0.005 - 0.01 = -0.005 which is < 0 (previous stop), so epsilon stop is skipped
    // User stops: 0, "#000000", 0.005, "#FFFFFF"
    expect(result[7]).toBe(0);
    expect(result[8]).toBe("#000000");
    expect(result[9]).toBe(0.005);
    expect(result[10]).toBe("#FFFFFF");
    // header(3) + nodata(4) + 2 user stops * 2
    expect(result.length).toBe(3 + 4 + 4);
  });
});
