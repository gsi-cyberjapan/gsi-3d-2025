import { MapCardModeSelect } from "./map-card-mode-select";

export const MapHeader = () => {
  return (
    <div className="h-10 flex items-center justify-end">
      <MapCardModeSelect />
    </div>
  );
};
