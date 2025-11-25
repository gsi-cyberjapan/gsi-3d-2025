import { BaseLayer } from "./getBaseLayers";
import { type StyleSpecification } from "maplibre-gl";

export const buildStyleFromBaseLayer = (
  baseLayer: BaseLayer,
): string | StyleSpecification => {
  if (baseLayer.type === "raster") {
    return {
      version: 8,
      sources: {
        [baseLayer.id]: {
          type: "raster",
          tiles: [baseLayer.tileUrl],
          tileSize: 256,
          minzoom: baseLayer.minZoom,
          maxzoom: baseLayer.maxZoom,
        },
      },
      layers: [
        {
          id: `${baseLayer.id}-layer`,
          type: "raster",
          source: baseLayer.id,
          minzoom: baseLayer.minZoom,
          maxzoom: baseLayer.maxZoom + 1,
        },
      ],
    };
  } else if (baseLayer.type === "globe") {
    return {
      version: 8,
      sources: {
        [baseLayer.id]: {
          type: "raster",
          tiles: [baseLayer.tileUrl],
          tileSize: 256,
          maxzoom: baseLayer.maxZoom,
        },
      },
      layers: [
        {
          id: `${baseLayer.id}-layer`,
          type: "raster",
          source: baseLayer.id,
          maxzoom: baseLayer.maxZoom + 1,
        },
      ],
    };
  } else {
    return baseLayer.styleUrl;
  }
};
