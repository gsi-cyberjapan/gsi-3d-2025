import { MapBaseData } from "./getMapBaseDataList";
import { MapState } from "@/hooks/store/createMapSlice";

interface BuildInitialMapStateOption {
  mapBaseDataList: MapBaseData[];
}

export const buildInitialMapState = (
  option: BuildInitialMapStateOption,
): MapState => {
  return {
    mapBaseData: option.mapBaseDataList[0],
  };
};
