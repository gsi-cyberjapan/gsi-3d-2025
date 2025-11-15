import { MapBaseData } from "@/lib/getMapBaseDataList";

interface Props {
  mapBaseData: MapBaseData;
}

export const MapBaseItem = ({ mapBaseData }: Props) => {
  return <div>{mapBaseData.meta.title}</div>;
};
