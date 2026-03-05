"use client";

import { useStore } from "@/hooks/store/useStore";
import { Window } from "@/components/ui/window";
import { ReliefControls } from "./relief-controls";
import { ReliefRangeList } from "./relief-range-list";
import { Separator } from "@/components/ui/separator";

export const ReliefWindow = () => {
  const isReliefWindowOpen = useStore((state) => state.isReliefWindowOpen);
  const setIsReliefWindowOpen = useStore(
    (state) => state.setIsReliefWindowOpen,
  );

  return (
    <Window
      title="自分で作る色別標高図"
      className="w-72"
      isOpen={isReliefWindowOpen}
      onClose={() => {
        setIsReliefWindowOpen(false);
      }}
    >
      <div className="grid gap-2">
        <ReliefControls />
        <Separator />
        <ReliefRangeList />
      </div>
    </Window>
  );
};
