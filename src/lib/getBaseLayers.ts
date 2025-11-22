import { BASE_LAYER_CONFIG } from "./config";

interface RasterBaseLayer {
  id: string;
  type: "raster";
  label: string;
  legendImageUrl: string;
  errorImageUrl: string;
  tileUrl: string;
}

interface GlobeBaseLayer {
  id: string;
  type: "globe";
  label: string;
  legendImageUrl: string;
  errorImageUrl: string;
  tileUrl: string;
}

interface VectorBaseLayer {
  id: string;
  type: "vector";
  label: string;
  legendImageUrl: string;
  styleUrl: string;
}

export type BaseLayer = RasterBaseLayer | GlobeBaseLayer | VectorBaseLayer;

export const isRasterBaseLayer = (
  baseLayer: BaseLayer,
): baseLayer is RasterBaseLayer => {
  return baseLayer.type === "raster";
};

export const isGlobeBaseLayer = (
  baseLayer: BaseLayer,
): baseLayer is GlobeBaseLayer => {
  return baseLayer.type === "globe";
};

export const isVectorBaseLayer = (
  baseLayer: BaseLayer,
): baseLayer is VectorBaseLayer => {
  return baseLayer.type === "vector";
};

export const getBaseLayers = (): BaseLayer[] => {
  const baseLayers: BaseLayer[] = [];

  BASE_LAYER_CONFIG.VECTOR_LAYERS.forEach((layer) => {
    baseLayers.push({
      id: layer.ID,
      type: "vector",
      label: layer.TITLE,
      legendImageUrl: layer.LEGEND_IMAGE_URL,
      styleUrl: layer.STYLE_URL,
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
    });
  });
  return baseLayers;
};
