import { BASE_LAYER_CONFIG } from "./config";

interface RasterDefinition {
  layers: {
    type: "Layer";
    id: string;
    title: string;
    url: string;
    cocotile: boolean;
    html: string;
    legendUrl: string;
    errorTileUrl: string;
    maxNativeZoom?: number;
  }[];
}

type GlobeDefinition = RasterDefinition;

interface RasterMapBaseData {
  meta: {
    id: string;
    type: "raster";
    title: string;
    legendImageUrl: string;
  };
  data: {
    tileUrl: string;
    errorTileUrl: string;
  };
}

interface GlobeMapBaseData {
  meta: {
    id: string;
    type: "globe";
    title: string;
    legendImageUrl: string;
  };
  data: {
    tileUrl: string;
    errorTileUrl: string;
  };
}

interface VectorMapBaseData {
  meta: {
    id: string;
    type: "vector";
    title: string;
    legendImageUrl: string;
  };
  data: {
    styleUrl: string;
  };
}

export type MapBaseData =
  | RasterMapBaseData
  | VectorMapBaseData
  | GlobeMapBaseData;

const getRasterMapDataList = async (): Promise<RasterMapBaseData[]> => {
  const rasterDefinitionResponse = await fetch(
    BASE_LAYER_CONFIG.RUSTER_DEFINITION_URL,
  );

  const rasterDefinition = await (async (): Promise<RasterDefinition> => {
    const json: unknown = await rasterDefinitionResponse.json();
    if (!json || typeof json !== "object" || !("layers" in json)) {
      throw new Error("Invalid raster definition.");
    }
    return json as RasterDefinition;
  })();

  return rasterDefinition.layers.map((layer) => ({
    meta: {
      id: `${layer.id}-raster`,
      type: "raster",
      title: layer.title,
      legendImageUrl: layer.legendUrl,
    },
    data: {
      tileUrl: layer.url,
      errorTileUrl: layer.errorTileUrl,
    },
  }));
};

const getGlobeMapDataList = async (): Promise<GlobeMapBaseData[]> => {
  const globeDefinitionResponse = await fetch(
    BASE_LAYER_CONFIG.RUSTER_DEFINITION_URL,
  );

  const globeDefinition = await (async (): Promise<GlobeDefinition> => {
    const json: unknown = await globeDefinitionResponse.json();
    if (!json || typeof json !== "object" || !("layers" in json)) {
      throw new Error("Invalid globe definition.");
    }
    return json as GlobeDefinition;
  })();

  return globeDefinition.layers.map((layer) => ({
    meta: {
      id: `${layer.id}-globe`,
      type: "globe",
      title: layer.title,
      legendImageUrl: layer.legendUrl,
    },
    data: {
      tileUrl: layer.url,
      errorTileUrl: layer.errorTileUrl,
    },
  }));
};

const getVectorMapDataList = (): VectorMapBaseData[] => {
  return BASE_LAYER_CONFIG.VECTOR_STYLES.map((style) => {
    const filename = new URL(style.URL).pathname.split("/").pop();
    const name = filename?.replace(/\.[^.]+$/, "");

    if (!name) {
      throw new Error("Vector style url does not contain a valid filename.");
    }

    const vectorMapData: VectorMapBaseData = {
      meta: {
        id: `${name}-vector`,
        type: "vector",
        title: style.TITLE,
        legendImageUrl: `${BASE_LAYER_CONFIG.VECTOR_LEGEND_IMAGE_PATH}/${name}.png?raw=true`,
      },
      data: {
        styleUrl: style.URL,
      },
    };
    return vectorMapData;
  });
};

export const isRasterMapData = (
  data: MapBaseData,
): data is RasterMapBaseData => {
  return data.meta.type === "raster";
};

export const isGlobeMapData = (data: MapBaseData): data is GlobeMapBaseData => {
  return data.meta.type === "globe";
};

export const isVectorMapData = (
  data: MapBaseData,
): data is VectorMapBaseData => {
  return data.meta.type === "vector";
};

export const getMapBaseDataist = async (): Promise<MapBaseData[]> => {
  const vectorMapDataList = getVectorMapDataList();
  const [rasterMapDataList, globaMapDataList] = await Promise.all([
    getRasterMapDataList(),
    getGlobeMapDataList(),
  ]);

  const MapBaseDataList = [
    ...vectorMapDataList,
    ...rasterMapDataList,
    ...globaMapDataList,
  ];

  return MapBaseDataList;
};
