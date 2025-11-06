import { MapCard } from "@/components/custom/map-card";

const MapPage = () => {
  return (
    <div className="p-4 flex flex-col gap-2 h-full">
      <div className="h-[80%]">
        <MapCard />
      </div>
    </div>
  );
};

export default MapPage;
