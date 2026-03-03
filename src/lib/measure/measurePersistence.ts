import { MeasureResult } from "@/hooks/store/measureState";

const STORAGE_KEY = "gsi3d-measure-results";

export interface StoredMeasureData {
  results: MeasureResult[];
  features: Partial<Record<string, GeoJSON.Feature>>;
}

export const saveMeasureData = (
  results: MeasureResult[],
  features: Partial<Record<string, GeoJSON.Feature>>,
): void => {
  try {
    const data: StoredMeasureData = { results, features };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be full or unavailable
  }
};

export const loadMeasureData = (): StoredMeasureData | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredMeasureData;
  } catch {
    return null;
  }
};

export const clearMeasureData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage may be unavailable
  }
};
