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

interface VectorStyleDefinition {
  title: string;
  [key: string]: unknown;
}

interface RusterMapBaseData {
  meta: {
    id: string;
    type: "ruster";
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

export type MapBaseData = RusterMapBaseData | VectorMapBaseData;

const getRasterMapDataList = async (): Promise<RusterMapBaseData[]> => {
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
      id: `${layer.id}-ruster`,
      type: "ruster",
      title: layer.title,
      legendImageUrl: layer.legendUrl,
    },
    data: {
      tileUrl: layer.url,
      errorTileUrl: layer.errorTileUrl,
    },
  }));
};

const getVectorMapDataList = async (): Promise<VectorMapBaseData[]> => {
  return await Promise.all(
    BASE_LAYER_CONFIG.VECTOR_STYLE_URLS.map(async (url) => {
      const styleResponse = await fetch(url);
      const style = await (async (): Promise<VectorStyleDefinition> => {
        const json: unknown = await styleResponse.json();
        if (!json || typeof json !== "object" || !("title" in json)) {
          throw new Error("Invalid vevtor style.");
        }
        return json as VectorStyleDefinition;
      })();

      const filename = new URL(url).pathname.split("/").pop();
      const name = filename?.replace(/\.[^.]+$/, "");

      if (!name) {
        throw new Error("Vector style url does not contain a valid filename.");
      }
      const vectorMapData: VectorMapBaseData = {
        meta: {
          id: `${name}-vector`,
          type: "vector",
          title: style.title,
          legendImageUrl: `${BASE_LAYER_CONFIG.VECTOR_LEGEND_IMAGE_PATH}/${name}.png`,
        },
        data: {
          styleUrl: url,
        },
      };

      return vectorMapData;
    }),
  );
};

export const isRusterMapData = (
  data: MapBaseData,
): data is RusterMapBaseData => {
  return data.meta.type === "ruster";
};

export const isVectorMapData = (
  data: MapBaseData,
): data is VectorMapBaseData => {
  return data.meta.type === "vector";
};

export const getMapBaseDataist = async (): Promise<MapBaseData[]> => {
  const [rasterMapDataList, vectorMapDataList] = await Promise.all([
    getRasterMapDataList(),
    getVectorMapDataList(),
  ]);

  const MapBaseDataList = [...rasterMapDataList, ...vectorMapDataList].sort(
    (a, b) => a.meta.id.localeCompare(b.meta.id),
  );

  return MapBaseDataList;
};
