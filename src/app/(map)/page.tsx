import { MapCard } from "@/components/custom/map-card";
import { MapHeader } from "@/components/custom/map-header";
import { MapProviderContainer } from "@/components/custom/map-provider-container";

const MapPage = () => {
  return (
    <div className="p-4 flex flex-col gap-2 h-full">
      <MapProviderContainer>
        <MapHeader />
        <div className="h-[80%]">
          <MapCard />
        </div>
      </MapProviderContainer>
    </div>
  );
};

export default MapPage;
