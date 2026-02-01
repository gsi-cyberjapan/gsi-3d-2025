import { create } from "zustand";
import { createMapManagerSlice, MapManagerState } from "./mapManagerState";
import { createMapSlice, MapStateWrapper } from "./mapState";
import { createDrawSlice, DrawState } from "./drawState";
import { createGeocodingSlice, GeocodingState } from "./geocodingState";
import { createMeasureSlice, MeasureState } from "./measureState";
import { createZoomGuideSlice, ZoomGuideState } from "./zoomGuideState";

export type GlobalState = MapManagerState &
  MapStateWrapper &
  DrawState &
  GeocodingState &
  MeasureState &
  ZoomGuideState;
export const useStore = create<GlobalState>((...args) => ({
  ...createMapManagerSlice(...args),
  ...createMapSlice(...args),
  ...createDrawSlice(...args),
  ...createGeocodingSlice(...args),
  ...createMeasureSlice(...args),
  ...createZoomGuideSlice(...args),
}));
