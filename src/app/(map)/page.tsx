import { ComparableMapCard } from "@/components/custom/comparable-map-card";

const MapPage = () => {
  return (
    <div className="p-4 flex flex-col gap-2 h-full">
      <div className="h-[80%]">
        <ComparableMapCard />
      </div>
    </div>
  );
};

export default MapPage;
