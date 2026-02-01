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
        },
      ],
    };
  } else if (baseLayer.type === "custom") {
    // Custom layer handling
    if (baseLayer.sourceType === "style") {
      // Style Spec: URL returns string, file returns parsed StyleSpecification
      if (baseLayer.source === "url") {
        return baseLayer.data;
      } else {
        return JSON.parse(baseLayer.data) as StyleSpecification;
      }
    } else {
      // TileJSON: Build raster style dynamically
      const tileJson = JSON.parse(baseLayer.data) as { tiles: string[] };
      return {
        version: 8,
        sources: {
          [baseLayer.id]: {
            type: "raster",
            tiles: tileJson.tiles,
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
          },
        ],
      };
    }
  } else {
    return baseLayer.styleUrl;
  }
};
