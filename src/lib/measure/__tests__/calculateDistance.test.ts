import { describe, expect, it } from "vitest";
import { calculateDistance } from "../calculateDistance";

describe("calculateDistance", () => {
  it("2点間の距離を計算する", () => {
    // 東京駅(139.7671, 35.6812) → 新宿駅(139.7003, 35.6896)
    const distance = calculateDistance([
      [139.7671, 35.6812],
      [139.7003, 35.6896],
    ]);
    // 約6.4km
    expect(distance).toBeGreaterThan(5000);
    expect(distance).toBeLessThan(8000);
  });

  it("空配列は0を返す", () => {
    expect(calculateDistance([])).toBe(0);
  });

  it("1点のみは0を返す", () => {
    expect(calculateDistance([[139.7671, 35.6812]])).toBe(0);
  });

  it("3点以上のライン距離を計算する", () => {
    const distance = calculateDistance([
      [139.7671, 35.6812],
      [139.7003, 35.6896],
      [139.7454, 35.6586],
    ]);
    expect(distance).toBeGreaterThan(0);
    // 2区間の合計なので最初の2点間より大きい
    const twoPointDistance = calculateDistance([
      [139.7671, 35.6812],
      [139.7003, 35.6896],
    ]);
    expect(distance).toBeGreaterThan(twoPointDistance);
  });

  it("同一地点は距離0を返す", () => {
    const distance = calculateDistance([
      [139.7671, 35.6812],
      [139.7671, 35.6812],
    ]);
    expect(distance).toBe(0);
  });
});
