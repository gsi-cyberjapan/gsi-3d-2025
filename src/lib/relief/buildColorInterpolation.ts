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
