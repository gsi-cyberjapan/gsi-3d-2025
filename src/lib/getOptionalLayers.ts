import { OPTIONAL_LAYER_CONFIG } from "./config";

export type OptionalLayerEntry = Layer | LayerGroup;

type RootDefinition = string[];

interface LayerGroup {
  type: "layer-group";
  title: string;
  legendImageUrl?: string;
  entries: OptionalLayerEntry[];
}

interface Layer {
  type: "layer";
  id: string;
  title: string;
  tileUrl: string;
  minZoom?: number;
  maxZoom?: number;
  html?: string;
  legendUrl?: string;
}

interface RawLayer {
  type: "Layer";
  id: string;
  title: string;
  url: string;
  minZoom?: number;
  maxZoom?: number;
  html?: string;
  legendUrl?: string;
}

interface RawLayerGroup {
  type: "LayerGroup";
  title: string;
  iconUrl?: string;
  entries?: RawEntry[];
  src?: string;
}

type RawEntry = RawLayer | RawLayerGroup;

interface RawRoot {
  layers: RawEntry[];
}

type RawRootLoader = (urlOrPath: string) => Promise<RawRoot>;

/* ----------------------------------------------------------------------------
 * type guards
 * ------------------------------------------------------------------------- */

const isRawLayer = (entry: RawEntry): entry is RawLayer =>
  entry.type === "Layer";

const isRawLayerGroup = (entry: RawEntry): entry is RawLayerGroup =>
  entry.type === "LayerGroup";

const isRawRoot = (json: unknown): json is RawRoot => {
  if (typeof json !== "object" || json === null) return false;

  const root = json as { layers?: unknown };
  return Array.isArray(root.layers);
};

/* ----------------------------------------------------------------------------
 * URL helpers
 * ------------------------------------------------------------------------- */

const resolveUrl = (urlOrPath: string): string => {
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    return urlOrPath;
  }

  if (urlOrPath.length === 0) {
    throw new Error("Empty urlOrPath.");
  }

  // 以前の実装の `${BASE_URL}${url.slice(1)}` と同じ動きに揃える
  const sliced = urlOrPath.slice(1);
  return `${OPTIONAL_LAYER_CONFIG.BASE_LAYER_URL}${sliced}`;
};

const buildLegendImageUrl = (iconUrl?: string): string | undefined => {
  if (!iconUrl) return undefined;
  // こちらも以前と同じく `iconUrl.slice(1)` に揃える
  return `${OPTIONAL_LAYER_CONFIG.BASE_IMAGE_URL}${iconUrl.slice(1)}`;
};

/* ----------------------------------------------------------------------------
 * Raw loader & converters
 * ------------------------------------------------------------------------- */

const fetchRawRoot: RawRootLoader = async (urlOrPath) => {
  const res = await fetch(resolveUrl(urlOrPath));
  if (!res.ok) {
    throw new Error(
      `Failed to fetch optional layers: ${res.status.toString()}`,
    );
  }

  const json: unknown = await res.json();
  if (!isRawRoot(json)) {
    throw new Error("Invalid optional layer root structure.");
  }

  if (json.layers.length === 0) {
    throw new Error("No layers found.");
  }

  return json;
};

const toLayer = (raw: RawLayer): Layer => ({
  type: "layer",
  id: raw.id,
  title: raw.title,
  tileUrl: raw.url,
  minZoom: raw.minZoom,
  maxZoom: raw.maxZoom,
  html: raw.html,
  legendUrl: raw.legendUrl,
});

const toLayerGroup = (
  raw: RawLayerGroup,
  children: OptionalLayerEntry[],
): LayerGroup => ({
  type: "layer-group",
  title: raw.title,
  legendImageUrl: buildLegendImageUrl(raw.iconUrl),
  entries: children,
});

const convertEntry = async (
  entry: RawEntry,
  loadRoot: RawRootLoader,
): Promise<OptionalLayerEntry | null> => {
  if (isRawLayer(entry)) {
    return toLayer(entry);
  }

  if (isRawLayerGroup(entry)) {
    if (entry.entries && entry.entries.length > 0) {
      const convertedChildren = await Promise.all(
        entry.entries.map((child) => convertEntry(child, loadRoot)),
      );
      const children = convertedChildren.filter(
        (child): child is OptionalLayerEntry => child !== null,
      );
      return toLayerGroup(entry, children);
    }

    if (entry.src) {
      const nestedRoot = await loadRoot(entry.src);
      const nestedConverted = await Promise.all(
        nestedRoot.layers.map((child) => convertEntry(child, loadRoot)),
      );
      const nestedChildren = nestedConverted.filter(
        (child): child is OptionalLayerEntry => child !== null,
      );
      return toLayerGroup(entry, nestedChildren);
    }
  }

  return null;
};

const getOptionalLayerEntry = async (
  urlOrPath: string,
): Promise<OptionalLayerEntry> => {
  const root = await fetchRawRoot(urlOrPath);

  const convertedList = await Promise.all(
    root.layers.map((entry) => convertEntry(entry, fetchRawRoot)),
  );
  const converted = convertedList.filter(
    (entry): entry is OptionalLayerEntry => entry !== null,
  );

  if (converted.length === 0) {
    throw new Error("No valid optional layer entries.");
  }

  if (converted.length === 1) {
    return converted[0];
  }

  return {
    type: "layer-group",
    title: "optional layers",
    legendImageUrl: undefined,
    entries: converted,
  };
};

/* ----------------------------------------------------------------------------
 * Public API
 * ------------------------------------------------------------------------- */

const getRootDefinition = async (): Promise<RootDefinition> => {
  const res = await fetch(
    `${OPTIONAL_LAYER_CONFIG.BASE_LAYER_URL}${OPTIONAL_LAYER_CONFIG.LAYERS_DEFINITION_FILE_PATH}`,
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch layers root: ${res.status.toString()}`);
  }

  const json: unknown = await res.json();
  if (!Array.isArray(json)) {
    throw new Error("Invalid layers root definition.");
  }

  return json
    .map((item) => (item as { url?: string }).url)
    .filter((url): url is string => typeof url === "string" && url.length > 0);
};

export const getOptionalLayers = async (): Promise<OptionalLayerEntry[]> => {
  const definitions = await getRootDefinition();
  const entries = await Promise.all(
    definitions.map((def) => getOptionalLayerEntry(def)),
  );
  return entries;
};

/* ----------------------------------------------------------------------------
 * Layer metadata cache
 * ------------------------------------------------------------------------- */

export interface LayerMetadata {
  html?: string;
  legendUrl?: string;
}

const layerMetadataCache = new Map<string, LayerMetadata>();

const collectMetadata = (entries: OptionalLayerEntry[]): void => {
  for (const entry of entries) {
    if (entry.type === "layer") {
      const hasHtml =
        typeof entry.html === "string" && entry.html.trim().length > 0;
      const hasLegend =
        typeof entry.legendUrl === "string" && entry.legendUrl.length > 0;
      if (hasHtml || hasLegend) {
        layerMetadataCache.set(entry.id, {
          html: entry.html,
          legendUrl: entry.legendUrl,
        });
      }
    } else {
      collectMetadata(entry.entries);
    }
  }
};

export const buildLayerMetadataCache = (
  entries: OptionalLayerEntry[],
): void => {
  layerMetadataCache.clear();
  collectMetadata(entries);
};

export const getLayerMetadata = (
  layerId: string,
): LayerMetadata | undefined => {
  return layerMetadataCache.get(layerId);
};
