"use client";

import { cn } from "@/lib/utils";
import { GENERAL_CONFIG } from "@/lib/config";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const COOKIE_NAME = "gsi3d";

const resetAndReload = () => {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
  window.location.href = window.location.pathname;
};

export const Logo = ({ className }: { className?: string }) => {
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
          onClick={resetAndReload}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              resetAndReload();
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
