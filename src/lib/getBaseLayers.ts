import { BASE_LAYER_CONFIG } from "./config";

interface RasterBaseLayer {
  id: string;
  type: "raster";
  label: string;
  legendImageUrl: string;
  errorImageUrl: string;
  tileUrl: string;
  maxZoom: number;
  minZoom: number;
}

interface GlobeBaseLayer {
  id: string;
  type: "globe";
  label: string;
  legendImageUrl: string;
  errorImageUrl: string;
  tileUrl: string;
  maxZoom: number;
}

interface VectorBaseLayer {
  id: string;
  type: "vector";
  label: string;
  legendImageUrl: string;
  styleUrl: string;
  maxZoom: number;
  minZoom: number;
}

export type BaseLayer = RasterBaseLayer | GlobeBaseLayer | VectorBaseLayer;

export const getBaseLayers = (): BaseLayer[] => {
  const baseLayers: BaseLayer[] = [];

  BASE_LAYER_CONFIG.VECTOR_LAYERS.forEach((layer) => {
    baseLayers.push({
      id: layer.ID,
      type: "vector",
      label: layer.TITLE,
      legendImageUrl: layer.LEGEND_IMAGE_URL,
      styleUrl: layer.STYLE_URL,
      minZoom: layer.MIN_ZOOM,
      maxZoom: layer.MAX_ZOOM,
    });
  });

  BASE_LAYER_CONFIG.RASTER_LAYERS.forEach((layer) => {
    baseLayers.push({
      id: layer.ID,
      type: "raster",
      label: layer.TITLE,
      legendImageUrl: layer.LEGEND_IMAGE_URL,
      errorImageUrl: layer.ERROR_TILE_URL,
      tileUrl: layer.TILE_URL,
      minZoom: layer.MIN_ZOOM,
      maxZoom: layer.MAX_ZOOM,
    });
  });

  BASE_LAYER_CONFIG.GLOBE_LAYERS.forEach((layer) => {
    baseLayers.push({
      id: layer.ID,
      type: "globe",
      label: layer.TITLE,
      legendImageUrl: layer.LEGEND_IMAGE_URL,
      errorImageUrl: layer.ERROR_TILE_URL,
      tileUrl: layer.TILE_URL,
      maxZoom: layer.MAX_ZOOM,
    });
  });
  return baseLayers;
};
