import type { ElevationRange } from "./colorPatterns";
import type { ExpressionSpecification } from "maplibre-gl";

/**
 * Build a MapLibre GL color interpolation expression for color-relief layer
 * Uses linear interpolation (gradient) for smooth elevation coloring
 * @param ranges - Array of elevation ranges
 * @returns MapLibre GL expression for color-relief-color paint property
 */
export const buildColorInterpolation = (
  ranges: ElevationRange[],
): ExpressionSpecification => {
  // Sort ranges by elevation ascending
  const sortedRanges = [...ranges].sort(
    (a, b) => a.minElevation - b.minElevation,
  );

  // Deduplicate by elevation - keep the last color for each elevation value
  // This prevents the "input values must be in strictly ascending order" error
  const deduped = sortedRanges.reduce<ElevationRange[]>((acc, range) => {
    const existingIndex = acc.findIndex(
      (r) => r.minElevation === range.minElevation,
    );
    if (existingIndex >= 0) {
      acc[existingIndex] = range;
    } else {
      acc.push(range);
    }
    return acc;
  }, []);

  // Linear interpolation - gradient between elevation stops
  const stops: (number | string)[] = [];
  for (const range of deduped) {
    stops.push(range.minElevation, range.color);
  }

  return ["interpolate", ["linear"], ["elevation"], ...stops];
};

/** Epsilon for simulating discrete color steps via interpolation */
const STEP_EPSILON = 0.01;

/**
 * Build a MapLibre GL interpolation expression that simulates discrete color steps
 * MapLibre's color-relief-color only supports interpolate expressions, so we
 * simulate step behavior by placing two stops very close together at each boundary.
 * @param ranges - Array of elevation ranges
 * @returns MapLibre GL expression for color-relief-color paint property
 */
export const buildColorStep = (
  ranges: ElevationRange[],
): ExpressionSpecification => {
  // Sort ranges by elevation ascending
  const sortedRanges = [...ranges].sort(
    (a, b) => a.minElevation - b.minElevation,
  );

  // Deduplicate by elevation - keep the last color for each elevation value
  const deduped = sortedRanges.reduce<ElevationRange[]>((acc, range) => {
    const existingIndex = acc.findIndex(
      (r) => r.minElevation === range.minElevation,
    );
    if (existingIndex >= 0) {
      acc[existingIndex] = range;
    } else {
      acc.push(range);
    }
    return acc;
  }, []);

  // Simulate step using interpolate with very close stops
  // For each boundary after the first, insert a stop just before it with the previous color
  const stops: (number | string)[] = [];
  for (let i = 0; i < deduped.length; i++) {
    if (i > 0) {
      const transitionElevation = deduped[i].minElevation - STEP_EPSILON;
      if (transitionElevation > deduped[i - 1].minElevation) {
        stops.push(transitionElevation, deduped[i - 1].color);
      }
    }
    stops.push(deduped[i].minElevation, deduped[i].color);
  }

  return ["interpolate", ["linear"], ["elevation"], ...stops];
};
