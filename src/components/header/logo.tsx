import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("text-lg font-semibold", className)}>地理院地図</div>
  );
};
