import { BASE_LAYER_CONFIG, NONE_LAYER_CONFIG } from "./config";

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

interface VectorBaseLayer {
  id: string;
  type: "vector";
  label: string;
  legendImageUrl: string;
  styleUrl: string;
  maxZoom: number;
  minZoom: number;
}

export interface CustomBaseLayer {
  id: string;
  type: "custom";
  label: string;
  legendImageUrl: string;
  sourceType: "tilejson" | "style";
  source: "url" | "file";
  data: string; // URL string or JSON string
  minZoom: number;
  maxZoom: number;
}

interface NoneBaseLayer {
  id: string;
  type: "none";
  label: string;
}

export type BaseLayer =
  | RasterBaseLayer
  | VectorBaseLayer
  | CustomBaseLayer
  | NoneBaseLayer;

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

  baseLayers.push({
    id: NONE_LAYER_CONFIG.ID,
    type: "none",
    label: NONE_LAYER_CONFIG.LABEL,
  });

  return baseLayers;
};
