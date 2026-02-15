import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";

export interface PrintState {
  /** Whether the print dialog is open */
  isPrintDialogOpen: boolean;
  setIsPrintDialogOpen: (value: boolean) => void;
}

export const createPrintSlice: StateCreator<GlobalState, [], [], PrintState> = (
  set,
) => ({
  isPrintDialogOpen: false,
  setIsPrintDialogOpen: (value) => {
    set(() => ({
      isPrintDialogOpen: value,
    }));
  },
});
