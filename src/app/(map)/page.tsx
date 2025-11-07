import { MapCard } from "@/components/custom/map-card";
import { MapHeader } from "@/components/custom/map-header";

const MapPage = () => {
  return (
    <div className="p-4 flex flex-col gap-2 h-full">
      <MapHeader />
      <div className="h-[80%]">
        <MapCard />
      </div>
    </div>
  );
};

export default MapPage;
