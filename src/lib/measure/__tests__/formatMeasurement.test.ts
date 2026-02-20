import { describe, expect, it } from "vitest";
import { formatArea, formatDistance } from "../formatMeasurement";

describe("formatDistance", () => {
  it("500m を表示する", () => {
    expect(formatDistance(500)).toBe("500.0 m");
  });

  it("0m を表示する", () => {
    expect(formatDistance(0)).toBe("0.0 m");
  });

  it("999.9m を表示する", () => {
    expect(formatDistance(999.9)).toBe("999.9 m");
  });

  it("1000m を km で表示する", () => {
    expect(formatDistance(1000)).toBe("1.00 km");
  });

  it("1500m を km で表示する", () => {
    expect(formatDistance(1500)).toBe("1.50 km");
  });

  it("10000m を km で表示する", () => {
    expect(formatDistance(10000)).toBe("10.00 km");
  });
});

describe("formatArea", () => {
  it("5000m² を表示する", () => {
    expect(formatArea(5000)).toBe("5000.0 m\u00B2");
  });

  it("0m² を表示する", () => {
    expect(formatArea(0)).toBe("0.0 m\u00B2");
  });

  it("9999m² を表示する", () => {
    expect(formatArea(9999)).toBe("9999.0 m\u00B2");
  });

  it("10000m² を ha で表示する", () => {
    expect(formatArea(10000)).toBe("1.00 ha");
  });

  it("50000m² を ha で表示する", () => {
    expect(formatArea(50000)).toBe("5.00 ha");
  });

  it("999999m² を ha で表示する", () => {
    expect(formatArea(999999)).toBe("100.00 ha");
  });

  it("1000000m² を km² で表示する", () => {
    expect(formatArea(1000000)).toBe("1.00 km\u00B2");
  });

  it("2000000m² を km² で表示する", () => {
    expect(formatArea(2000000)).toBe("2.00 km\u00B2");
  });
});
