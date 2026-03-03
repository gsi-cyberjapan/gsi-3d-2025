import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";
import { MapId } from "./mapManagerState";

export type MeasureMode = "distance" | "area";

export interface MeasureResult {
  id: string;
  featureId: string | number;
  mapId: MapId;
  type: MeasureMode;
  value: number;
}

export interface MeasureState {
  /** Whether the measure window is open */
  isMeasureWindowOpen: boolean;
  setIsMeasureWindowOpen: (value: boolean) => void;
  /** Measure mode */
  measureMode: MeasureMode;
  setMeasureMode: (mode: MeasureMode) => void;
  /** Current measurement value in meters (distance) or square meters (area) */
  currentMeasurement: number | null;
  setCurrentMeasurement: (value: number | null) => void;
  /** Completed measurement results */
  measureResults: MeasureResult[];
  addMeasureResult: (result: MeasureResult) => void;
  removeMeasureResult: (id: string) => void;
  clearMeasureResults: () => void;
  hydrateMeasureState: (state: { measureResults: MeasureResult[] }) => void;
}

export const createMeasureSlice: StateCreator<
  GlobalState,
  [],
  [],
  MeasureState
> = (set) => ({
  isMeasureWindowOpen: false,
  setIsMeasureWindowOpen: (value) => {
    set(() => {
      if (value) {
        return {
          isMeasureWindowOpen: true,
          isDrawWindowOpen: false,
        };
      }
      return {
        isMeasureWindowOpen: false,
        currentMeasurement: null,
      };
    });
  },
  measureMode: "distance",
  setMeasureMode: (mode) => {
    set(() => {
      return {
        measureMode: mode,
        currentMeasurement: null,
      };
    });
  },
  currentMeasurement: null,
  setCurrentMeasurement: (value) => {
    set(() => {
      return {
        currentMeasurement: value,
      };
    });
  },
  measureResults: [],
  addMeasureResult: (result) => {
    set((state) => ({
      measureResults: [...state.measureResults, result],
    }));
  },
  removeMeasureResult: (id) => {
    set((state) => ({
      measureResults: state.measureResults.filter((r) => r.id !== id),
    }));
  },
  clearMeasureResults: () => {
    set(() => ({ measureResults: [] }));
  },
  hydrateMeasureState: (hydrated) => {
    set(() => ({ measureResults: hydrated.measureResults }));
  },
});
