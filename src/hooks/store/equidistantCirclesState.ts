import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";

export interface EquidistantCirclesState {
  /** Whether the equidistant circles window is open */
  isEquidistantCirclesWindowOpen: boolean;
  setIsEquidistantCirclesWindowOpen: (value: boolean) => void;
  /** Center point of the circles */
  equidistantCirclesCenter: { lng: number; lat: number } | null;
  setEquidistantCirclesCenter: (
    center: { lng: number; lat: number } | null,
  ) => void;
  /** Circle line color */
  equidistantCirclesColor: string;
  setEquidistantCirclesColor: (color: string) => void;
  /** Circle line width */
  equidistantCirclesLineWidth: number;
  setEquidistantCirclesLineWidth: (width: number) => void;
  /** Circle line dash pattern */
  equidistantCirclesLineDash: number[];
  setEquidistantCirclesLineDash: (dash: number[]) => void;
  /** Interval between circles in meters */
  equidistantCirclesInterval: number;
  setEquidistantCirclesInterval: (interval: number) => void;
  /** Display unit */
  equidistantCirclesUnit: "m" | "km";
  setEquidistantCirclesUnit: (unit: "m" | "km") => void;
  /** Number of circles */
  equidistantCirclesCount: number;
  setEquidistantCirclesCount: (count: number) => void;
}

export const createEquidistantCirclesSlice: StateCreator<
  GlobalState,
  [],
  [],
  EquidistantCirclesState
> = (set) => ({
  isEquidistantCirclesWindowOpen: false,
  setIsEquidistantCirclesWindowOpen: (value) => {
    set(() => {
      if (value) {
        return { isEquidistantCirclesWindowOpen: true };
      }
      return {
        isEquidistantCirclesWindowOpen: false,
        equidistantCirclesCenter: null,
      };
    });
  },
  equidistantCirclesCenter: null,
  setEquidistantCirclesCenter: (center) => {
    set(() => ({ equidistantCirclesCenter: center }));
  },
  equidistantCirclesColor: "#FF0000",
  setEquidistantCirclesColor: (color) => {
    set(() => ({ equidistantCirclesColor: color }));
  },
  equidistantCirclesLineWidth: 2,
  setEquidistantCirclesLineWidth: (width) => {
    set(() => ({ equidistantCirclesLineWidth: width }));
  },
  equidistantCirclesLineDash: [],
  setEquidistantCirclesLineDash: (dash) => {
    set(() => ({ equidistantCirclesLineDash: dash }));
  },
  equidistantCirclesInterval: 1000,
  setEquidistantCirclesInterval: (interval) => {
    set(() => ({ equidistantCirclesInterval: interval }));
  },
  equidistantCirclesUnit: "km",
  setEquidistantCirclesUnit: (unit) => {
    set(() => ({ equidistantCirclesUnit: unit }));
  },
  equidistantCirclesCount: 5,
  setEquidistantCirclesCount: (count) => {
    set(() => ({ equidistantCirclesCount: count }));
  },
});
