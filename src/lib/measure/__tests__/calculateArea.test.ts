import { describe, expect, it } from "vitest";
import { calculateArea } from "../calculateArea";

describe("calculateArea", () => {
  it("正方形ポリゴンの面積を計算する", () => {
    // 赤道付近の約1km四方（閉じたリング）
    const area = calculateArea([
      [0, 0],
      [0.01, 0],
      [0.01, 0.01],
      [0, 0.01],
      [0, 0],
    ]);
    // 約1.2km² = 1,200,000 m² 程度
    expect(area).toBeGreaterThan(500000);
    expect(area).toBeLessThan(2000000);
  });

  it("座標が3点未満は0を返す", () => {
    expect(calculateArea([])).toBe(0);
    expect(calculateArea([[0, 0]])).toBe(0);
    expect(
      calculateArea([
        [0, 0],
        [1, 1],
      ]),
    ).toBe(0);
    expect(
      calculateArea([
        [0, 0],
        [1, 1],
        [2, 2],
      ]),
    ).toBe(0);
  });

  it("閉じていないリングを自動クローズする", () => {
    // 閉じていない4点（自動クローズで5点になるはず）
    const area = calculateArea([
      [0, 0],
      [0.01, 0],
      [0.01, 0.01],
      [0, 0.01],
    ]);
    expect(area).toBeGreaterThan(0);
  });

  it("既に閉じたリングも正しく処理する", () => {
    const closedArea = calculateArea([
      [0, 0],
      [0.01, 0],
      [0.01, 0.01],
      [0, 0.01],
      [0, 0],
    ]);
    const openArea = calculateArea([
      [0, 0],
      [0.01, 0],
      [0.01, 0.01],
      [0, 0.01],
    ]);
    // 同じ面積になるはず
    expect(closedArea).toBeCloseTo(openArea, 0);
  });
});
