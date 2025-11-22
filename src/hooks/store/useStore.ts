import { create } from "zustand";
import { createMapManagerSlice, MapManagerState } from "./mapManagerState";
import { createMapSlice, MapStateWrapper } from "./mapState";

export type GlobalState = MapManagerState & MapStateWrapper;
export const useStore = create<GlobalState>((...args) => ({
  ...createMapManagerSlice(...args),
  ...createMapSlice(...args),
}));
