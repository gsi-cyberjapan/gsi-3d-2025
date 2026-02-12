import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";

export interface SaveImageState {
  /** Whether the save image dialog is open */
  isSaveImageDialogOpen: boolean;
  setIsSaveImageDialogOpen: (value: boolean) => void;
}

export const createSaveImageSlice: StateCreator<
  GlobalState,
  [],
  [],
  SaveImageState
> = (set) => ({
  isSaveImageDialogOpen: false,
  setIsSaveImageDialogOpen: (value) => {
    set(() => ({
      isSaveImageDialogOpen: value,
    }));
  },
});
