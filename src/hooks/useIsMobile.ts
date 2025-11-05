"use client";
import { useSyncExternalStore } from "react";
import { RESPONSIVE } from "@/lib/config";

export function useIsMobile() {
  const query = `(max-width: ${(RESPONSIVE.MOBILE_BREAKPOINT_PX - 1).toString()}px)`;

  const getSnapshot = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  };

  const subscribe = (cb: () => void) => {
    if (typeof window === "undefined") return () => {};
    const mql = window.matchMedia(query);
    mql.addEventListener("change", cb);
    return () => {
      mql.removeEventListener("change", cb);
    };
  };

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
