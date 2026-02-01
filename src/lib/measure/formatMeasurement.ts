/**
 * Format distance measurement
 * @param meters Distance in meters
 * @returns Formatted string
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${meters.toFixed(1)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
};

/**
 * Format area measurement
 * @param squareMeters Area in square meters
 * @returns Formatted string
 */
export const formatArea = (squareMeters: number): string => {
  if (squareMeters < 10000) {
    return `${squareMeters.toFixed(1)} m\u00B2`;
  }
  if (squareMeters < 1000000) {
    return `${(squareMeters / 10000).toFixed(2)} ha`;
  }
  return `${(squareMeters / 1000000).toFixed(2)} km\u00B2`;
};
