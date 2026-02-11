import { cn } from "@/lib/utils";
import { GENERAL_CONFIG } from "@/lib/config";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("text-lg font-semibold", className)}>
      {GENERAL_CONFIG.TITLE}
    </div>
  );
};
