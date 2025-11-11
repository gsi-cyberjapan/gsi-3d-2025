import { type LngLat, useMap } from "@vis.gl/react-maplibre";
import { useEffect, useState, useCallback, useRef } from "react";

interface Props {
  mapId: string;
}

export const MapCenterInformation = ({ mapId }: Props) => {
  const map = useMap()[mapId]?.getMap();
  const [center, setCenter] = useState<LngLat | undefined>(undefined);
  const [zoom, setZoom] = useState<number | undefined>(undefined);
  const rafRef = useRef<number | undefined>(undefined);

  const setMapInformation = useCallback(() => {
    if (!map || rafRef.current !== undefined) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = undefined;
      setCenter(map.getCenter());
      setZoom(map.getZoom());
    });
  }, [map]);

  useEffect(() => {
    if (!map) return;
    map.on("move", setMapInformation);
    map.on("load", setMapInformation);
    return () => {
      map.off("move", setMapInformation);
      map.off("load", setMapInformation);
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [map, setMapInformation]);

  return (
    <div>
      <div className="font-semibold text-sm">東京都千代田区丸の内</div>
      <table>
        <tbody className="text-xs text-muted-foreground font-normal [&_th]:text-left [&_th]:pr-1 [&_th]:font-normal">
          <tr>
            <th>緯度</th>
            <td>{center?.lat}</td>
          </tr>
          <tr>
            <th>経度</th>
            <td>{center?.lng}</td>
          </tr>
          <tr>
            <th>ズーム</th>
            <td>{zoom}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
