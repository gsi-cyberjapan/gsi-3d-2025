import { MapCard } from "@/components/custom/map-card";
import { MapHeader } from "@/components/custom/map-header";
import { MapProviderContainer } from "@/components/custom/map-provider-container";
import { buildInitialMapState } from "@/lib/buildInitialMapState";
import { getMapBaseDataList } from "@/lib/getMapBaseDataList";

const MapPage = async () => {
  const mapBaseDataList = await getMapBaseDataList();
  const initialMapState = buildInitialMapState({ mapBaseDataList });

  return (
    <div className="p-4 flex flex-col gap-2 h-full">
      <MapProviderContainer>
        <MapHeader />
        <div className="h-[80%]">
          <MapCard initialMapState={initialMapState} />
        </div>
      </MapProviderContainer>
    </div>
  );
};

export default MapPage;
