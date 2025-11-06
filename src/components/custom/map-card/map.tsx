"use client";

import { Spinner } from "@/components/ui/spinner";
import dynamic from "next/dynamic";

const ReactMaplibre = dynamic(
  () => import("@vis.gl/react-maplibre").then((m) => m.Map),
  {
    ssr: false,
    loading: () => (
      <div
        aria-busy="true"
        className="w-full h-full flex items-center justify-center"
      >
        <div className="flex gap-2 items-center text-muted-foreground">
          <Spinner />
          <span>地図を読み込み中...</span>
        </div>
      </div>
    ),
  },
);

export const Map = () => {
  return (
    <div className="w-full">
      <ReactMaplibre
        initialViewState={{
          longitude: -100,
          latitude: 40,
          zoom: 3.5,
        }}
        mapStyle="https://demotiles.maplibre.org/style.json"
      />
    </div>
  );
};
