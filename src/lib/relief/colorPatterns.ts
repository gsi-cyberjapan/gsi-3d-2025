export interface ElevationRange {
  id: string;
  minElevation: number;
  color: string;
}

export interface ColorPattern {
  id: string;
  title: string;
  ranges: Omit<ElevationRange, "id">[];
}

// Default color pattern - standard elevation visualization
const DEFAULT_RANGES: Omit<ElevationRange, "id">[] = [
  { minElevation: 1500, color: "#8B4513" }, // Brown - high mountains
  { minElevation: 500, color: "#FF8C00" }, // Orange - mountains
  { minElevation: 100, color: "#FFFF00" }, // Yellow - hills
  { minElevation: 50, color: "#90EE90" }, // Light green - low hills
  { minElevation: 10, color: "#98FB98" }, // Pale green - plains
  { minElevation: 5, color: "#ADD8E6" }, // Light blue - low areas
  { minElevation: 0, color: "#87CEEB" }, // Sky blue - near sea level
];

// Topographic map style colors
const TOPOGRAPHIC_RANGES: Omit<ElevationRange, "id">[] = [
  { minElevation: 2000, color: "#FFFFFF" }, // White - alpine
  { minElevation: 1500, color: "#D4B896" }, // Tan - high mountains
  { minElevation: 1000, color: "#C9A87C" }, // Light brown
  { minElevation: 500, color: "#A8C686" }, // Olive green
  { minElevation: 200, color: "#8DC784" }, // Medium green
  { minElevation: 50, color: "#72C472" }, // Green
  { minElevation: 0, color: "#AEDCC0" }, // Light green - lowlands
];

// High contrast for elevation analysis
const ELEVATION_RANGES: Omit<ElevationRange, "id">[] = [
  { minElevation: 2000, color: "#FF0000" }, // Red - very high
  { minElevation: 1000, color: "#FF7F00" }, // Orange - high
  { minElevation: 500, color: "#FFFF00" }, // Yellow - medium high
  { minElevation: 200, color: "#00FF00" }, // Green - medium
  { minElevation: 50, color: "#00FFFF" }, // Cyan - low
  { minElevation: 10, color: "#0000FF" }, // Blue - very low
  { minElevation: 0, color: "#7F00FF" }, // Purple - near sea level
];

// Earth tones for land areas
const LAND_RANGES: Omit<ElevationRange, "id">[] = [
  { minElevation: 3000, color: "#8B7355" }, // Dark tan - alpine
  { minElevation: 2000, color: "#A0826D" }, // Medium tan
  { minElevation: 1000, color: "#B8997A" }, // Light tan
  { minElevation: 500, color: "#C9B896" }, // Beige
  { minElevation: 200, color: "#9BB88D" }, // Sage green
  { minElevation: 50, color: "#7CAC7C" }, // Forest green
  { minElevation: 0, color: "#8FC58F" }, // Light green
];

export const COLOR_PATTERNS: ColorPattern[] = [
  {
    id: "default",
    title: "デフォルト",
    ranges: DEFAULT_RANGES,
  },
  {
    id: "topographic",
    title: "地形図風",
    ranges: TOPOGRAPHIC_RANGES,
  },
  {
    id: "elevation",
    title: "標高強調",
    ranges: ELEVATION_RANGES,
  },
  {
    id: "land",
    title: "陸域",
    ranges: LAND_RANGES,
  },
];

export const DEFAULT_PATTERN_ID = "default";

export const getPatternById = (id: string): ColorPattern | undefined => {
  return COLOR_PATTERNS.find((pattern) => pattern.id === id);
};

export const getDefaultRanges = (): ElevationRange[] => {
  return DEFAULT_RANGES.map((range, index) => ({
    ...range,
    id: `range-${String(index)}`,
  }));
};

let rangeIdCounter = 100;
export const generateRangeId = (): string => {
  rangeIdCounter += 1;
  return `range-${String(rangeIdCounter)}`;
};
