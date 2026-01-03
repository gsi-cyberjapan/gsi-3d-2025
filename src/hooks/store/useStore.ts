import { create } from "zustand";
import { createMapManagerSlice, MapManagerState } from "./mapManagerState";
import { createMapSlice, MapStateWrapper } from "./mapState";
import { createGeocodingSlice, GeocodingState } from "./geocodingState";

export type GlobalState = MapManagerState & MapStateWrapper & GeocodingState;
export const useStore = create<GlobalState>((...args) => ({
  ...createMapManagerSlice(...args),
  ...createMapSlice(...args),
  ...createGeocodingSlice(...args),
}));
