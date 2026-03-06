import { type StyleSpecification } from "maplibre-gl";

// Storage format for custom layers
export interface CustomLayerStorageItem {
  id: string;
  label: string;
  sourceType: "tilejson" | "style";
  source: "url" | "file";
  data: string; // URL string or JSON string
  minZoom: number;
  maxZoom: number;
  createdAt: number;
}

// TileJSON format (subset of spec we validate)
interface TileJSON {
  tiles: string[];
  minzoom?: number;
  maxzoom?: number;
  name?: string;
  attribution?: string;
}

const STORAGE_KEY = "gsi-3d-2025-custom-base-layers";
export const MAX_CUSTOM_LAYERS = 5;

/**
 * Get custom layers from localStorage
 */
export const getCustomLayers = (): CustomLayerStorageItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as CustomLayerStorageItem[];
  } catch {
    return [];
  }
};

/**
 * Save custom layers to localStorage
 */
export const saveCustomLayers = (layers: CustomLayerStorageItem[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layers));
};

/**
 * Add a new custom layer (with 5-layer limit check)
 */
export const addCustomLayer = (
  layer: Omit<CustomLayerStorageItem, "id" | "createdAt">,
): CustomLayerStorageItem => {
  const layers = getCustomLayers();
  if (layers.length >= MAX_CUSTOM_LAYERS) {
    throw new Error(
      `カスタムレイヤは最大${String(MAX_CUSTOM_LAYERS)}件までです。既存のレイヤを削除してから追加してください。`,
    );
  }

  const newLayer: CustomLayerStorageItem = {
    ...layer,
    id: `custom-${String(Date.now())}`,
    createdAt: Date.now(),
  };

  saveCustomLayers([...layers, newLayer]);
  return newLayer;
};

/**
 * Delete a custom layer by ID
 */
export const deleteCustomLayer = (id: string): void => {
  const layers = getCustomLayers();
  const filtered = layers.filter((l) => l.id !== id);
  saveCustomLayers(filtered);
};

/**
 * Validate TileJSON format
 */
export const validateTileJSON = (
  data: unknown,
): { valid: true; data: TileJSON } | { valid: false; error: string } => {
  if (typeof data !== "object" || data === null) {
    return {
      valid: false,
      error: "不正なJSON: オブジェクト形式である必要があります",
    };
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.tiles) || obj.tiles.length === 0) {
    return {
      valid: false,
      error: "不正なTileJSON: 'tiles' 配列が必要です",
    };
  }

  if (!obj.tiles.every((t: unknown) => typeof t === "string")) {
    return {
      valid: false,
      error: "不正なTileJSON: 'tiles' は文字列の配列である必要があります",
    };
  }

  if (Array.isArray(obj.vector_layers) && obj.vector_layers.length > 0) {
    return {
      valid: false,
      error:
        "ベクタータイルの TileJSON には対応していません。Style Specification 形式の URL を使用してください。",
    };
  }

  return {
    valid: true,
    data: {
      tiles: obj.tiles,
      minzoom: obj.minzoom as number | undefined,
      maxzoom: obj.maxzoom as number | undefined,
      name: obj.name as string | undefined,
      attribution: obj.attribution as string | undefined,
    },
  };
};

/**
 * Validate MapLibre Style Specification format
 */
export const validateStyleSpec = (
  data: unknown,
):
  | { valid: true; data: StyleSpecification }
  | { valid: false; error: string } => {
  if (typeof data !== "object" || data === null) {
    return {
      valid: false,
      error: "不正なJSON: オブジェクト形式である必要があります",
    };
  }

  const obj = data as Record<string, unknown>;

  if (obj.version !== 8) {
    return {
      valid: false,
      error: "不正なStyle Spec: 'version' は 8 である必要があります",
    };
  }

  if (typeof obj.sources !== "object" || obj.sources === null) {
    return {
      valid: false,
      error: "不正なStyle Spec: 'sources' オブジェクトが必要です",
    };
  }

  if (!Array.isArray(obj.layers)) {
    return {
      valid: false,
      error: "不正なStyle Spec: 'layers' 配列が必要です",
    };
  }

  // After validation, we can safely cast to StyleSpecification
  return {
    valid: true,
    data: data as StyleSpecification,
  };
};

/**
 * Detect format from JSON content (TileJSON or Style Spec)
 */
export const detectFormat = (
  data: unknown,
):
  | { format: "tilejson" | "style"; data: TileJSON | StyleSpecification }
  | { format: null; error: string } => {
  // Try Style Spec first (more specific)
  const styleResult = validateStyleSpec(data);
  if (styleResult.valid) {
    return { format: "style", data: styleResult.data };
  }

  // Try TileJSON
  const tileJsonResult = validateTileJSON(data);
  if (tileJsonResult.valid) {
    return { format: "tilejson", data: tileJsonResult.data };
  }

  return {
    format: null,
    error:
      "形式を検出できませんでした。TileJSON（'tiles' 配列を含む）または MapLibre Style Spec（version: 8, sources, layers を含む）のいずれかである必要があります。",
  };
};

/**
 * Fetch URL and validate content
 */
export const fetchAndValidate = async (
  url: string,
): Promise<
  | {
      success: true;
      format: "tilejson" | "style";
      data: TileJSON | StyleSpecification;
    }
  | { success: false; error: string }
> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        success: false,
        error: `URLの取得に失敗しました: ${String(response.status)} ${response.statusText}`,
      };
    }

    const contentType = response.headers.get("content-type") || "";
    if (
      !contentType.includes("application/json") &&
      !contentType.includes("text/plain") &&
      !contentType.includes("text/json")
    ) {
      // Still try to parse as JSON even if content-type is unexpected
    }

    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return {
        success: false,
        error: "URLから取得したレスポンスが不正なJSONです",
      };
    }

    const detected = detectFormat(data);
    if (detected.format === null) {
      return { success: false, error: detected.error };
    }

    return { success: true, format: detected.format, data: detected.data };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { success: false, error: `URLの取得に失敗しました: ${message}` };
  }
};

/**
 * Parse and validate file content
 */
export const parseAndValidate = (
  content: string,
):
  | {
      success: true;
      format: "tilejson" | "style";
      data: TileJSON | StyleSpecification;
    }
  | { success: false; error: string } => {
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    return { success: false, error: "不正なJSONコンテンツです" };
  }

  const detected = detectFormat(data);
  if (detected.format === null) {
    return { success: false, error: detected.error };
  }

  return { success: true, format: detected.format, data: detected.data };
};

/**
 * Get zoom range from validated data
 */
export const getZoomRange = (
  format: "tilejson" | "style",
  data: TileJSON | StyleSpecification,
): { minZoom: number; maxZoom: number } => {
  if (format === "tilejson") {
    const tileJson = data as TileJSON;
    return {
      minZoom: tileJson.minzoom ?? 0,
      maxZoom: tileJson.maxzoom ?? 22,
    };
  }

  // For style spec, try to infer from sources
  const style = data as StyleSpecification;
  let minZoom = 0;
  let maxZoom = 22;

  for (const source of Object.values(style.sources)) {
    if ("minzoom" in source && typeof source.minzoom === "number") {
      minZoom = Math.max(minZoom, source.minzoom);
    }
    if ("maxzoom" in source && typeof source.maxzoom === "number") {
      maxZoom = Math.min(maxZoom, source.maxzoom);
    }
  }

  return { minZoom, maxZoom };
};
