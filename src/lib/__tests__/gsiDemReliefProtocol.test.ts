import { describe, expect, it } from "vitest";
import { convertGsiToTerrarium } from "@/lib/gsiDemReliefProtocol";

/** Helper: decode Terrarium RGB back to elevation */
const terrariumToElevation = (r: number, g: number, b: number): number =>
  r * 256 + g + b / 256 - 32768;

describe("convertGsiToTerrarium", () => {
  it("nodata (128,0,0) → (0,0,0) = elevation -32768m", () => {
    const [r, g, b] = convertGsiToTerrarium(128, 0, 0);
    expect(r).toBe(0);
    expect(g).toBe(0);
    expect(b).toBe(0);
    expect(terrariumToElevation(r, g, b)).toBe(-32768);
  });

  it("標高 0m", () => {
    // GSI: x = 0 → elevation = 0
    const [r, g, b] = convertGsiToTerrarium(0, 0, 0);
    const elevation = terrariumToElevation(r, g, b);
    expect(elevation).toBeCloseTo(0, 1);
  });

  it("標高 100m", () => {
    // GSI: x = 100 / 0.01 = 10000
    // 10000 = 0x002710 → R=0, G=39, B=16
    const [r, g, b] = convertGsiToTerrarium(0, 39, 16);
    const elevation = terrariumToElevation(r, g, b);
    expect(elevation).toBeCloseTo(100, 1);
  });

  it("標高 -10m (負の標高)", () => {
    // GSI: elevation = -10 → x = -10/0.01 + 2^24 = -1000 + 16777216 = 16776216
    // 16776216 = 0xFFF C18 → R=255, G=252, B=24
    const x = 16776216;
    const gsiR = (x >> 16) & 0xff;
    const gsiG = (x >> 8) & 0xff;
    const gsiB = x & 0xff;
    const [r, g, b] = convertGsiToTerrarium(gsiR, gsiG, gsiB);
    const elevation = terrariumToElevation(r, g, b);
    expect(elevation).toBeCloseTo(-10, 1);
  });

  it("標高 3776m (富士山)", () => {
    // GSI: x = 3776 / 0.01 = 377600
    // 377600 = 0x05C300 → R=5, G=195, B=0
    const x = 377600;
    const gsiR = (x >> 16) & 0xff;
    const gsiG = (x >> 8) & 0xff;
    const gsiB = x & 0xff;
    const [r, g, b] = convertGsiToTerrarium(gsiR, gsiG, gsiB);
    const elevation = terrariumToElevation(r, g, b);
    expect(elevation).toBeCloseTo(3776, 1);
  });

  it("標高 0.01m (最小分解能)", () => {
    // GSI: x = 0.01 / 0.01 = 1 → R=0, G=0, B=1
    const [r, g, b] = convertGsiToTerrarium(0, 0, 1);
    const elevation = terrariumToElevation(r, g, b);
    expect(elevation).toBeCloseTo(0.01, 1);
  });
});
