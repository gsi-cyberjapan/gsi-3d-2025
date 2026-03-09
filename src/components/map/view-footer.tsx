"use client";

import { useStore } from "@/hooks/store/useStore";
import { CenterInfo, InfoMode } from "@/components/map/center-info";
import { ChevronDown, ChevronUp, Locate, Pointer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ViewFooter = () => {
  const activeMapIds = useStore((state) => state.activeMapIds);
  const layoutMode = useStore((state) => state.layoutMode);
  const footerDisplayMode = useStore((state) => state.footerDisplayMode);
  const setFooterDisplayMode = useStore((state) => state.setFooterDisplayMode);

  const [addressViewMode, setAddressViewMode] = useState("kanji");
  const [infoMode, setInfoMode] = useState<InfoMode>("center");
  const handleInfoModeChange = useCallback((value: string) => {
    if (value === "center" || value === "click") {
      setInfoMode(value);
    }
  }, []);

  const isOpen = footerDisplayMode === "full";
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const selector =
      ".maplibregl-ctrl-bottom-left, .maplibregl-ctrl-bottom-right";
    let currentPx = "0px";

    const applyBottom = (px: string) => {
      document.querySelectorAll<HTMLElement>(selector).forEach((ctrl) => {
        ctrl.style.bottom = px;
      });
    };

    const resizeObserver = new ResizeObserver(([entry]) => {
      const height = entry.contentRect.height;
      currentPx = `${String(height)}px`;
      document.documentElement.style.setProperty("--footer-height", currentPx);
      applyBottom(currentPx);
    });
    resizeObserver.observe(el);

    // MapLibreコントロールが後からDOMに追加される場合に対応
    const mutationObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches(selector) || node.querySelector(selector)) {
            applyBottom(currentPx);
            return;
          }
        }
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      document.documentElement.style.removeProperty("--footer-height");
      applyBottom("");
    };
  }, []);

  const handleToggle = () => {
    setFooterDisplayMode(isOpen ? "closed" : "full");
  };

  if (activeMapIds.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className="absolute bottom-0 left-0 right-0 z-10 bg-background"
    >
      <div
        className="absolute left-2 z-10 flex gap-1"
        style={{ bottom: "calc(100% + 42px)" }}
      >
        <Tabs value={addressViewMode} onValueChange={setAddressViewMode}>
          <TabsList className="h-6 rounded-sm">
            <TabsTrigger
              className="text-xs size-5 rounded-sm dark:data-[state=active]:bg-blue-600 dark:hover:text-foreground"
              value="kanji"
            >
              漢
            </TabsTrigger>
            <TabsTrigger
              className="text-xs size-5 rounded-sm dark:data-[state=active]:bg-blue-600 dark:hover:text-foreground"
              value="kana"
            >
              あ
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs value={infoMode} onValueChange={handleInfoModeChange}>
          <TabsList className="h-6 rounded-sm">
            <TabsTrigger
              className="text-xs px-2 size-5 rounded-sm dark:data-[state=active]:bg-blue-600 dark:hover:text-foreground"
              value="center"
            >
              <Locate />
            </TabsTrigger>
            <TabsTrigger
              className="text-xs px-2 size-5 rounded-sm dark:data-[state=active]:bg-blue-600 dark:hover:text-foreground"
              value="click"
            >
              <Pointer />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <button
        type="button"
        onClick={handleToggle}
        className="absolute -top-7 left-1/2 -translate-x-1/2 z-10 bg-background border border-b-0 rounded-t px-3 py-1 hover:bg-input transition-colors text-muted-foreground"
        aria-label="フッターの表示を切り替え"
        aria-expanded={isOpen}
        aria-controls="view-footer-panel"
      >
        {isOpen ? (
          <ChevronDown className="size-5" />
        ) : (
          <ChevronUp className="size-5" />
        )}
      </button>
      <div
        id="view-footer-panel"
        className={cn(
          "border-t overflow-hidden grid transition-[grid-template-rows] duration-300",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr] border-t-0",
        )}
      >
        <div className="flex gap-1 py-1 px-1 overflow-hidden">
          <div className="flex flex-1 gap-1">
            {(() => {
              if (layoutMode === "split") {
                return activeMapIds.map((id) => (
                  <div key={id} className="w-full">
                    <CenterInfo
                      mapId={id}
                      addressViewMode={addressViewMode}
                      infoMode={infoMode}
                    />
                  </div>
                ));
              }
              return (
                <CenterInfo
                  mapId={activeMapIds[0]}
                  addressViewMode={addressViewMode}
                  infoMode={infoMode}
                />
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
