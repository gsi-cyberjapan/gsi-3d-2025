import length from "@turf/length";
import { lineString } from "@turf/helpers";

/**
 * Calculate the length of a line from coordinates
 * @param coordinates Array of [lng, lat] coordinates
 * @returns Length in meters
 */
export const calculateDistance = (coordinates: number[][]): number => {
  if (coordinates.length < 2) {
    return 0;
  }

  const line = lineString(coordinates);
  const distanceKm = length(line, { units: "kilometers" });
  return distanceKm * 1000; // Convert to meters
};
