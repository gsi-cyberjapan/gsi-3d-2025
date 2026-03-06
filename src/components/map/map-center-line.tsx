"use client";

import { useStore } from "@/hooks/store/useStore";
import { Activity } from "react";
import { Plus } from "lucide-react";

export const MapCenterLine = () => {
  const isDiplayCenterLine = useStore((state) => state.isDisplayCenterLine);

  return (
    <Activity mode={isDiplayCenterLine ? "visible" : "hidden"}>
      <Plus className="text-black size-9" strokeWidth={1.5} />
    </Activity>
  );
};
