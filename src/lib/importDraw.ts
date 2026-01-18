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

export type ImportFormat = "geojson" | "kml";

// Default style values (from getPolygonModeStyle.ts and getLineStringModeStyle.ts)
const DEFAULT_FILL_COLOR = "#0011FF10";
const DEFAULT_OUTLINE_COLOR = "#0011FFFF";
const DEFAULT_OUTLINE_WIDTH = 2;
const DEFAULT_LINESTRING_COLOR = "#0011FFFF";
const DEFAULT_LINESTRING_WIDTH = 2;

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

/**
 * Check if an existing TerraDraw color property is valid (#RRGGBBAA format)
 * These properties are already in the correct format from previous exports
 */
function isValidExistingColor(color: unknown): boolean {
  return (
    typeof color === "string" && color.startsWith("#") && color.length === 9
  );
}

/**
 * Normalize color with opacity to #RRGGBBAA format
 * togeojson outputs colors as #RRGGBB and opacity as separate properties.
 * TerraDraw/MapLibre expects #RRGGBBAA format with alpha channel.
 *
 * @param color - Color string (#RRGGBB or #RRGGBBAA)
 * @param opacity - Opacity value (0-1), undefined means use FF (fully opaque)
 * @param defaultColor - Fallback default color if input is invalid
 */
function normalizeColorWithOpacity(
  color: unknown,
  opacity: unknown,
  defaultColor: string,
): string {
  // If color is invalid, return default
  if (!color || typeof color !== "string" || !color.startsWith("#")) {
    return defaultColor;
  }

  // If already 8 characters (#RRGGBBAA), return as-is
  if (color.length === 9) {
    return color;
  }

  // If 6 characters (#RRGGBB), add alpha channel
  if (color.length === 7) {
    // Convert opacity to hex (default is FF = fully opaque)
    let alphaHex = "FF";
    if (typeof opacity === "number" && opacity >= 0 && opacity <= 1) {
      alphaHex = Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")
        .toUpperCase();
    }
    return `${color}${alphaHex}`;
  }

  return defaultColor;
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
 * Convert simplestyle properties to TerraDraw properties
 *
 * Priority order for colors:
 * 1. Existing TerraDraw properties (fillColor, outlineColor, lineStringColor)
 * 2. Simplestyle properties (fill, stroke) if valid and not togeojson default
 * 3. Application defaults
 */
function convertSimplestyleToTerraDraw(
  properties: SimplestyleProperties,
  geometryType: string,
): Record<string, unknown> {
  const terraDrawProps: Record<string, unknown> = { ...properties };
  const isLine = geometryType === "LineString";

  if (isLine) {
    // LineString: prioritize existing lineStringColor from TerraDraw export
    if (!isValidExistingColor(properties.lineStringColor)) {
      const strokeColor = properties.stroke;
      if (
        isValidColor(strokeColor) &&
        strokeColor !== TOGEOJSON_DEFAULT_COLOR
      ) {
        // Use simplestyle stroke if valid and not default
        terraDrawProps.lineStringColor = normalizeColorWithOpacity(
          strokeColor,
          properties["stroke-opacity"],
          DEFAULT_LINESTRING_COLOR,
        );
      } else {
        // Fall back to app default
        terraDrawProps.lineStringColor = DEFAULT_LINESTRING_COLOR;
      }
    }

    if (properties["stroke-width"] !== undefined) {
      terraDrawProps.lineStringWidth = properties["stroke-width"];
    } else if (!terraDrawProps.lineStringWidth) {
      terraDrawProps.lineStringWidth = DEFAULT_LINESTRING_WIDTH;
    }
  } else {
    // Polygon: prioritize existing fillColor from TerraDraw export
    if (!isValidExistingColor(properties.fillColor)) {
      const fillColor = properties.fill;
      if (isValidColor(fillColor) && fillColor !== TOGEOJSON_DEFAULT_COLOR) {
        // Use simplestyle fill if valid and not default
        terraDrawProps.fillColor = normalizeColorWithOpacity(
          fillColor,
          properties["fill-opacity"],
          DEFAULT_FILL_COLOR,
        );
      } else {
        // Fall back to app default
        terraDrawProps.fillColor = DEFAULT_FILL_COLOR;
      }
    }

    // Polygon: prioritize existing outlineColor from TerraDraw export
    if (!isValidExistingColor(properties.outlineColor)) {
      const strokeColor = properties.stroke;
      if (
        isValidColor(strokeColor) &&
        strokeColor !== TOGEOJSON_DEFAULT_COLOR
      ) {
        // Use simplestyle stroke if valid and not default
        terraDrawProps.outlineColor = normalizeColorWithOpacity(
          strokeColor,
          properties["stroke-opacity"],
          DEFAULT_OUTLINE_COLOR,
        );
      } else {
        // Fall back to app default
        terraDrawProps.outlineColor = DEFAULT_OUTLINE_COLOR;
      }
    }

    if (properties["stroke-width"] !== undefined) {
      terraDrawProps.outlineWidth = properties["stroke-width"];
    } else if (!terraDrawProps.outlineWidth) {
      terraDrawProps.outlineWidth = DEFAULT_OUTLINE_WIDTH;
    }
  }

  // Remove simplestyle properties (now merged into TerraDraw properties)
  delete terraDrawProps.stroke;
  delete terraDrawProps.fill;
  delete terraDrawProps["stroke-opacity"];
  delete terraDrawProps["fill-opacity"];
  delete terraDrawProps["stroke-width"];
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
      } else {
        // Convert simplestyle for geometric features
        terraDrawProps = convertSimplestyleToTerraDraw(
          properties as SimplestyleProperties,
          geometryType,
        );
      }

      // Set mode and source
      terraDrawProps.mode = mode;
      terraDrawProps.source = filename;

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
