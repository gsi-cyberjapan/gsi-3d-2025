import { describe, expect, it } from "vitest";
import { formatArea, formatDistance } from "@/lib/measure/formatMeasurement";

describe("formatDistance", () => {
  it("500m を整数表示する", () => {
    expect(formatDistance(500)).toBe("500 m");
  });

  it("0m を表示する", () => {
    expect(formatDistance(0)).toBe("0 m");
  });

  it("999.9m を整数に丸めて表示する", () => {
    expect(formatDistance(999.9)).toBe("1000 m");
  });

  it("999.4m を整数に丸めて表示する", () => {
    expect(formatDistance(999.4)).toBe("999 m");
  });

  it("1000m を km で表示する", () => {
    expect(formatDistance(1000)).toBe("1.000 km");
  });

  it("1500m を km で表示する", () => {
    expect(formatDistance(1500)).toBe("1.500 km");
  });

  it("10000m を km で表示する", () => {
    expect(formatDistance(10000)).toBe("10.000 km");
  });

  it("1234.5m を km で小数3桁表示する", () => {
    expect(formatDistance(1234.5)).toBe("1.234 km");
  });
});

describe("formatArea", () => {
  it("5000m² を整数表示する", () => {
    expect(formatArea(5000)).toBe("5000 m\u00B2");
  });

  it("0m² を表示する", () => {
    expect(formatArea(0)).toBe("0 m\u00B2");
  });

  it("9999m² を整数表示する", () => {
    expect(formatArea(9999)).toBe("9999 m\u00B2");
  });

  it("50000m² を m² で整数表示する", () => {
    expect(formatArea(50000)).toBe("50000 m\u00B2");
  });

  it("999999m² を m² で整数表示する", () => {
    expect(formatArea(999999)).toBe("999999 m\u00B2");
  });

  it("1000000m² を km² で表示する", () => {
    expect(formatArea(1000000)).toBe("1.000 km\u00B2");
  });

  it("2000000m² を km² で表示する", () => {
    expect(formatArea(2000000)).toBe("2.000 km\u00B2");
  });

  it("1500000m² を km² で小数3桁表示する", () => {
    expect(formatArea(1500000)).toBe("1.500 km\u00B2");
  });
});
