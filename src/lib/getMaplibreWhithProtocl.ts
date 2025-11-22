import type maplibregl from "maplibre-gl";

type MapLibreType = typeof maplibregl;

let maplibrePromise: Promise<MapLibreType> | null = null;

export function getMaplibreWithPmtiles(): Promise<MapLibreType> {
  if (!maplibrePromise) {
    maplibrePromise = (async () => {
      const [{ Protocol }, maplibreModule] = await Promise.all([
        import("pmtiles"),
        import("maplibre-gl"),
      ]);

      const maplibre =
        (maplibreModule as { default?: MapLibreType }).default ??
        (maplibreModule as MapLibreType);
      const protocol = new Protocol();
      maplibre.addProtocol("pmtiles", protocol.tile);

      return maplibre;
    })();
  }

  return maplibrePromise;
}
