import { TerraDraw, GeoJSONStoreFeatures } from "terra-draw";
import { kml } from "@tmcw/togeojson";
import { DrawMode } from "@/hooks/store/drawState";
import {
  DEFAULT_TEXT_COLOR,
  DEFAULT_TEXT_SIZE,
  DEFAULT_TEXT_BOLD,
  DEFAULT_TEXT_ITALIC,
  DEFAULT_TEXT_UNDERLINE,
  DEFAULT_IS_HTML,
  DEFAULT_TEXT_CONTENT,
} from "@/lib/draw/getTextModeStyle";
import {
  DEFAULT_FILL,
  DEFAULT_FILL_OPACITY,
  DEFAULT_STROKE,
  DEFAULT_STROKE_OPACITY,
  DEFAULT_STROKE_WIDTH,
} from "@/lib/draw/getPolygonModeStyle";
import {
  DEFAULT_STROKE as DEFAULT_LINE_STROKE,
  DEFAULT_STROKE_OPACITY as DEFAULT_LINE_STROKE_OPACITY,
  DEFAULT_STROKE_WIDTH as DEFAULT_LINE_STROKE_WIDTH,
} from "@/lib/draw/getLineStringModeStyle";
import {
  DEFAULT_MARKER_SYMBOL,
  DEFAULT_MARKER_SIZE,
  MarkerSize,
} from "@/lib/draw/getPointModeStyle";

export type ImportFormat = "geojson" | "kml";

// togeojson's default color - should be ignored as it means "no color specified"
const TOGEOJSON_DEFAULT_COLOR = "#555555";

/**
 * Check if a value is a valid hex color string (#RRGGBB or #RRGGBBAA)
 */
function isValidColor(color: unknown): color is string {
  return (
    typeof color === "string" && color.startsWith("#") && color.length >= 7
  );
}

export interface ImportResult {
  added: number;
  failed: number;
  errors: string[];
}

interface SimplestyleProperties {
  stroke?: string;
  "stroke-width"?: number;
  "stroke-opacity"?: number;
  fill?: string;
  "fill-opacity"?: number;
  [key: string]: unknown;
}

/**
 * Map geometry type to TerraDraw mode
 */
function getModeFromGeometry(
  geometryType: string,
  properties: Record<string, unknown>,
): DrawMode | null {
  switch (geometryType) {
    case "Point":
      // Check if this point should be a text feature
      // Text features have textContent, text, or name properties
      if (
        properties.textContent !== undefined ||
        properties.text !== undefined ||
        properties.name !== undefined
      ) {
        return "text";
      }
      return "point";
    case "LineString":
      return "linestring";
    case "Polygon":
      return "polygon";
    default:
      return null;
  }
}

/**
 * Convert simplestyle properties to TerraDraw format
 * Simplestyle properties are kept as-is, with defaults applied where missing
 */
function convertSimplestyleToTerraDraw(
  properties: SimplestyleProperties,
  geometryType: string,
): Record<string, unknown> {
  const terraDrawProps: Record<string, unknown> = { ...properties };
  const isLine = geometryType === "LineString";

  if (isLine) {
    // LineString: ensure stroke properties exist
    if (!isValidColor(terraDrawProps.stroke)) {
      terraDrawProps.stroke = DEFAULT_LINE_STROKE;
      terraDrawProps["stroke-opacity"] = DEFAULT_LINE_STROKE_OPACITY;
    } else if (terraDrawProps.stroke === TOGEOJSON_DEFAULT_COLOR) {
      // Replace togeojson default with app default
      terraDrawProps.stroke = DEFAULT_LINE_STROKE;
      terraDrawProps["stroke-opacity"] = DEFAULT_LINE_STROKE_OPACITY;
    } else if (typeof terraDrawProps["stroke-opacity"] !== "number") {
      terraDrawProps["stroke-opacity"] = DEFAULT_LINE_STROKE_OPACITY;
    }

    if (typeof terraDrawProps["stroke-width"] !== "number") {
      terraDrawProps["stroke-width"] = DEFAULT_LINE_STROKE_WIDTH;
    }
  } else {
    // Polygon: ensure fill properties exist
    if (!isValidColor(terraDrawProps.fill)) {
      terraDrawProps.fill = DEFAULT_FILL;
      terraDrawProps["fill-opacity"] = DEFAULT_FILL_OPACITY;
    } else if (terraDrawProps.fill === TOGEOJSON_DEFAULT_COLOR) {
      // Replace togeojson default with app default
      terraDrawProps.fill = DEFAULT_FILL;
      terraDrawProps["fill-opacity"] = DEFAULT_FILL_OPACITY;
    } else if (typeof terraDrawProps["fill-opacity"] !== "number") {
      terraDrawProps["fill-opacity"] = DEFAULT_FILL_OPACITY;
    }

    // Polygon: ensure stroke properties exist
    if (!isValidColor(terraDrawProps.stroke)) {
      terraDrawProps.stroke = DEFAULT_STROKE;
      terraDrawProps["stroke-opacity"] = DEFAULT_STROKE_OPACITY;
    } else if (terraDrawProps.stroke === TOGEOJSON_DEFAULT_COLOR) {
      // Replace togeojson default with app default
      terraDrawProps.stroke = DEFAULT_STROKE;
      terraDrawProps["stroke-opacity"] = DEFAULT_STROKE_OPACITY;
    } else if (typeof terraDrawProps["stroke-opacity"] !== "number") {
      terraDrawProps["stroke-opacity"] = DEFAULT_STROKE_OPACITY;
    }

    if (typeof terraDrawProps["stroke-width"] !== "number") {
      terraDrawProps["stroke-width"] = DEFAULT_STROKE_WIDTH;
    }
  }

  // Remove custom styleUrl (used by this app's KML export for encoding colors)
  delete terraDrawProps.styleUrl;

  return terraDrawProps;
}

/**
 * Initialize text properties for text mode features
 */
function initializeTextProperties(
  properties: Record<string, unknown>,
): Record<string, unknown> {
  const textProps: Record<string, unknown> = { ...properties };

  // Set textContent from various possible sources
  if (!textProps.textContent) {
    textProps.textContent =
      (properties.text as string) ||
      (properties.name as string) ||
      (properties.title as string) ||
      DEFAULT_TEXT_CONTENT;
  }

  // Initialize text styling properties with defaults if missing
  if (textProps.textColor === undefined) {
    textProps.textColor = DEFAULT_TEXT_COLOR;
  }
  if (textProps.textSize === undefined) {
    textProps.textSize = DEFAULT_TEXT_SIZE;
  }
  if (textProps.textBold === undefined) {
    textProps.textBold = DEFAULT_TEXT_BOLD;
  }
  if (textProps.textItalic === undefined) {
    textProps.textItalic = DEFAULT_TEXT_ITALIC;
  }
  if (textProps.textUnderline === undefined) {
    textProps.textUnderline = DEFAULT_TEXT_UNDERLINE;
  }
  if (textProps.isHtml === undefined) {
    textProps.isHtml = DEFAULT_IS_HTML;
  }

  // Clean up alternative property names
  delete textProps.text;
  delete textProps.name;
  delete textProps.title;

  return textProps;
}

/**
 * Check if a value is a valid marker size
 */
function isValidMarkerSize(size: unknown): size is MarkerSize {
  return (
    typeof size === "string" && ["small", "medium", "large"].includes(size)
  );
}

/**
 * Initialize point properties for point mode features
 */
function initializePointProperties(
  properties: Record<string, unknown>,
): Record<string, unknown> {
  const pointProps: Record<string, unknown> = { ...properties };

  // Initialize marker-symbol with default if missing or invalid
  if (typeof pointProps["marker-symbol"] !== "string") {
    pointProps["marker-symbol"] = DEFAULT_MARKER_SYMBOL;
  }

  // Initialize marker-size with default if missing or invalid
  if (!isValidMarkerSize(pointProps["marker-size"])) {
    pointProps["marker-size"] = DEFAULT_MARKER_SIZE;
  }

  return pointProps;
}

/**
 * Validate coordinates structure
 */
function validateCoordinates(geometry: unknown): boolean {
  if (!geometry || typeof geometry !== "object") return false;

  const geom = geometry as { type?: string; coordinates?: unknown };

  switch (geom.type) {
    case "Point":
      return (
        Array.isArray(geom.coordinates) &&
        geom.coordinates.length >= 2 &&
        typeof geom.coordinates[0] === "number" &&
        typeof geom.coordinates[1] === "number"
      );

    case "LineString":
      return (
        Array.isArray(geom.coordinates) &&
        geom.coordinates.length >= 2 &&
        geom.coordinates.every(
          (coord) =>
            Array.isArray(coord) &&
            coord.length >= 2 &&
            typeof coord[0] === "number" &&
            typeof coord[1] === "number",
        )
      );

    case "Polygon":
      return (
        Array.isArray(geom.coordinates) &&
        geom.coordinates.length >= 1 &&
        geom.coordinates.every(
          (ring) =>
            Array.isArray(ring) &&
            ring.length >= 4 &&
            ring.every(
              (coord) =>
                Array.isArray(coord) &&
                coord.length >= 2 &&
                typeof coord[0] === "number" &&
                typeof coord[1] === "number",
            ),
        )
      );

    default:
      return false;
  }
}

/**
 * Parse KML content to GeoJSON
 */
function parseKML(content: string): GeoJSON.FeatureCollection {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(content, "text/xml");

  // Check for parsing errors
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new Error("KMLファイルの形式が正しくありません");
  }

  // Convert to GeoJSON
  const geoJSON = kml(xmlDoc);
  return geoJSON as GeoJSON.FeatureCollection;
}

/**
 * Parse GeoJSON content
 */
function parseGeoJSON(content: string): GeoJSON.FeatureCollection {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("GeoJSONファイルの形式が正しくありません");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("type" in parsed) ||
    parsed.type !== "FeatureCollection"
  ) {
    throw new Error("FeatureCollectionではありません");
  }

  return parsed as GeoJSON.FeatureCollection;
}

/**
 * Parse file content based on format
 */
export function parseFileContent(
  content: string,
  format: ImportFormat,
): GeoJSON.FeatureCollection {
  if (format === "kml") {
    return parseKML(content);
  } else {
    return parseGeoJSON(content);
  }
}

/**
 * Import drawing data from file
 */
export function importDrawData(
  td: TerraDraw,
  content: string,
  format: ImportFormat,
  filename: string,
  mapId: string,
): ImportResult {
  const result: ImportResult = {
    added: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Parse file content
    const featureCollection = parseFileContent(content, format);

    if (featureCollection.features.length === 0) {
      result.errors.push("インポート可能なフィーチャがありませんでした");
      return result;
    }

    // Process each feature
    const validFeatures: GeoJSONStoreFeatures[] = [];

    for (const feature of featureCollection.features) {
      const geometryType = feature.geometry.type;
      const properties = feature.properties || {};

      // Check if geometry type is supported
      // Pass properties to detect text features
      const mode = getModeFromGeometry(geometryType, properties);
      if (!mode) {
        result.failed++;
        result.errors.push(
          `サポートされていないジオメトリタイプ: ${geometryType}`,
        );
        continue;
      }

      // Validate coordinates
      if (!validateCoordinates(feature.geometry)) {
        result.failed++;
        result.errors.push("座標データが不正です");
        continue;
      }

      // Convert properties based on feature mode
      let terraDrawProps: Record<string, unknown>;

      if (mode === "text") {
        // Initialize text properties
        terraDrawProps = initializeTextProperties(properties);
      } else if (mode === "point") {
        // Initialize point/marker properties
        terraDrawProps = initializePointProperties(properties);
      } else {
        // Convert simplestyle for geometric features
        terraDrawProps = convertSimplestyleToTerraDraw(
          properties as SimplestyleProperties,
          geometryType,
        );
      }

      // Set mode, source, and mapId
      terraDrawProps.mode = mode;
      terraDrawProps.source = filename;
      terraDrawProps.mapId = mapId;

      // Create TerraDraw feature
      validFeatures.push({
        type: "Feature",
        geometry: feature.geometry as GeoJSONStoreFeatures["geometry"],
        properties: terraDrawProps as GeoJSONStoreFeatures["properties"],
      });
    }

    // Add features to TerraDraw
    if (validFeatures.length > 0) {
      const results = td.addFeatures(validFeatures);

      for (const addResult of results) {
        if (addResult.valid) {
          result.added++;
        } else {
          result.failed++;
          result.errors.push(
            addResult.reason || "フィーチャの追加に失敗しました",
          );
        }
      }
    }

    return result;
  } catch (error) {
    result.failed++;
    result.errors.push(
      error instanceof Error ? error.message : "不明なエラーが発生しました",
    );
    return result;
  }
}
