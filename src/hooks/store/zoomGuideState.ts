import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";

const STORAGE_KEY = "gsi-3d-2025-zoom-guide-dismissed";

const getInitialDismissedState = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "true";
  } catch {
    return false;
  }
};

export interface ZoomGuideState {
  /** Whether the zoom guide has been dismissed by the user */
  isZoomGuideDismissed: boolean;
  /** Set whether the zoom guide should be dismissed */
  setZoomGuideDismissed: (value: boolean) => void;
}

export const createZoomGuideSlice: StateCreator<
  GlobalState,
  [],
  [],
  ZoomGuideState
> = (set) => ({
  isZoomGuideDismissed: getInitialDismissedState(),
  setZoomGuideDismissed: (value) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, String(value));
      } catch {
        // Ignore localStorage errors
      }
    }
    set(() => ({
      isZoomGuideDismissed: value,
    }));
  },
});
