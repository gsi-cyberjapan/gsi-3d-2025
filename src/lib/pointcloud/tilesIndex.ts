import type { Map as MaplibreMap } from "maplibre-gl";
import { POINT_CLOUD_CONFIG } from "@/lib/config";
import {
  filenameToMeshCode,
  meshCodeToBounds,
  boundsOverlap,
  type Bounds,
} from "@/lib/pointcloud/meshCodeToPolygon";

export interface TileEntry {
  name: string;
  meshCode: string;
  bounds: Bounds;
}

// Module-level cache for tiles index
let tilesIndexCache: TileEntry[] | null = null;
let tilesIndexPromise: Promise<TileEntry[]> | null = null;

export const fetchTilesIndex = async (): Promise<TileEntry[]> => {
  if (tilesIndexCache) return tilesIndexCache;
  if (tilesIndexPromise) return tilesIndexPromise;

  tilesIndexPromise = fetch(POINT_CLOUD_CONFIG.TILES_INDEX_URL)
    .then((res) => res.json())
    .then((data: unknown) => {
      const items = data as string[];
      const entries: TileEntry[] = items.map((name) => {
        const meshCode = filenameToMeshCode(name);
        return {
          name,
          meshCode,
          bounds: meshCodeToBounds(meshCode),
        };
      });
      tilesIndexCache = entries;
      return entries;
    });

  return tilesIndexPromise;
};

export const getViewportBounds = (map: MaplibreMap): Bounds => {
  const bounds = map.getBounds();
  return [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth(),
  ];
};

export const getVisibleTileEntries = async (
  map: MaplibreMap,
): Promise<TileEntry[]> => {
  const tiles = await fetchTilesIndex();
  const viewportBounds = getViewportBounds(map);
  return tiles.filter((t) => boundsOverlap(t.bounds, viewportBounds));
};
