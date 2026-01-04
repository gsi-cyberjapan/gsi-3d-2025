"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
