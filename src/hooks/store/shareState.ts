import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";

export interface ShareState {
  /** Whether the share dialog is open */
  isShareDialogOpen: boolean;
  setIsShareDialogOpen: (value: boolean) => void;
}

export const createShareSlice: StateCreator<GlobalState, [], [], ShareState> = (
  set,
) => ({
  isShareDialogOpen: false,
  setIsShareDialogOpen: (value) => {
    set(() => ({
      isShareDialogOpen: value,
    }));
  },
});
