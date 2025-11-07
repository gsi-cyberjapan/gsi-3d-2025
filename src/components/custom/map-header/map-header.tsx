import { MapViewModeSelect } from "./map-view-mode-select";

export const MapHeader = () => {
  return (
    <div className="h-10 flex items-center justify-end">
      <MapViewModeSelect />
    </div>
  );
};
