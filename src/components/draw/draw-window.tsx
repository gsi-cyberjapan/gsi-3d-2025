"use client";

import { useStore } from "@/hooks/store/useStore";
import { Window } from "../ui/window";

export const DrawWindow = () => {
  const isDrawWindowOpen = useStore((state) => state.isDrawWindowOpen);
  const setIsDrawWindowOpen = useStore((state) => state.setIsDrawWindowOpen);

  return (
    <Window
      title="テスト"
      isOpen={isDrawWindowOpen}
      onClose={() => {
        setIsDrawWindowOpen(false);
      }}
    >
      <div>
        <p>これはテストウィンドウです</p>
      </div>
    </Window>
  );
};
