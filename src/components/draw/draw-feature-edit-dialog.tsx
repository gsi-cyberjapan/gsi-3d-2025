"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/hooks/store/useStore";

export const DrawFeatureEditDigalog = () => {
  const editingFeatureId = useStore((state) => state.editingFeatureId);
  const setEditingFeatureId = useStore((state) => state.setEditingFeatureId);

  const handleOnOpenChange = (value: boolean) => {
    if (!value) setEditingFeatureId(undefined);
  };

  return (
    <Dialog
      open={editingFeatureId !== undefined}
      onOpenChange={handleOnOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>編集</DialogTitle>
          <DialogDescription>WIP</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
