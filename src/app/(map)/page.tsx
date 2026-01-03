import { MapsView } from "@/components/map/maps-view";
import { DrawWindow } from "@/components/draw/draw-window";

const MapPage = () => {
  return (
    <div className="h-full w-full">
      <MapsView />
      <DrawWindow />
    </div>
  );
};

export default MapPage;
