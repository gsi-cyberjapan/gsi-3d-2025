import { create } from "zustand";
import { createMapManagerSlice, MapManagerState } from "./mapManagerState";

export const useStore = create<MapManagerState>((...args) => ({
  ...createMapManagerSlice(...args),
}));
