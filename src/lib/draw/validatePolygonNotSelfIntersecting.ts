import { polygon as turfPolygon, lineString } from "@turf/helpers";
import kinks from "@turf/kinks";
import type { LineString, Polygon } from "geojson";
import type { GeoJSONStoreFeatures } from "terra-draw";

const COORDINATE_PRECISION = 6;
const PRECISION_MULTIPLIER = 10 ** COORDINATE_PRECISION;

/**
 * Round coordinates to a fixed precision to avoid floating point errors
 * that can cause false positive self-intersection detection
 */
const roundCoordinates = (coords: [number, number][]): [number, number][] => {
  return coords.map(([x, y]) => [
    Math.round(x * PRECISION_MULTIPLIER) / PRECISION_MULTIPLIER,
    Math.round(y * PRECISION_MULTIPLIER) / PRECISION_MULTIPLIER,
  ]);
};

/**
 * Custom validation function that checks for self-intersecting polygons
 * with tolerance for floating point precision errors
 */
export const validatePolygonNotSelfIntersecting = (
  feature: GeoJSONStoreFeatures,
): { valid: true } | { valid: false; reason: string } => {
  const geometry = feature.geometry as Polygon | LineString;

  if (geometry.type === "Polygon") {
    const roundedCoords = geometry.coordinates.map((ring) =>
      roundCoordinates(ring as [number, number][]),
    );
    const roundedPolygon = turfPolygon(roundedCoords);
    const kinksResult = kinks(roundedPolygon);

    if (kinksResult.features.length > 0) {
      return { valid: false, reason: "Feature intersects itself" };
    }
  } else {
    // LineString
    const roundedCoords = roundCoordinates(
      geometry.coordinates as [number, number][],
    );
    const roundedLine = lineString(roundedCoords);
    const kinksResult = kinks(roundedLine);

    if (kinksResult.features.length > 0) {
      return { valid: false, reason: "Feature intersects itself" };
    }
  }

  return { valid: true };
};
