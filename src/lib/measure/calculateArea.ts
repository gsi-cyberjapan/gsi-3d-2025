import area from "@turf/area";
import { polygon } from "@turf/helpers";

/**
 * Calculate the area of a polygon from coordinates
 * @param coordinates Array of [lng, lat] coordinates (should form a closed ring)
 * @returns Area in square meters
 */
export const calculateArea = (coordinates: number[][]): number => {
  if (coordinates.length < 4) {
    return 0;
  }

  // Ensure the polygon is closed
  const ring =
    coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
    coordinates[0][1] === coordinates[coordinates.length - 1][1]
      ? coordinates
      : [...coordinates, coordinates[0]];

  const poly = polygon([ring]);
  return area(poly);
};
