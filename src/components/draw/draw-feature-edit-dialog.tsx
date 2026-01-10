"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStore } from "@/hooks/store/useStore";
import { Button } from "../ui/button";
import { DrawFeatureEditForm } from "./draw-feature-edit-form";

export const DrawFeatureEditDigalog = () => {
  const editingFeature = useStore((state) => state.editingFeature);
  const setEditingFeature = useStore((state) => state.setEditingFeature);

  const handleOnOpenChange = (value: boolean) => {
    if (!value) setEditingFeature(undefined);
  };

  return (
    <Dialog
      open={editingFeature !== undefined}
      onOpenChange={handleOnOpenChange}
    >
      <DialogContent className="w-80 p-3">
        <DialogHeader>
          <DialogTitle>作図の編集</DialogTitle>
        </DialogHeader>
        {editingFeature && <DrawFeatureEditForm feature={editingFeature} />}
        <DialogFooter>
          <DialogTrigger asChild>
            <Button size="sm">閉じる</Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
