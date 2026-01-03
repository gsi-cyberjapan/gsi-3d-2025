import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";

export interface DrawState {
  /** 作図ウィンドウが表示中かどうか */
  isDrawWindowOpen: boolean;
  setIsDrawWindowOpen: (value: boolean) => void;
}

export const createDrawSlice: StateCreator<GlobalState, [], [], DrawState> = (
  set,
) => ({
  isDrawWindowOpen: false,
  setIsDrawWindowOpen: (value) => {
    set(() => {
      return {
        isDrawWindowOpen: value,
      };
    });
  },
});
