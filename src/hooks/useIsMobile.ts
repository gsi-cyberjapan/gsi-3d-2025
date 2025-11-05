import { useState, useEffect } from "react";
import { RESPONSIVE } from "@/lib/config";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(
    window.innerWidth < RESPONSIVE.MOBILE_BREAKPOINT_PX,
  );

  useEffect(() => {
    const mql = window.matchMedia(
      `(max-width: ${String(RESPONSIVE.MOBILE_BREAKPOINT_PX - 1)}px)`,
    );
    const onChange = () => {
      setIsMobile(window.innerWidth < RESPONSIVE.MOBILE_BREAKPOINT_PX);
    };
    mql.addEventListener("change", onChange);
    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, []);

  return !!isMobile;
}
