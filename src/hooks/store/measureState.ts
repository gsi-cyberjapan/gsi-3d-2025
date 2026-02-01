import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";

export type MeasureMode = "distance" | "area";

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
});
