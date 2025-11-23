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
        },
      },
      layers: [
        {
          id: `${baseLayer.id}-layer`,
          type: "raster",
          source: baseLayer.id,
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
        },
      },
      layers: [
        {
          id: `${baseLayer.id}-layer`,
          type: "raster",
          source: baseLayer.id,
        },
      ],
    };
  } else {
    return baseLayer.styleUrl;
  }
};
