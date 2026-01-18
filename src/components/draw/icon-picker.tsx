"use client";

import { MARKER_ICON_CONFIG } from "@/lib/config";
import { getMarkerIconUrl } from "@/lib/draw/getPointModeStyle";
import { useStore } from "@/hooks/store/useStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value?: string;
  onChange?: (symbol: string) => void;
}

export const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const selectedMarkerSymbol = useStore((state) => state.selectedMarkerSymbol);
  const setSelectedMarkerSymbol = useStore(
    (state) => state.setSelectedMarkerSymbol,
  );

  const currentValue = value ?? selectedMarkerSymbol;
  const handleChange = onChange ?? setSelectedMarkerSymbol;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">アイコン</div>
      <Tabs
        defaultValue={MARKER_ICON_CONFIG.CATEGORIES[0].name}
        className="w-full"
      >
        <TabsList className="w-full flex-wrap h-auto">
          {MARKER_ICON_CONFIG.CATEGORIES.map((category) => (
            <TabsTrigger
              key={category.name}
              value={category.name}
              className="text-xs px-2 py-1"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {MARKER_ICON_CONFIG.CATEGORIES.map((category) => (
          <TabsContent key={category.name} value={category.name}>
            <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto p-1">
              {category.icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={cn(
                    "w-7 h-7 flex items-center justify-center rounded border hover:bg-accent",
                    currentValue === icon
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                      : "border-transparent",
                  )}
                  onClick={() => {
                    handleChange(icon);
                  }}
                  title={icon}
                >
                  <img
                    src={getMarkerIconUrl(icon)}
                    alt={icon}
                    width={20}
                    height={20}
                  />
                </button>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
