import { create } from "zustand";
import { createMapCardSlice, MapCardSlice } from "./createMapCardSlice";

export const useAppGlobalStore = create<MapCardSlice>((...a) => ({
  ...createMapCardSlice(...a),
}));
