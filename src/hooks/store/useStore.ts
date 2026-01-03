import { create } from "zustand";
import { createMapManagerSlice, MapManagerState } from "./mapManagerState";
import { createMapSlice, MapStateWrapper } from "./mapState";
import { createDrawSlice, DrawState } from "./drawState";

export type GlobalState = MapManagerState & MapStateWrapper & DrawState;
export const useStore = create<GlobalState>((...args) => ({
  ...createMapManagerSlice(...args),
  ...createMapSlice(...args),
  ...createDrawSlice(...args),
}));
