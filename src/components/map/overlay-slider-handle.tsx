"use client";

import { useStore } from "@/hooks/store/useStore";
import { useCallback, useRef } from "react";
import { GripVertical } from "lucide-react";

export const OverlaySliderHandle = () => {
  const overlaySliderPosition = useStore(
    (state) => state.overlaySliderPosition,
  );
  const setOverlaySliderPosition = useStore(
    (state) => state.setOverlaySliderPosition,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);

      const parent = containerRef.current?.parentElement;
      if (!parent) return;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const rect = parent.getBoundingClientRect();
        const x = moveEvent.clientX - rect.left;
        const ratio = Math.max(0.05, Math.min(0.95, x / rect.width));
        setOverlaySliderPosition(ratio);
      };

      const handlePointerUp = () => {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      };

      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    },
    [setOverlaySliderPosition],
  );

  const leftPercent = `${String(overlaySliderPosition * 100)}%`;

  return (
    <div
      ref={containerRef}
      className="absolute inset-y-0 z-10"
      style={{ left: leftPercent, transform: "translateX(-50%)" }}
    >
      <div
        className="h-full w-1 bg-white/80 shadow-md cursor-col-resize flex items-center justify-center"
        onPointerDown={handlePointerDown}
        style={{ touchAction: "none" }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg p-1 cursor-col-resize">
          <GripVertical className="size-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};
