import { MapsView } from "@/components/map/maps-view";
import { DrawWindow } from "@/components/draw/draw-window";
import { DrawFeatureEditDigalog } from "@/components/draw/draw-feature-edit-dialog";
import { MeasureWindow } from "@/components/measure/measure-window";
import { ReliefWindow } from "@/components/relief/relief-window";
import { ReliefLayerWatcher } from "@/components/relief/relief-layer-watcher";

const MapPage = () => {
  return (
    <div className="h-full w-full">
      <MapsView />
      <DrawWindow />
      <MeasureWindow />
      <ReliefWindow />
      <DrawFeatureEditDigalog />
      <ReliefLayerWatcher />
    </div>
  );
};

export default MapPage;
