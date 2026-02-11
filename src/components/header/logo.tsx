"use client";

import { cn } from "@/lib/utils";
import { GENERAL_CONFIG } from "@/lib/config";

const COOKIE_NAME = "gsi3d";

const resetAndReload = () => {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
  window.location.href = window.location.pathname;
};

export const Logo = ({ className }: { className?: string }) => {
  return (
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
  );
};
