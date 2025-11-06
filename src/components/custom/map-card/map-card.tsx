"use client";

import { Map } from "./map";

export const MapCard = () => {
  return (
    <div className="w-full h-full flex gap-1 rounded-md overflow-hidden border">
      <Map />
      <Map />
    </div>
  );
};
