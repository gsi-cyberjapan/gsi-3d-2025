"use client";

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
} from "@/components/ui/select";
import { useGlobalStore } from "@/hooks/store/useGlobalStore";
import { MapBaseData } from "@/lib/getMapBaseDataList";
import { MapBaseItem } from "./map-base-item";

interface Props {
  mapBaseDataList: MapBaseData[];
}

export const MapBaseSelectorInner = ({ mapBaseDataList }: Props) => {
  const controlTargetMapId = useGlobalStore(
    (state) => state.controlTargetMapId,
  );
  const selectedBaseMapData = useGlobalStore(
    (state) => state.maps[controlTargetMapId]?.mapBaseData,
  );
  const setBaseMapData = useGlobalStore((state) => state.setBaseMapData);

  const handleOnValueChange = (id: string) => {
    const targetMetaData = mapBaseDataList.find((mbd) => mbd.meta.id === id);
    if (!targetMetaData) {
      throw new Error("No matching base map data found for the given id.");
    }

    setBaseMapData(controlTargetMapId, targetMetaData);
  };

  if (!selectedBaseMapData) {
    return <div>TODO</div>;
  }

  return (
    <Select
      value={selectedBaseMapData.meta.id}
      onValueChange={handleOnValueChange}
    >
      <SelectTrigger className="w-full" size="lg">
        <MapBaseItem mapBaseData={selectedBaseMapData} />
      </SelectTrigger>
      <SelectContent>
        {mapBaseDataList.map((baseData) => (
          <SelectItem key={baseData.meta.id} value={baseData.meta.id}>
            <MapBaseItem key={baseData.meta.id} mapBaseData={baseData} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
