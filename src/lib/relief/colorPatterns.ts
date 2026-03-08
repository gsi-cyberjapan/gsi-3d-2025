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

// Default color pattern (GSI Maps standard)
const DEFAULT_RANGES: Omit<ElevationRange, "id">[] = [
  { minElevation: 1500, color: "#FF4400" },
  { minElevation: 500, color: "#FF8C00" },
  { minElevation: 100, color: "#FFFF00" },
  { minElevation: 50, color: "#91FF00" },
  { minElevation: 10, color: "#00EEFF" },
  { minElevation: 5, color: "#0095FF" },
  { minElevation: 0, color: "#0000FF" },
];

// Grayscale: black to white
const GRAYSCALE_RANGES: Omit<ElevationRange, "id">[] = [
  { minElevation: 1500, color: "#FFFFFF" },
  { minElevation: 500, color: "#E0E0E0" },
  { minElevation: 100, color: "#C1C1C1" },
  { minElevation: 50, color: "#A3A3A3" },
  { minElevation: 10, color: "#848484" },
  { minElevation: 5, color: "#656565" },
  { minElevation: 0, color: "#464646" },
];

// Blue to white
const BLUE_RANGES: Omit<ElevationRange, "id">[] = [
  { minElevation: 1500, color: "#FFFFFF" },
  { minElevation: 500, color: "#D5D5FF" },
  { minElevation: 100, color: "#AAAAFF" },
  { minElevation: 50, color: "#8080FF" },
  { minElevation: 10, color: "#5555FF" },
  { minElevation: 5, color: "#2B2BFF" },
  { minElevation: 0, color: "#0000FF" },
];

// Red to white
const RED_RANGES: Omit<ElevationRange, "id">[] = [
  { minElevation: 1500, color: "#FFFFFF" },
  { minElevation: 500, color: "#FFD5D5" },
  { minElevation: 100, color: "#FFAAAA" },
  { minElevation: 50, color: "#FF8080" },
  { minElevation: 10, color: "#FF5555" },
  { minElevation: 5, color: "#FF2B2B" },
  { minElevation: 0, color: "#FF0000" },
];

export const COLOR_PATTERNS: ColorPattern[] = [
  {
    id: "default",
    title: "デフォルト",
    ranges: DEFAULT_RANGES,
  },
  {
    id: "grayscale",
    title: "黒→白",
    ranges: GRAYSCALE_RANGES,
  },
  {
    id: "blue",
    title: "青→白",
    ranges: BLUE_RANGES,
  },
  {
    id: "red",
    title: "赤→白",
    ranges: RED_RANGES,
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
