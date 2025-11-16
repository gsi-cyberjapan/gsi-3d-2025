"use client";

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectGroup,
  SelectLabel,
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
  const [vectorMapDataList, rusterMapDataList, globeMapDataList] = [
    mapBaseDataList.filter((d) => d.meta.id.endsWith("-vector")),
    mapBaseDataList.filter((d) => d.meta.id.endsWith("-ruster")),
    mapBaseDataList.filter((d) => d.meta.id.endsWith("-globe")),
  ];

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
        <MapBaseItem
          key={selectedBaseMapData.meta.id}
          mapBaseData={selectedBaseMapData}
          displayMapType
        />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Vector</SelectLabel>
          {vectorMapDataList.map((baseData) => (
            <SelectItem
              key={baseData.meta.id}
              value={baseData.meta.id}
              className="cursor-pointer"
            >
              <MapBaseItem key={baseData.meta.id} mapBaseData={baseData} />
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Ruster</SelectLabel>
          {rusterMapDataList.map((baseData) => (
            <SelectItem
              key={baseData.meta.id}
              value={baseData.meta.id}
              className="cursor-pointer"
            >
              <MapBaseItem key={baseData.meta.id} mapBaseData={baseData} />
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Globe</SelectLabel>
          {globeMapDataList.map((baseData) => (
            <SelectItem
              key={baseData.meta.id}
              value={baseData.meta.id}
              className="cursor-pointer"
            >
              <MapBaseItem key={baseData.meta.id} mapBaseData={baseData} />
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
