import { Spinner } from "@/components/ui/spinner";
import dynamic from "next/dynamic";
import { MAP_CONFIG } from "@/lib/config";

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
          <span>{MAP_CONFIG.LOADING_MESSAGE}</span>
        </div>
      </div>
    ),
  },
);

export const Map = () => {
  return (
    <ReactMaplibre
      initialViewState={{
        longitude: -100,
        latitude: 40,
        zoom: 3.5,
      }}
      mapStyle="https://demotiles.maplibre.org/style.json"
    />
  );
};
