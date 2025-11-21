import { create } from "zustand";
import { createMapCardSlice, MapCardSlice } from "./createMapCardSlice";
import { createMapSlice, MapSlice } from "./createMapSlice";

export const useGlobalStore = create<MapCardSlice & MapSlice>((...arg) => ({
  ...createMapCardSlice(...arg),
  ...createMapSlice(...arg),
}));
