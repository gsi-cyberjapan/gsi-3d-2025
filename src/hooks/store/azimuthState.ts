import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";

export interface AzimuthState {
  /** Whether the azimuth lines window is open */
  isAzimuthWindowOpen: boolean;
  setIsAzimuthWindowOpen: (value: boolean) => void;
  /** Center point of the azimuth lines */
  azimuthCenter: { lng: number; lat: number } | null;
  setAzimuthCenter: (center: { lng: number; lat: number } | null) => void;
  /** Line color */
  azimuthColor: string;
  setAzimuthColor: (color: string) => void;
  /** Line width */
  azimuthLineWidth: number;
  setAzimuthLineWidth: (width: number) => void;
  /** Line dash pattern */
  azimuthLineDash: number[];
  setAzimuthLineDash: (dash: number[]) => void;
  /** Distance in meters */
  azimuthDistance: number;
  setAzimuthDistance: (distance: number) => void;
  /** Display unit */
  azimuthUnit: "m" | "km";
  setAzimuthUnit: (unit: "m" | "km") => void;
  /** Interval between lines in degrees */
  azimuthInterval: number;
  setAzimuthInterval: (interval: number) => void;
}

export const createAzimuthSlice: StateCreator<
  GlobalState,
  [],
  [],
  AzimuthState
> = (set) => ({
  isAzimuthWindowOpen: false,
  setIsAzimuthWindowOpen: (value) => {
    set(() => {
      if (value) {
        return { isAzimuthWindowOpen: true };
      }
      return {
        isAzimuthWindowOpen: false,
        azimuthCenter: null,
      };
    });
  },
  azimuthCenter: null,
  setAzimuthCenter: (center) => {
    set(() => ({ azimuthCenter: center }));
  },
  azimuthColor: "#FF0000",
  setAzimuthColor: (color) => {
    set(() => ({ azimuthColor: color }));
  },
  azimuthLineWidth: 2,
  setAzimuthLineWidth: (width) => {
    set(() => ({ azimuthLineWidth: width }));
  },
  azimuthLineDash: [],
  setAzimuthLineDash: (dash) => {
    set(() => ({ azimuthLineDash: dash }));
  },
  azimuthDistance: 100000,
  setAzimuthDistance: (distance) => {
    set(() => ({ azimuthDistance: distance }));
  },
  azimuthUnit: "km",
  setAzimuthUnit: (unit) => {
    set(() => ({ azimuthUnit: unit }));
  },
  azimuthInterval: 30,
  setAzimuthInterval: (interval) => {
    set(() => ({ azimuthInterval: interval }));
  },
});
