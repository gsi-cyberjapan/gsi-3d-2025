/**
 * Format distance measurement
 * @param meters Distance in meters
 * @returns Formatted string
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${String(Math.round(meters))} m`;
  }
  return `${(meters / 1000).toFixed(3)} km`;
};

/**
 * Format area measurement
 * @param squareMeters Area in square meters
 * @returns Formatted string
 */
export const formatArea = (squareMeters: number): string => {
  if (squareMeters < 1000000) {
    return `${String(Math.round(squareMeters))} m\u00B2`;
  }
  return `${(squareMeters / 1000000).toFixed(3)} km\u00B2`;
};
