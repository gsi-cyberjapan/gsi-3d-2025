"use client";

import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FeatureInfoPopoverProps {
  title: string;
  description: string;
  links?: Array<{
    label: string;
    url: string;
  }>;
}

export const FeatureInfoPopover = ({
  title,
  description,
  links,
}: FeatureInfoPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="cursor-pointer text-muted-foreground border rounded-sm p-0.5 hover:bg-input"
          aria-label={`${title}の情報を表示`}
        >
          <Info className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-3 w-72 max-h-80 overflow-y-auto">
        <div className="flex flex-col gap-2 text-xs">
          <div className="font-semibold text-sm">{title}</div>
          <div className="text-muted-foreground">{description}</div>
          {links && links.length > 0 && (
            <div className="flex flex-col gap-1 mt-2">
              {links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-xs hover:text-blue-800"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
