import { getMapBaseDataist } from "@/lib/getMapBaseDataList";

export const MapBaseLayerSelector = async () => {
  const mapBaseDataList = await getMapBaseDataist();

  return (
    <div>
      <div className="text-muted-foreground text-xs">ベースレイヤー</div>
      <div>{JSON.stringify(mapBaseDataList)}</div>
    </div>
  );
};
