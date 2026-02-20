import { describe, expect, it } from "vitest";
import { buildColorInterpolation } from "@/lib/relief/buildColorInterpolation";
import type { ElevationRange } from "@/lib/relief/colorPatterns";

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
    // stops: 0, "#87CEEB", 100, "#FFFF00", 500, "#FF8C00"
    expect(result[3]).toBe(0);
    expect(result[4]).toBe("#87CEEB");
    expect(result[5]).toBe(100);
    expect(result[6]).toBe("#FFFF00");
    expect(result[7]).toBe(500);
    expect(result[8]).toBe("#FF8C00");
  });

  it("未ソートの入力を正しくソートする", () => {
    const ranges: ElevationRange[] = [
      { id: "1", minElevation: 500, color: "#FF8C00" },
      { id: "2", minElevation: 0, color: "#87CEEB" },
      { id: "3", minElevation: 100, color: "#FFFF00" },
    ];
    const result = buildColorInterpolation(ranges);

    // ソート後: 0, 100, 500
    expect(result[3]).toBe(0);
    expect(result[5]).toBe(100);
    expect(result[7]).toBe(500);
  });

  it("同一標高の重複は後勝ちで排除する", () => {
    const ranges: ElevationRange[] = [
      { id: "1", minElevation: 0, color: "#000000" },
      { id: "2", minElevation: 100, color: "#FF0000" },
      { id: "3", minElevation: 100, color: "#00FF00" },
    ];
    const result = buildColorInterpolation(ranges);

    // interpolate, [linear], [elevation] + 2 stops (0 と 100)
    expect(result.length).toBe(3 + 4); // header(3) + 2 stops * 2
    expect(result[5]).toBe(100);
    expect(result[6]).toBe("#00FF00"); // 後勝ち
  });

  it("1つのrangeでも動作する", () => {
    const ranges: ElevationRange[] = [
      { id: "1", minElevation: 0, color: "#87CEEB" },
    ];
    const result = buildColorInterpolation(ranges);

    expect(result[0]).toBe("interpolate");
    expect(result.length).toBe(5); // header(3) + 1 stop * 2
  });
});
