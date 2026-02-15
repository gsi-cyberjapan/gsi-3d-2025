import type maplibregl from "maplibre-gl";

export type MapLibreType = typeof maplibregl;

let maplibrePromise: Promise<MapLibreType> | null = null;

export function getMaplibreWithProtocol(): Promise<MapLibreType> {
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

      const { getGsiDemProtocolAction } = await import(
        "maplibre-gl-gsi-terrain"
      );
      maplibre.addProtocol("gsidem", getGsiDemProtocolAction("gsidem"));

      return maplibre;
    })();
  }

  return maplibrePromise;
}
