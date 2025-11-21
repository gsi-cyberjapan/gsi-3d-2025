import { getMapBaseDataList } from "@/lib/getMapBaseDataList";
import { MapBaseSelectorInner } from "./ma-base-selector-inner";

export const MapBaseSelector = async () => {
  const mapBaseDataList = await getMapBaseDataList();

  return (
    <div className="flex flex-col gap-2">
      <div className="text-muted-foreground text-xs">ベースレイヤー</div>
      <MapBaseSelectorInner mapBaseDataList={mapBaseDataList} />
    </div>
  );
};
