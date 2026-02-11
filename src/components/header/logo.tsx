"use client";

import { cn } from "@/lib/utils";
import { GENERAL_CONFIG } from "@/lib/config";
import { useStore } from "@/hooks/store/useStore";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export const Logo = ({ className }: { className?: string }) => {
  const resetAllState = useStore((state) => state.resetAllState);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className={cn(
            "text-lg font-semibold cursor-pointer hover:opacity-70 transition-opacity",
            className,
          )}
          onClick={resetAllState}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              resetAllState();
            }
          }}
        >
          {GENERAL_CONFIG.TITLE}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">初期表示に戻ります</TooltipContent>
    </Tooltip>
  );
};
