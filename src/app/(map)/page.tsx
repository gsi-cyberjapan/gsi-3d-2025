import { MapsView } from "@/components/map/maps-view";
import { DrawWindow } from "@/components/draw/draw-window";
import { DrawFeatureEditDigalog } from "@/components/draw/draw-feature-edit-dialog";

const MapPage = () => {
  return (
    <div className="h-full w-full">
      <MapsView />
      <DrawWindow />
      <DrawFeatureEditDigalog />
    </div>
  );
};

export default MapPage;
