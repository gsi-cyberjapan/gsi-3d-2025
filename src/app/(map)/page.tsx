import { MapsView } from "@/components/map/maps-view";
import { DrawWindow } from "@/components/draw/draw-window";
import { DrawFeatureEditDigalog } from "@/components/draw/draw-feature-edit-dialog";
import { MeasureWindow } from "@/components/measure/measure-window";
import { ReliefWindow } from "@/components/relief/relief-window";
import { ReliefLayerWatcher } from "@/components/relief/relief-layer-watcher";
import { StateHydrator } from "@/components/state-hydrator";
import { StatePersistenceController } from "@/components/state-persistence-controller";

const MapPage = () => {
  return (
    <StateHydrator>
      <div className="h-full w-full">
        <MapsView />
        <DrawWindow />
        <MeasureWindow />
        <ReliefWindow />
        <DrawFeatureEditDigalog />
        <ReliefLayerWatcher />
        <StatePersistenceController />
      </div>
    </StateHydrator>
  );
};

export default MapPage;
