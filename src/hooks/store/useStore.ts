import { create } from "zustand";
import { createMapManagerSlice, MapManagerState } from "./mapManagerState";
import { createMapSlice, MapStateWrapper } from "./mapState";
import { createDrawSlice, DrawState } from "./drawState";
import { createGeocodingSlice, GeocodingState } from "./geocodingState";

export type GlobalState = MapManagerState &
  MapStateWrapper &
  DrawState &
  GeocodingState;
export const useStore = create<GlobalState>((...args) => ({
  ...createMapManagerSlice(...args),
  ...createMapSlice(...args),
  ...createDrawSlice(...args),
  ...createGeocodingSlice(...args),
}));
