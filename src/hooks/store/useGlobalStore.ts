import { create } from "zustand";
import { createMapCardSlice, MapCardSlice } from "./createMapCardSlice";

export const useGlobalStore = create<MapCardSlice>((...a) => ({
  ...createMapCardSlice(...a),
}));
